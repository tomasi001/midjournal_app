from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func

from src.data_models.schemas import JournalEntryCreate
from src.db.models import JournalEntry as JournalEntryModel
from src.interfaces.message_queue_client import MessageQueueClient
from src.text_processing.service import TextProcessingService
from src.interfaces.vector_store_client import VectorStoreClient


class JournalService:
    def __init__(
        self,
        db_session: Session,
        mq_client: MessageQueueClient,
        text_processing_service: TextProcessingService,
        vector_store_client: VectorStoreClient,
    ):
        self.db_session = db_session
        self.mq_client = mq_client
        self.text_processing_service = text_processing_service
        self.vector_store_client = vector_store_client
        self.analysis_queue_name = "journal-analysis-queue"

    def create_journal_entry(
        self, user_id: UUID, entry_data: JournalEntryCreate
    ) -> JournalEntryModel:
        # Step 1: Calculate the next entry number for the user
        max_entry_number = (
            self.db_session.query(func.max(JournalEntryModel.entry_number))
            .filter(JournalEntryModel.user_id == user_id)
            .scalar()
        )
        next_entry_number = (max_entry_number or 0) + 1

        # Step 2: Create and save the journal entry
        db_entry = JournalEntryModel(
            **entry_data.model_dump(), user_id=user_id, entry_number=next_entry_number
        )
        self.db_session.add(db_entry)
        self.db_session.commit()
        self.db_session.refresh(db_entry)

        # Process text for vector store
        text_chunks, embeddings = self.text_processing_service.process_text(
            db_entry.content
        )
        documents_to_add = [
            {"text": chunk, "vector": embedding, "source": "journal"}
            for chunk, embedding in zip(text_chunks, embeddings)
        ]
        self.vector_store_client.add_documents(
            user_id=user_id, documents=documents_to_add
        )

        # Queue for qualitative analysis
        message = {
            "journal_entry_id": str(db_entry.id),
            "user_id": str(user_id),
            "content": db_entry.content,
        }
        self.mq_client.publish(queue_name=self.analysis_queue_name, message=message)
        print(
            f" [x] Sent message to queue '{self.analysis_queue_name}' for entry {db_entry.id}"
        )

        return db_entry

    def get_journal_entries(self, user_id: UUID) -> list[JournalEntryModel]:
        return (
            self.db_session.query(JournalEntryModel)
            .filter(JournalEntryModel.user_id == user_id)
            .order_by(JournalEntryModel.created_at.desc())
            .all()
        )

    def get_journal_entry(
        self, user_id: UUID, entry_id: UUID
    ) -> JournalEntryModel | None:
        return (
            self.db_session.query(JournalEntryModel)
            .filter(
                JournalEntryModel.user_id == user_id, JournalEntryModel.id == entry_id
            )
            .first()
        )

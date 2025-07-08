import uuid

from src.interfaces.document_ingestion_service import DocumentIngestionService
from src.interfaces.message_queue_client import MessageQueueClient


class DocumentIngestionServiceImpl(DocumentIngestionService):

    INGESTION_QUEUE_NAME = "ingestion-queue"

    def __init__(self, message_queue_client: MessageQueueClient):
        self._mq_client = message_queue_client

    def ingest_text(self, user_id: uuid.UUID, text: str):
        """
        Publishes a message to the ingestion queue with the user_id and text.
        """
        if not text:
            raise ValueError("Cannot ingest empty text.")

        message = {"user_id": str(user_id), "text": text}

        self._mq_client.publish(queue_name=self.INGESTION_QUEUE_NAME, message=message)
        print(
            f"Published ingestion task for user {user_id} to queue '{self.INGESTION_QUEUE_NAME}'"
        )

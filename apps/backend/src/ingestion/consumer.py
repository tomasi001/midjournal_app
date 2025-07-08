import sys
import os
import uuid
from sqlalchemy.orm import Session

# Add the project root to the Python path to allow for absolute imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.message_queue.client import RabbitMQClient
from src.text_processing.service import TextProcessingService
from src.vector_store.clients.qdrant import QdrantVectorStoreClient
from src.db.database import SessionLocal
from src.db.models import Document


def process_ingestion_message(db: Session, message_data: dict):
    """
    The core logic for processing an ingestion message.
    """
    print("Processing new ingestion message...")

    user_id_str = message_data.get("user_id")
    text = message_data.get("text")

    if not user_id_str or not text:
        print("Message is missing user_id or text. Skipping.")
        return

    user_id = uuid.UUID(user_id_str)

    # 1. Create a document record in PostgreSQL to track the ingestion process
    db_document = Document(
        user_id=user_id,
        source_name="text_ingestion",  # In the future, this could be a filename
        status="processing",
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    print(f"Created document record {db_document.id} for user {user_id}")

    try:
        # 2. Chunk and embed the text
        text_processor = TextProcessingService()
        processed_chunks = text_processor.chunk_and_embed_text(text)
        print(f"Text processed into {len(processed_chunks)} chunks.")

        # 3. Store the chunks and embeddings in the vector store
        vector_store = QdrantVectorStoreClient()
        vector_store.add_documents(user_id=user_id, documents=processed_chunks)
        print("Chunks added to vector store.")

        # 4. Update the document status to 'complete'
        db_document.status = "complete"
        db.commit()
        print(
            f"Document {db_document.id} successfully processed and marked as complete."
        )

    except Exception as e:
        print(f"An error occurred during ingestion processing: {e}")
        # If something goes wrong, mark the document as 'failed'
        db_document.status = "failed"
        db.commit()
        raise  # Re-raise the exception to signal the message processing failed


def main():
    """
    Main function to start the ingestion consumer.
    """
    print("Starting ingestion consumer...")
    mq_client = RabbitMQClient()
    db_session = SessionLocal()

    def message_callback(message_data: dict):
        try:
            process_ingestion_message(db=db_session, message_data=message_data)
        except Exception as e:
            # The exception is already logged in the processing function
            # This is where you might add more robust error handling or retries
            print("Message processing failed. See logs for details.")
            # The nack is handled in the underlying client, so we don't need to do it here
            raise e  # Re-raising will cause the client to nack the message

    try:
        queue_name = "ingestion-queue"
        mq_client.subscribe(queue_name, message_callback)
    except KeyboardInterrupt:
        print("Consumer stopped by user.")
    finally:
        mq_client.close()
        db_session.close()
        print("Consumer shut down gracefully.")


if __name__ == "__main__":
    main()

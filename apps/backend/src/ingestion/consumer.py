import sys
import os
import uuid
import json
import logging
import time
from sqlalchemy.orm import Session
from typing import Dict

# Add the project root to the Python path to allow for absolute imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.message_queue.client import RabbitMQClient
from src.text_processing.service import TextProcessingService
from src.vector_store.clients.qdrant import QdrantVectorStoreClient
from src.db.database import SessionLocal
from src.db.models import Document

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


def get_dependencies() -> Dict:
    """
    Function to get the dependencies for the callback function.
    """
    return {
        "text_processing_service": TextProcessingService(),
        "vector_store_client": QdrantVectorStoreClient(),
    }


def callback(ch, method, properties, body, deps=get_dependencies()):
    """Callback function to process messages from the ingestion queue."""
    message = {}
    document_id = "N/A"
    try:
        message = json.loads(body)
        document_id = message.get("document_id", "N/A")
        user_id = message.get("user_id", "N/A")

        logging.info(
            f"Received message for document_id: {document_id}, user_id: {user_id}"
        )
        start_time = time.time()

        text_processing_service: TextProcessingService = deps["text_processing_service"]
        vector_store_client: QdrantVectorStoreClient = deps["vector_store_client"]

        logging.info(f"Starting text processing for document_id: {document_id}")
        text_chunks, embeddings = text_processing_service.process_text(message["text"])
        processing_time = time.time() - start_time
        logging.info(
            f"Text processing completed for document_id: {document_id} in {processing_time:.2f} seconds. Found {len(text_chunks)} chunks."
        )

        logging.info(f"Saving chunks to vector store for document_id: {document_id}")

        # Prepare documents in the format expected by QdrantVectorStoreClient
        documents_to_add = [
            {"text": chunk, "vector": embedding, "source": "document"}
            for chunk, embedding in zip(text_chunks, embeddings)
        ]

        vector_store_client.add_documents(
            user_id=uuid.UUID(user_id),
            documents=documents_to_add,
        )
        saving_time = time.time() - start_time - processing_time
        logging.info(
            f"Saved to vector store for document_id: {document_id} in {saving_time:.2f} seconds."
        )

        ch.basic_ack(delivery_tag=method.delivery_tag)
        total_time = time.time() - start_time
        logging.info(
            f"Successfully processed and ACKed document_id: {document_id}. Total time: {total_time:.2f} seconds."
        )

    except json.JSONDecodeError as e:
        logging.error(f"Failed to decode JSON body: {body}. Error: {e}", exc_info=True)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    except Exception as e:
        logging.error(
            f"Failed to process message for document_id: {document_id}. Error: {e}",
            exc_info=True,
        )
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def main():
    """
    Main function to start the ingestion consumer.
    """
    print("Starting ingestion consumer...")
    mq_client = RabbitMQClient()
    db_session = SessionLocal()

    try:
        queue_name = "ingestion-queue"
        mq_client.subscribe(queue_name, callback, get_dependencies)
    except KeyboardInterrupt:
        print("Consumer stopped by user.")
    finally:
        mq_client.close()
        db_session.close()
        print("Consumer shut down gracefully.")


if __name__ == "__main__":
    main()

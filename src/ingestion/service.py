import uuid
import json

from src.interfaces.document_ingestion_service import DocumentIngestionService
from src.message_queue.client import RabbitMQClient


class ConcreteDocumentIngestionService(DocumentIngestionService):

    INGESTION_QUEUE_NAME = "ingestion-queue"

    def __init__(self):
        self._mq_client = RabbitMQClient()

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

    def __del__(self):
        # Ensure the connection is closed when the service is destroyed
        if self._mq_client:
            self._mq_client.close()

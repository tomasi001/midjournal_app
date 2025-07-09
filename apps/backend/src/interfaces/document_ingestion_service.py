from typing import Protocol, Union
import uuid


class DocumentIngestionService(Protocol):
    async def ingest_document(
        self, user_id: uuid.UUID, file_bytes: bytes, content_type: str
    ) -> str:
        """
        Processes a file (text, image, pdf), extracts text, and queues for ingestion.
        Returns a document_id.
        """
        ...

    async def process_and_queue_text(self, user_id: str, text: str) -> str:
        """
        Takes raw text, assigns a document ID, and queues it for embedding.
        Returns the document_id.
        """
        ...

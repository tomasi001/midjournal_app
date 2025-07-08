from abc import ABC, abstractmethod
import uuid


class DocumentIngestionService(ABC):
    @abstractmethod
    def ingest_text(self, user_id: uuid.UUID, text: str):
        """
        Handles the business logic for ingesting a piece of raw text for a user.
        """
        pass

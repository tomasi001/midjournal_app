from abc import ABC, abstractmethod
from typing import List, Dict, Any
import uuid


class VectorStoreClient(ABC):
    @abstractmethod
    def add_documents(self, user_id: uuid.UUID, documents: List[Dict[str, Any]]):
        """
        Adds a list of documents (chunks with embeddings) to the vector store
        for a specific user.
        """
        pass

    @abstractmethod
    def query(
        self, user_id: uuid.UUID, query_embedding: List[float], top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Queries the vector store for a user to find the most relevant documents.
        """
        pass

import uuid
from typing import List, Dict, Any

from src.interfaces.query_service import QueryService
from src.interfaces.vector_store_client import VectorStoreClient
from src.text_processing.service import EmbeddingService


class QueryServiceImpl(QueryService):
    def __init__(
        self,
        embedding_service: EmbeddingService,
        vector_store_client: VectorStoreClient,
    ):
        self.embedding_service = embedding_service
        self.vector_store_client = vector_store_client

    def query(self, user_id: str, query_text: str) -> List[Dict[str, Any]]:
        """
        1. Embeds the query text.
        2. Queries the vector store for relevant chunks for the user.
        3. Returns the results.
        """
        print(f"Querying for user '{user_id}' with text: '{query_text}'")

        # 1. Embed the query text
        query_embedding = self.embedding_service.generate_embedding(query_text)

        # 2. Query the vector store
        # Convert user_id string to UUID for the client
        user_uuid = uuid.UUID(user_id)
        results = self.vector_store_client.query(
            user_id=user_uuid, query_embedding=query_embedding
        )

        print(f"Found {len(results)} results.")
        return results

import uuid
from typing import List, Dict, Any
import os
from datetime import datetime, timezone

from qdrant_client import QdrantClient, models
from qdrant_client.http.models import Distance, VectorParams, PointStruct

from src.interfaces.vector_store_client import VectorStoreClient


class QdrantVectorStoreClient(VectorStoreClient):

    COLLECTION_NAME = "journal-chunks"

    def __init__(self):
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self.client = QdrantClient(url=qdrant_url)
        self._ensure_collection_exists()

    def _ensure_collection_exists(self):
        """Creates the Qdrant collection if it doesn't exist."""
        try:
            collections = self.client.get_collections().collections
            collection_names = [collection.name for collection in collections]

            if self.COLLECTION_NAME not in collection_names:
                print(f"Collection '{self.COLLECTION_NAME}' not found. Creating it...")
                self.client.recreate_collection(
                    collection_name=self.COLLECTION_NAME,
                    vectors_config=VectorParams(size=384, distance=Distance.COSINE),
                )
                print("Collection created successfully.")
        except Exception as e:
            print(f"Failed to check or create Qdrant collection: {e}")

    def add_documents(self, user_id: uuid.UUID, documents: List[Dict[str, Any]]):
        """
        Upserts documents (chunks) into Qdrant, associated with a user_id.
        """
        points = []
        for doc in documents:
            point_id = str(uuid.uuid4())
            vector = doc.get("vector")
            text = doc.get("text")

            if not vector or not text:
                continue

            points.append(
                PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "user_id": str(user_id),
                        "text": text,
                        "created_at": datetime.now(timezone.utc).isoformat(),
                    },
                )
            )

        if not points:
            print("No valid documents to add.")
            return

        self.client.upsert(
            collection_name=self.COLLECTION_NAME, wait=True, points=points
        )
        print(f"Upserted {len(points)} points for user {user_id}")

    def query(
        self, user_id: uuid.UUID, query_embedding: List[float], top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Performs a filtered query on Qdrant to retrieve chunks for a specific user.
        """
        hits = self.client.search(
            collection_name=self.COLLECTION_NAME,
            query_vector=query_embedding,
            query_filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="user_id", match=models.MatchValue(value=str(user_id))
                    )
                ]
            ),
            limit=top_k,
        )

        return [hit.payload for hit in hits]

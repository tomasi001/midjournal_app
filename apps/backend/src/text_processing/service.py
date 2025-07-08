from typing import List, Tuple, Dict
from .chunking import TextSplitter
from .embedding import EmbeddingService


class TextProcessingService:
    def __init__(self):
        self._text_splitter = TextSplitter()
        self._embedding_service = EmbeddingService()

    def chunk_and_embed_text(self, text: str) -> List[Dict]:
        """
        Takes a raw text, splits it into chunks, and generates an embedding for each chunk.

        Returns:
            A list of dictionaries, where each dictionary contains the text chunk
            and its corresponding embedding vector.
        """
        chunks = self._text_splitter.split_text(text)
        embeddings = self._embedding_service.get_embedding(chunks)

        if len(chunks) != len(embeddings):
            raise ValueError(
                "Mismatch between number of chunks and embeddings generated."
            )

        processed_chunks = []
        for i, chunk_text in enumerate(chunks):
            processed_chunks.append({"text": chunk_text, "vector": embeddings[i]})

        return processed_chunks

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates an embedding for a single piece of text without chunking.
        Useful for embedding user queries.
        """
        return self._embedding_service.get_embedding(text)

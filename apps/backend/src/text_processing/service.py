import logging
from typing import List, Tuple
from src.text_processing.chunking import TextSplitter
from src.text_processing.embedding import EmbeddingService

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


class TextProcessingService:
    def __init__(self):
        self._text_splitter = TextSplitter()
        self._embedding_service = EmbeddingService()

    def process_text(self, text: str) -> Tuple[List[str], List[List[float]]]:
        """
        Processes a raw text string by chunking it and then creating embeddings for each chunk.
        """
        logging.info("Starting text chunking...")
        text_chunks = self._text_splitter.split_text(text)
        logging.info(f"Created {len(text_chunks)} text chunks.")

        logging.info("Starting chunk embedding...")
        embeddings = self._embedding_service.get_embedding(text_chunks)
        logging.info("Chunk embedding complete.")

        return text_chunks, embeddings

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates an embedding for a single piece of text without chunking.
        """
        return self._embedding_service.get_embedding(text)

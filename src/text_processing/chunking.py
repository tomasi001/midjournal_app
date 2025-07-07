from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List


class TextSplitter:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
        )

    def split_text(self, text: str) -> List[str]:
        """Splits a long text into smaller chunks."""
        return self._splitter.split_text(text)

from abc import ABC, abstractmethod


class DocumentParserService(ABC):
    @abstractmethod
    def parse(self, file_bytes: bytes, content_type: str) -> str:
        """
        Parses a document from its byte representation into a plain text string.

        Args:
            file_bytes: The raw bytes of the file.
            content_type: The MIME type of the file.

        Returns:
            The extracted plain text content.

        Raises:
            ValueError: If the content type is unsupported.
        """
        pass

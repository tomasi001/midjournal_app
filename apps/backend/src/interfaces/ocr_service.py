from typing import Protocol


class OCRService(Protocol):
    async def extract_text_from_image(self, image_bytes: bytes) -> str:
        """Extracts text from image bytes."""
        ...

    async def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """Extracts text from PDF bytes."""
        ...

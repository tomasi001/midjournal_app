import pytesseract
from PIL import Image
import io
from PyPDF2 import PdfReader

from src.interfaces.ocr_service import OCRService


class TesseractOCRService(OCRService):
    async def extract_text_from_image(self, image_bytes: bytes) -> str:
        """Extracts text from image bytes using Tesseract."""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            print(f"Error during image OCR: {e}")
            raise

    async def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """Extracts text from PDF bytes using PyPDF2."""
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text
        except Exception as e:
            print(f"Error during PDF text extraction: {e}")
            raise

import io
from docx import Document
from markdown_it import MarkdownIt

from src.interfaces.document_parser_service import DocumentParserService


class DocumentParserServiceImpl(DocumentParserService):
    def __init__(self):
        self._md_parser = MarkdownIt()

    def parse(self, file_bytes: bytes, content_type: str) -> str:
        """
        Parses DOCX and Markdown files into plain text.
        """
        if (
            content_type
            == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ):
            return self._parse_docx(file_bytes)
        elif content_type == "text/markdown":
            return self._parse_markdown(file_bytes)
        else:
            raise ValueError(f"Unsupported content type for parsing: {content_type}")

    def _parse_docx(self, file_bytes: bytes) -> str:
        """Extracts text from a .docx file."""
        try:
            doc = Document(io.BytesIO(file_bytes))
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            # Broad exception to catch any issues with the docx library
            raise ValueError(f"Failed to parse DOCX file: {e}")

    def _parse_markdown(self, file_bytes: bytes) -> str:
        """Extracts text from a .md file."""
        try:
            md_text = file_bytes.decode("utf-8")
            # This will render HTML, but for text extraction, we can strip tags later if needed.
            # For now, we'll assume the rendered text is sufficient.
            # A more robust solution might use an HTML-to-text converter.
            return self._md_parser.render(md_text)
        except UnicodeDecodeError:
            raise ValueError(
                "Failed to decode Markdown file. Please ensure it is UTF-8 encoded."
            )
        except Exception as e:
            raise ValueError(f"Failed to parse Markdown file: {e}")

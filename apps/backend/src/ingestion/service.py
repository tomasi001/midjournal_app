import uuid

from src.interfaces.document_ingestion_service import DocumentIngestionService
from src.interfaces.message_queue_client import MessageQueueClient
from src.interfaces.ocr_service import OCRService
from src.interfaces.document_parser_service import DocumentParserService


class DocumentIngestionServiceImpl(DocumentIngestionService):
    def __init__(
        self,
        mq_client: MessageQueueClient,
        ocr_service: OCRService,
        parser_service: DocumentParserService,
    ):
        self.mq_client = mq_client
        self.ocr_service = ocr_service
        self.parser_service = parser_service
        # In a real app, 'ingestion-queue' would come from config
        self.queue_name = "ingestion-queue"

    async def ingest_document(
        self, user_id: uuid.UUID, file_bytes: bytes, content_type: str
    ) -> str:
        text_content = ""
        if "text" in content_type and content_type != "text/markdown":
            text_content = file_bytes.decode("utf-8")
        elif "image" in content_type:
            text_content = await self.ocr_service.extract_text_from_image(file_bytes)
        elif "pdf" in content_type:
            text_content = await self.ocr_service.extract_text_from_pdf(file_bytes)
        elif (
            content_type
            == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            or content_type == "text/markdown"
        ):
            text_content = self.parser_service.parse(file_bytes, content_type)
        else:
            raise ValueError(f"Unsupported file type: {content_type}")

        if not text_content.strip():
            raise ValueError("Could not extract text from the file.")

        return await self.process_and_queue_text(
            user_id=str(user_id), text=text_content
        )

    async def process_and_queue_text(self, user_id: str, text: str) -> str:
        document_id = str(uuid.uuid4())
        message = {
            "user_id": user_id,
            "document_id": document_id,
            "text": text,
        }
        try:
            self.mq_client.publish(queue_name=self.queue_name, message=message)
            print(f" [x] Sent message to queue '{self.queue_name}'")
        except Exception as e:
            print(f"Error publishing to queue: {e}")
            raise
        return document_id

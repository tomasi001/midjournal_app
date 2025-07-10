from fastapi import Depends
from sqlalchemy.orm import Session

from src.ingestion.service import DocumentIngestionServiceImpl
from src.message_queue.client import RabbitMQClient
from src.ocr.service import TesseractOCRService
from src.parsing.service import DocumentParserServiceImpl
from src.text_processing.service import TextProcessingService
from src.vector_store.clients.qdrant import QdrantVectorStoreClient
from src.query.service import QueryServiceImpl
from src.journal.service import JournalService
from src.db.database import get_db
from src.suggestions.service import LLMQuerySuggestionService
from src.llm.service import OllamaInferenceService

# --- Singletons ---
# These instances are created once when the module is first imported.
mq_client_singleton = RabbitMQClient()
ocr_service_singleton = TesseractOCRService()
parser_service_singleton = DocumentParserServiceImpl()
text_processing_singleton = TextProcessingService()
vector_store_singleton = QdrantVectorStoreClient()


def get_rabbitmq_client() -> RabbitMQClient:
    return mq_client_singleton


def get_text_processing_service() -> TextProcessingService:
    return text_processing_singleton


def get_vector_store_client() -> QdrantVectorStoreClient:
    return vector_store_singleton


def get_document_ingestion_service():
    """
    Dependency provider for the Document Ingestion Service.
    Returns a singleton instance with its own dependencies pre-filled.
    """
    return DocumentIngestionServiceImpl(
        mq_client=mq_client_singleton,
        ocr_service=ocr_service_singleton,
        parser_service=parser_service_singleton,
    )


# --- Service Dependency Providers ---
def get_journal_service(
    db: Session = Depends(get_db),
    text_processing_service: TextProcessingService = Depends(
        get_text_processing_service
    ),
    vector_store_client: QdrantVectorStoreClient = Depends(get_vector_store_client),
    mq_client: RabbitMQClient = Depends(get_rabbitmq_client),
) -> JournalService:
    return JournalService(
        db_session=db,
        text_processing_service=text_processing_service,
        vector_store_client=vector_store_client,
        mq_client=mq_client,
    )


def get_suggestion_service(
    db: Session = Depends(get_db),
) -> LLMQuerySuggestionService:
    # Following the pattern in query.py, we instantiate the LLM service directly.
    llm_service = OllamaInferenceService()
    return LLMQuerySuggestionService(llm_service=llm_service, db_session=db)


def get_query_service():
    """
    Dependency provider for the Query Service.
    """
    return QueryServiceImpl(
        embedding_service=text_processing_singleton,
        vector_store_client=vector_store_singleton,
    )

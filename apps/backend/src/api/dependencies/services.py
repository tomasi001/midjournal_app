from src.ingestion.service import DocumentIngestionServiceImpl
from src.message_queue.client import RabbitMQClient
from src.ocr.service import TesseractOCRService
from src.text_processing.service import TextProcessingService
from src.vector_store.clients.qdrant import QdrantVectorStoreClient
from src.query.service import QueryServiceImpl

# --- Singletons ---
# These instances are created once when the module is first imported.
mq_client_singleton = RabbitMQClient()
ocr_service_singleton = TesseractOCRService()
text_processing_singleton = TextProcessingService()
vector_store_singleton = QdrantVectorStoreClient()


def get_document_ingestion_service():
    """
    Dependency provider for the Document Ingestion Service.
    Returns a singleton instance with its own dependencies pre-filled.
    """
    return DocumentIngestionServiceImpl(
        mq_client=mq_client_singleton, ocr_service=ocr_service_singleton
    )


def get_query_service():
    """
    Dependency provider for the Query Service.
    """
    return QueryServiceImpl(
        embedding_service=text_processing_singleton,
        vector_store_client=vector_store_singleton,
    )

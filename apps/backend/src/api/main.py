from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.db.database import create_tables
from src.api.routers import auth, ingestion, query, tts
from src.ingestion.service import DocumentIngestionServiceImpl
from src.message_queue.client import RabbitMQClient
from src.text_processing.service import EmbeddingService
from src.vector_store.clients.qdrant import QdrantVectorStoreClient
from src.interfaces.document_ingestion_service import DocumentIngestionService
from src.interfaces.query_service import QueryService
from src.query.service import QueryServiceImpl
from src.ocr.service import TesseractOCRService
from src.interfaces.ocr_service import OCRService
from src.interfaces.message_queue_client import MessageQueueClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup
    print("Creating database tables...")
    create_tables()
    print("Database tables created.")

    # Service Instantiation for services that need to be singletons
    # or have a startup lifecycle.
    embedding_service = EmbeddingService()
    vector_store_client = QdrantVectorStoreClient()
    query_service_impl = QueryServiceImpl(
        embedding_service=embedding_service, vector_store_client=vector_store_client
    )

    # Dependency Overrides
    app.dependency_overrides[QueryService] = lambda: query_service_impl
    app.dependency_overrides[MessageQueueClient] = lambda: RabbitMQClient()
    app.dependency_overrides[OCRService] = lambda: TesseractOCRService()
    # DocumentIngestionService will be created by FastAPI on-demand
    app.dependency_overrides[DocumentIngestionService] = DocumentIngestionServiceImpl

    yield
    # On shutdown
    print("Application shutting down.")


app = FastAPI(title="MidJournal API", lifespan=lifespan)

# CORS configuration
origins = [
    "http://localhost:3000",  # Allow frontend origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(ingestion.router)
app.include_router(query.router)
app.include_router(tts.router)


@app.get("/")
def read_root():
    """A simple endpoint to confirm the API is running."""
    return {"message": "Welcome to the MidJournal API!"}


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "ok"}

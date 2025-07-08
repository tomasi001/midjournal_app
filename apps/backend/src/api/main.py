from fastapi import FastAPI
from contextlib import asynccontextmanager

from src.db.database import engine, Base, create_tables
from src.api.routers import auth, ingestion
from src.ingestion.service import DocumentIngestionServiceImpl
from src.message_queue.client import RabbitMQClient
from src.text_processing.service import TextProcessingService, EmbeddingService
from src.vector_store.clients.qdrant import QdrantVectorStoreClient
from src.interfaces.document_ingestion_service import DocumentIngestionService
from src.api.routers import query
from src.interfaces.query_service import QueryService
from src.query.service import QueryServiceImpl


@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup
    print("Creating database tables...")
    create_tables()
    print("Database tables created.")
    # Service Instantiation
    rabbitmq_client = RabbitMQClient()
    ingestion_service = DocumentIngestionServiceImpl(
        message_queue_client=rabbitmq_client
    )
    embedding_service = EmbeddingService()
    vector_store_client = QdrantVectorStoreClient()
    query_service_impl = QueryServiceImpl(
        embedding_service=embedding_service, vector_store_client=vector_store_client
    )
    # Dependency Overrides
    app.dependency_overrides[DocumentIngestionService] = lambda: ingestion_service
    app.dependency_overrides[QueryService] = lambda: query_service_impl
    yield
    # On shutdown
    print("Application shutting down.")


app = FastAPI(title="MidJournal API", lifespan=lifespan)

app.include_router(auth.router)
app.include_router(ingestion.router)
app.include_router(query.router)


@app.get("/")
def read_root():
    """A simple endpoint to confirm the API is running."""
    return {"message": "Welcome to the MidJournal API!"}


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "ok"}

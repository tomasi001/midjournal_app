from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from starlette.responses import Response
import time

from src.db.database import create_tables
from src.api.routers import (
    auth,
    ingestion,
    query,
    tts,
    journal,
    suggestions,
    ocr,
    images,
)
from src.api.metrics import REQUEST_COUNT, REQUEST_LATENCY
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST


@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup
    print("Creating database tables...")
    create_tables()
    print("Database tables created.")

    yield
    # On shutdown
    print("Application shutting down.")


app = FastAPI(title="MidJournal API", lifespan=lifespan)

# CORS configuration
origins = [
    "http://localhost:3000",  # Allow frontend origin
    "https://midjournal-app.vercel.app",
    "https://midjournal.open-apis.org",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    endpoint = request.url.path
    method = request.method
    status_code = response.status_code

    REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(process_time)
    REQUEST_COUNT.labels(
        method=method, endpoint=endpoint, status_code=status_code
    ).inc()

    return response


# --- Routers ---
app.include_router(auth.router)
app.include_router(ingestion.router)
app.include_router(query.router)
app.include_router(tts.router)
app.include_router(journal.router)
app.include_router(suggestions.router)
app.include_router(ocr.router)
app.include_router(images.router)


@app.get("/")
def read_root():
    """A simple endpoint to confirm the API is running."""
    return {"message": "Welcome to the MidJournal API!"}


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "ok"}


@app.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

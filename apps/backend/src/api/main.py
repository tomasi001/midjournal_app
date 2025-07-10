from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.db.database import create_tables
from src.api.routers import auth, ingestion, query, tts, journal, suggestions


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
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Routers ---
app.include_router(auth.router)
app.include_router(ingestion.router)
app.include_router(query.router)
app.include_router(tts.router)
app.include_router(journal.router)
app.include_router(suggestions.router)


@app.get("/")
def read_root():
    """A simple endpoint to confirm the API is running."""
    return {"message": "Welcome to the MidJournal API!"}


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "ok"}

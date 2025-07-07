from fastapi import FastAPI
from contextlib import asynccontextmanager

from src.api.routers import auth, ingestion
from src.db.database import create_tables


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

app.include_router(auth.router)
app.include_router(ingestion.router)


@app.get("/")
def read_root():
    """A simple endpoint to confirm the API is running."""
    return {"message": "Welcome to the MidJournal API!"}


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "ok"}

from fastapi import APIRouter, Depends, Body, status
from sqlalchemy.orm import Session

from src.data_models.schemas import User
from src.api.dependencies.auth import get_current_active_user
from src.ingestion.service import ConcreteDocumentIngestionService

router = APIRouter(
    prefix="/ingest",
    tags=["ingestion"],
)

ingestion_service = ConcreteDocumentIngestionService()


@router.post("/text", status_code=status.HTTP_202_ACCEPTED)
def ingest_text(
    text: str = Body(..., media_type="text/plain"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Accepts raw text for ingestion.

    The text is published to a message queue for asynchronous processing.
    """
    ingestion_service.ingest_text(user_id=current_user.id, text=text)
    return {"message": "Text ingestion request received and is being processed."}

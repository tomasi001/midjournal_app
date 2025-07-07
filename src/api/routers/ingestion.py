from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import uuid

from src.interfaces.document_ingestion_service import DocumentIngestionService
from src.data_models.schemas import User
from src.api.dependencies.auth import get_current_user


router = APIRouter(
    prefix="/ingest",
    tags=["ingestion"],
    responses={404: {"description": "Not found"}},
)


class IngestTextRequest(BaseModel):
    text: str


@router.post("/text", status_code=202)
def ingest_text(
    request: IngestTextRequest,
    current_user: User = Depends(get_current_user),
    ingestion_service: DocumentIngestionService = Depends(),
):
    """
    Accepts raw text for ingestion and queues it for processing.
    """
    try:
        user_id_uuid = uuid.UUID(str(current_user.id))
        ingestion_service.ingest_text(user_id=user_id_uuid, text=request.text)
        return {"message": "Text ingestion request received and is being processed."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # A catch-all for other potential errors during the process
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {e}"
        )

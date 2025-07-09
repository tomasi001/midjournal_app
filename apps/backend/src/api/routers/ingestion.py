from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
import uuid

from src.interfaces.document_ingestion_service import DocumentIngestionService
from src.api.dependencies.auth import get_current_user
from src.data_models.schemas import User, IngestionResponse


router = APIRouter(
    prefix="/ingest",
    tags=["ingestion"],
    responses={404: {"description": "Not found"}},
)


@router.post("/upload", response_model=IngestionResponse)
async def upload_document(
    current_user: User = Depends(get_current_user),
    file: UploadFile = File(...),
    ingestion_service: DocumentIngestionService = Depends(),
):
    """
    Accepts a document (text, image, or PDF), extracts content,
    and queues it for ingestion.
    """
    try:
        file_bytes = await file.read()
        document_id = await ingestion_service.ingest_document(
            user_id=current_user.id,
            file_bytes=file_bytes,
            content_type=file.content_type,
        )
        return IngestionResponse(
            message="Document upload received and is being processed.",
            document_id=document_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {e}"
        )

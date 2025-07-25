from fastapi import APIRouter, Depends, HTTPException
from starlette.responses import Response
from src.api.dependencies.services import get_file_storage_service
from src.interfaces.file_storage_service import FileStorageService
import structlog

log = structlog.get_logger()

router = APIRouter(
    prefix="/images",
    tags=["images"],
    responses={404: {"description": "Not found"}},
)


@router.get("/{image_path:path}")
async def get_image(
    image_path: str,
    storage_service: FileStorageService = Depends(get_file_storage_service),
):
    """
    Acts as a proxy to fetch an image from the file storage service.
    """
    log.info(f"Attempting to proxy image request for: {image_path}")
    file_data = storage_service.get_file(image_path)

    if file_data is None:
        log.warning(f"Image not found: {image_path}")
        raise HTTPException(status_code=404, detail="Image not found")

    file_bytes, content_type = file_data
    log.info(
        f"Successfully proxied image: {image_path} with content type: {content_type}"
    )

    return Response(content=file_bytes, media_type=content_type)

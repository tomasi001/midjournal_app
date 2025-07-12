from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse

from src.interfaces.ocr_service import OCRService
from src.api.dependencies.auth import get_current_user
from src.api.dependencies.services import get_ocr_service
from src.data_models.schemas import User


router = APIRouter(
    prefix="/journal",
    tags=["ocr"],
    responses={404: {"description": "Not found"}},
)


async def generate_ocr_text(ocr_service: OCRService, file_bytes: bytes):
    """Generator function to stream OCR text."""
    try:
        text = await ocr_service.extract_text_from_image(file_bytes)
        if not text or not text.strip():
            # This part is tricky because we can't send a 400 *after* starting the stream.
            # We will handle this by streaming nothing and the client can interpret an empty response.
            # A better approach might be a different endpoint pattern, but this works for now.
            yield ""
        else:
            # Yield text in chunks for a streaming effect, even if the service returns it all at once.
            for i in range(0, len(text), 10):
                yield text[i : i + 10]
    except Exception as e:
        # Cannot raise HTTPException here as the response has started.
        # The client will see a broken connection. Proper error handling is complex with streaming.
        print(f"Error during OCR streaming: {e}")
        yield ""  # Send empty string to signal an issue


@router.post("/ocr", response_class=StreamingResponse)
async def extract_text_from_image(
    current_user: User = Depends(get_current_user),
    file: UploadFile = File(...),
    ocr_service: OCRService = Depends(get_ocr_service),
):
    """
    Accepts an image, performs OCR, and streams the extracted text back.
    """
    try:
        file_bytes = await file.read()
        return StreamingResponse(
            generate_ocr_text(ocr_service, file_bytes), media_type="text/plain"
        )
    except Exception as e:
        # This will catch errors before the stream starts, like file read errors.
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {e}"
        )

from fastapi import APIRouter, Depends
from fastapi.responses import Response
import base64

from src.data_models.schemas import TTSRequest, TTSResponse
from src.interfaces.text_to_speech_service import TextToSpeechService
from src.tts.service import GTTSManager

router = APIRouter(
    prefix="/tts",
    tags=["tts"],
    responses={404: {"description": "Not found"}},
)


# In a real app, you'd use a more sophisticated dependency injection system
def get_tts_service() -> TextToSpeechService:
    return GTTSManager()


@router.post("/synthesize", response_model=TTSResponse)
async def synthesize_speech_endpoint(
    request: TTSRequest,
    tts_service: TextToSpeechService = Depends(get_tts_service),
):
    """
    Accepts text and returns synthesized speech as base64 encoded audio.
    """
    audio_bytes = await tts_service.synthesize_speech(request.text)
    audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
    return TTSResponse(audio_content=audio_base64, content_type="audio/mpeg")

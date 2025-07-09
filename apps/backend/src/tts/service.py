from gtts import gTTS
import io
from src.interfaces.text_to_speech_service import TextToSpeechService


class GTTSManager(TextToSpeechService):
    async def synthesize_speech(self, text: str) -> bytes:
        """
        Synthesizes speech from text using gTTS and returns audio bytes.
        """
        try:
            tts = gTTS(text=text, lang="en")
            mp3_fp = io.BytesIO()
            tts.write_to_fp(mp3_fp)
            mp3_fp.seek(0)
            return mp3_fp.read()
        except Exception as e:
            print(f"Error during TTS synthesis: {e}")
            # In a real app, you'd have more robust error handling
            raise

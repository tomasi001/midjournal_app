from typing import Protocol


class TextToSpeechService(Protocol):
    async def synthesize_speech(self, text: str) -> bytes:
        """
        Converts text into an audio byte stream (e.g., MP3 or WAV).

        Args:
            text: The input text to synthesize.

        Returns:
            The synthesized audio as a bytes object.
        """
        ...

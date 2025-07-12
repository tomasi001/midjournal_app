from typing import Dict
import structlog

from src.interfaces.image_generation_service import ImageGenerationService

log = structlog.get_logger()


class PlaceholderImageGenerationService(ImageGenerationService):
    """
    A placeholder implementation of the ImageGenerationService.
    This service does not generate real images but returns a placeholder image.
    This is useful for development and testing without needing a live model.
    """

    def generate_image(
        self, prompt: str, user_id: str, style_parameters: Dict
    ) -> bytes:
        log.info(
            "Generating placeholder image",
            prompt=prompt,
            user_id=user_id,
            style_parameters=style_parameters,
        )
        # Return a simple 1x1 pixel red GIF as a placeholder
        return (
            b"GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\x00\x00\x00\x00\x00,"
            b"\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"
        )

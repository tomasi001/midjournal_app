from abc import ABC, abstractmethod
from typing import Dict


class ImageGenerationService(ABC):
    @abstractmethod
    def generate_image(
        self, prompt: str, user_id: str, style_parameters: Dict
    ) -> bytes:
        """
        Generates an image based on a prompt and style parameters.
        Returns the image as bytes.
        """
        pass

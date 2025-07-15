from typing import Dict
import torch
from diffusers import StableDiffusionPipeline
import structlog
from PIL import Image
import io
import threading

from src.interfaces.image_generation_service import ImageGenerationService

log = structlog.get_logger()

# A lock to ensure that only one thread can access the model at a time.
# This is a class-level lock, so it will be shared across all instances
# of StableDiffusionImageGenerationService.
model_lock = threading.Lock()


class StableDiffusionImageGenerationService(ImageGenerationService):
    """
    An implementation of ImageGenerationService that uses a local Stable Diffusion model.
    """

    def __init__(self, model_id="stabilityai/stable-diffusion-2-1-base"):
        self.model_id = model_id
        self.pipe = None
        self._load_model()

    def _load_model(self):
        """Loads the Stable Diffusion model and configures it for the appropriate device."""
        if self.pipe:
            return

        device = "mps" if torch.backends.mps.is_available() else "cpu"
        log.info(
            "Loading Stable Diffusion model for device",
            device=device,
            model_id=self.model_id,
        )

        try:
            # Common arguments for the pipeline
            pipeline_args = {"use_safetensors": True}

            # Use float16 only on MPS (Apple Silicon GPU), not on CPU
            if device == "mps":
                pipeline_args["torch_dtype"] = torch.float16

            self.pipe = StableDiffusionPipeline.from_pretrained(
                self.model_id, **pipeline_args
            )
            self.pipe.to(device)
            log.info("Stable Diffusion model loaded successfully.")
        except Exception as e:
            log.error("Failed to load Stable Diffusion model", error=e, exc_info=True)
            self.pipe = None

    def generate_image(
        self, prompt: str, user_id: str, style_parameters: Dict
    ) -> bytes:
        if not self.pipe:
            log.error("Image generation failed because model is not loaded.")
            # Return placeholder bytes if the model failed to load
            return (
                b"GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\x00\x00\x00,"
                b"\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"
            )

        log.info(
            "Acquiring lock for Stable Diffusion model",
            prompt=prompt,
            user_id=user_id,
            style_parameters=style_parameters,
        )

        with model_lock:
            log.info(
                "Lock acquired. Generating image with Stable Diffusion",
                prompt=prompt,
                user_id=user_id,
                style_parameters=style_parameters,
            )

            try:
                # Note: style_parameters could be used here for things like num_inference_steps, guidance_scale, etc.
                image: Image.Image = self.pipe(prompt, **style_parameters).images[0]

                # Convert the PIL Image to bytes
                img_byte_arr = io.BytesIO()
                image.save(img_byte_arr, format="PNG")
                img_byte_arr = img_byte_arr.getvalue()

                log.info("Image generated successfully", prompt=prompt)
                return img_byte_arr

            except Exception as e:
                log.error(
                    "Error during Stable Diffusion image generation",
                    error=e,
                    exc_info=True,
                )
                # Return placeholder bytes on error
                return (
                    b"GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\x00\x00\x00,"
                    b"\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"
                )

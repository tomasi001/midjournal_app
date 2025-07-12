from typing import List
import structlog

from src.interfaces.llm_inference_service import LLMInferenceService

log = structlog.get_logger()

PROMPT_TEMPLATE = """
Based on the following journal entry insights, create a short, descriptive, and visually rich prompt for an image generation model.

The prompt should be a single, continuous sentence. Do not use line breaks.
Focus on evoking the mood and key themes. Be creative and artistic.

Sentiment: {sentiment}
Keywords: {keywords}
Content Snippet:
---
{content}
---

Image Prompt:
"""


class PromptGenerator:
    def __init__(self, llm_service: LLMInferenceService):
        self.llm_service = llm_service

    async def generate_prompt(
        self, sentiment: str, keywords: List[str], content: str
    ) -> str:
        """
        Generates an image prompt using the LLM based on journal entry details.
        """
        try:
            formatted_prompt = PROMPT_TEMPLATE.format(
                sentiment=sentiment, keywords=", ".join(keywords), content=content
            )

            # Note: The 'generate_response' method in the LLM service is non-streaming.
            image_prompt = await self.llm_service.generate_response(
                prompt=formatted_prompt, model_config={}
            )

            # Clean up the response to ensure it's a single line
            cleaned_prompt = image_prompt.replace("\n", " ").strip()
            log.info("Generated image prompt successfully", prompt=cleaned_prompt)
            return cleaned_prompt
        except Exception as e:
            log.error("Failed to generate image prompt", error=e)
            # Return a fallback prompt
            return f"A vibrant digital painting representing a {sentiment} mood with themes of {', '.join(keywords)}."

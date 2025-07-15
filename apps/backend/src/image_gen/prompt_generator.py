from typing import List
import structlog

from src.interfaces.llm_inference_service import LLMInferenceService

log = structlog.get_logger()

PROMPT_TEMPLATE = """
Create a single, continuous sentence prompt for an image generation model. Do not use line breaks.
The prompt must start with: "Abstract surreal composition in 9:16 aspect ratio, organic form, floating in space, soft diffused lighting, clean light background, high detail, artistic render, surreal, dreamlike image of"

Based on the provided journal entry insights, complete the prompt by describing the following, in order:
1.  **Primary Subject**: Describe the central form. Use the keywords and content snippet to inspire its shape and essence.
2.  **Material & Texture**: Describe the surface of the subject. Use the keywords to select a texture. Examples: sheer fabric, coarse matte material, silky flowing material, holographic ethereal liquid, realistic plush fabric, metallic liquid.
3.  **Color Palette**: Describe the colors. Base the colors on the sentiment.
    - Positive (joy, excitement): Use warm, vibrant colors like pinks, reds, yellows, oranges, gold.
    - Negative (sadness, anger): Use cool, dark colors like deep blues, greys, with hints of contrasting color.
    - Neutral/Calm (peace, contemplation): Use soft, pastel colors like pale blues, yellows, purples, beige.
4.  **Mood & Atmosphere**: Describe the overall feeling. Use the sentiment to guide this. Examples: gentle flow, tranquil, balanced equilibrium, suspended animation, explosive burst, swirling vortex.
5.  **Fine Details**: Add specific details. Examples: surface imperfections, micrograin, gold detailing, stitching, scattered refraction.

Journal Entry Insights:
Sentiment: {sentiment}
Keywords: {keywords}
Content Snippet:
---
{content}
---

Completed Image Prompt (single sentence):
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
            return f"Abstract surreal composition, 9:16 aspect ratio, organic form, floating in space, soft diffused lighting, clean light background, high detail, artistic render. A digital painting representing a {sentiment} mood with themes of {', '.join(keywords)}."

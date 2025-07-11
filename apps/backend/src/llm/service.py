import os
from typing import List, Dict, Any, AsyncGenerator
import ollama

from src.interfaces.llm_inference_service import LLMInferenceService
from src.llm.prompts import SYSTEM_PROMPT


class OllamaInferenceService(LLMInferenceService):
    def __init__(self):
        self.ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "llama3.2:latest")

    async def generate_response_stream(
        self, query: str, context: List[str], user_id: str, model_config: Dict[str, Any]
    ) -> AsyncGenerator[str, None]:
        """
        Generates and streams a response from Ollama using the provided context.
        """
        context_str = "\n".join(context)

        prompt = SYSTEM_PROMPT.format(context_str=context_str, query=query)

        try:
            client = ollama.AsyncClient(host=self.ollama_host)
            stream = await client.chat(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                stream=True,
            )
            async for chunk in stream:
                token = chunk["message"]["content"]
                if token:
                    print(f"Streaming token: '{token}'", flush=True)
                    yield token

        except Exception as e:
            error_message = f"An error occurred while communicating with Ollama: {e}"
            print(f"ERROR: {error_message}")
            yield error_message

    async def generate_response(self, prompt: str, model_config: Dict[str, Any]) -> str:
        """
        Generates a non-streaming response from Ollama.
        """
        try:
            client = ollama.AsyncClient(host=self.ollama_host)
            response = await client.chat(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                stream=False,
            )
            return response["message"]["content"]
        except Exception as e:
            error_message = f"An error occurred while communicating with Ollama: {e}"
            print(f"ERROR: {error_message}")
            return error_message

    async def generate_structured_response(
        self,
        prompt: str,
        model_config: Dict[str, Any],
        json_schema: Dict[str, Any],
    ) -> str:
        """
        Generates a non-streaming response from Ollama, asking for JSON output.
        """
        try:
            client = ollama.AsyncClient(host=self.ollama_host)
            response = await client.chat(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                stream=False,
                format=json_schema,
            )
            return response["message"]["content"]
        except Exception as e:
            error_message = f"An error occurred while communicating with Ollama: {e}"
            print(f"ERROR: {error_message}")
            return error_message

import os
from typing import List, Dict, Any, AsyncGenerator
import ollama


class OllamaInferenceService:
    def __init__(self):
        ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.client = ollama.AsyncClient(host=ollama_host)

    async def generate_response_stream(
        self, query: str, context: List[Dict[str, Any]]
    ) -> AsyncGenerator[str, None]:
        """
        Generates and streams a response from Ollama using the provided context.
        """
        context_str = "\n".join([item["text"] for item in context])

        prompt = f"""You are a helpful AI assistant for the MidJournal application.
A user is asking a question about their journal entries.
Use the following retrieved context from their journal to answer their question.
Do not make up information. If the context does not provide the answer, say so.

Context from journal:
---
{context_str}
---

User's question: {query}

Answer:
"""
        try:
            stream = await self.client.chat(
                model="llama3",
                messages=[{"role": "user", "content": prompt}],
                stream=True,
            )
            async for chunk in stream:
                token = chunk["message"]["content"]
                if token:
                    yield token

        except Exception as e:
            error_message = f"An error occurred while communicating with Ollama: {e}"
            print(f"ERROR: {error_message}")
            yield error_message

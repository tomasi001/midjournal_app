from abc import ABC, abstractmethod
from typing import AsyncGenerator, List, Dict, Any


class LLMInferenceService(ABC):
    @abstractmethod
    async def generate_response_stream(
        self, query: str, context: List[str], user_id: str, model_config: Dict[str, Any]
    ) -> AsyncGenerator[str, None]:
        """
        Generates a response by streaming tokens from an LLM.

        Args:
            query: The user's original query.
            context: A list of relevant document chunks retrieved from the vector store.
            user_id: The ID of the user performing the query.
            model_config: A dictionary for model parameters (e.g., temperature).

        Yields:
            A stream of response tokens from the language model.
        """
        # The 'yield' statement is used in the implementation, not the abstract method.
        # This is just for type hinting purposes.
        yield

    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        model_config: Dict[str, Any],
    ) -> str:
        pass

    @abstractmethod
    async def generate_structured_response(
        self,
        prompt: str,
        model_config: Dict[str, Any],
        json_schema: Dict[str, Any],
    ) -> str:
        pass

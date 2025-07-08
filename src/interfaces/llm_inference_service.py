from abc import ABC, abstractmethod
from typing import List, Dict, Any, AsyncGenerator


class LLMInferenceService(ABC):
    """
    Defines the contract for a service that interacts with a Large Language Model.
    """

    @abstractmethod
    async def generate_response_stream(
        self, query: str, context: List[Dict[str, Any]]
    ) -> AsyncGenerator[str, None]:
        """
        Generates a response by streaming tokens from an LLM.

        Args:
            query: The user's original query.
            context: A list of relevant document chunks retrieved from the vector store.

        Yields:
            A stream of response tokens from the language model.
        """
        # The 'yield' statement is used in the implementation, not the abstract method.
        # This is just for type hinting purposes.
        yield

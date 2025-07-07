from typing import List, Dict, Protocol


class LLMInferenceService(Protocol):
    """
    Defines the contract for a service that interacts with a Large Language Model.
    """

    def generate_response(
        self, prompt: str, context: List[str], user_id: str, model_config: Dict
    ) -> str:
        """
        Generates a conversational response from the LLM based on a prompt and retrieved context.

        Args:
            prompt: The user's original query.
            context: A list of relevant text chunks retrieved from the vector database.
            user_id: The ID of the user, for any user-specific configurations.
            model_config: A dictionary for model parameters (e.g., temperature, max_tokens).

        Returns:
            The generated string response from the LLM.
        """
        ...

    def analyze_text_for_insights(self, text: str, analysis_type: str) -> Dict:
        """
        Analyzes a piece of text to extract specific insights.

        Args:
            text: The text to be analyzed (e.g., a journal entry).
            analysis_type: The type of analysis to perform (e.g., "sentiment", "keywords", "summary").

        Returns:
            A dictionary containing the results of the analysis.
        """
        ...

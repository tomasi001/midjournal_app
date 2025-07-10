from typing import List, Optional
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import desc

from src.interfaces.suggestion_service import QuerySuggestionService
from src.interfaces.llm_inference_service import LLMInferenceService
from src.db.models import ChatHistory
from src.data_models.schemas import SuggestionsResponse


class LLMQuerySuggestionService(QuerySuggestionService):
    def __init__(self, llm_service: LLMInferenceService, db_session: Session):
        self.llm_service = llm_service
        self.db = db_session

    def _create_suggestion_prompt(self, chat_history: List[ChatHistory]) -> str:
        prompt_template = """
Suggest three diverse and engaging follow-up questions a user could ask.
Return the suggestions as a JSON object with a single key "suggestions" containing a list of strings.
Example: {{"suggestions": ["What was the main challenge?", "How did you overcome it?", "What did you learn?"]}}
{history_section}
"""
        if not chat_history:
            return prompt_template.format(history_section="")

        history_str = "\n".join(
            [
                f"User: {entry.query}\nAssistant: {entry.response}"
                for entry in chat_history
            ]
        )
        history_section = f"""
Based on the following conversation history:
---
{history_str}
---
"""
        return prompt_template.format(history_section=history_section)

    async def get_suggestions(
        self, user_id: str, context: Optional[str] = None
    ) -> List[str]:
        try:
            user_uuid = uuid.UUID(user_id)
            chat_history = (
                self.db.query(ChatHistory)
                .filter(ChatHistory.user_id == user_uuid)
                .order_by(desc(ChatHistory.timestamp))
                .limit(5)
                .all()
            )
            chat_history.reverse()

            prompt = self._create_suggestion_prompt(chat_history)

            response_json = await self.llm_service.generate_structured_response(
                prompt=prompt,
                model_config={
                    "temperature": 0
                },  # As recommended for deterministic output
                json_schema=SuggestionsResponse.model_json_schema(),
            )

            suggestions_model = SuggestionsResponse.model_validate_json(response_json)
            return suggestions_model.suggestions[:3]

        except Exception as e:
            print(f"Error generating suggestions with structured output: {e}")
            return []

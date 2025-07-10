from abc import ABC, abstractmethod
from typing import List, Optional


class QuerySuggestionService(ABC):
    @abstractmethod
    async def get_suggestions(
        self, user_id: str, context: Optional[str] = None
    ) -> List[str]:
        """
        Generates a list of query suggestions for a user.
        """
        pass

from abc import ABC, abstractmethod
from typing import List, Dict, Any


class QueryService(ABC):
    @abstractmethod
    def query(self, user_id: str, query_text: str) -> List[Dict[str, Any]]:
        """
        Processes a user's query, retrieves relevant document chunks, and returns them.

        Args:
            user_id: The ID of the user performing the query.
            query_text: The user's query text.

        Returns:
            A list of relevant document chunks, as dictionaries.
        """
        pass

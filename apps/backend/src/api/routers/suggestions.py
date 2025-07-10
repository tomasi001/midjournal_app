from fastapi import APIRouter, Depends
from typing import List

from src.interfaces.suggestion_service import QuerySuggestionService
from src.data_models.schemas import User
from src.api.dependencies.auth import get_current_user
from src.api.dependencies.services import get_suggestion_service

router = APIRouter(
    prefix="/suggestions",
    tags=["suggestions"],
    responses={404: {"description": "Not found"}},
)


@router.get("", response_model=List[str])
async def get_query_suggestions(
    current_user: User = Depends(get_current_user),
    suggestion_service: QuerySuggestionService = Depends(get_suggestion_service),
):
    """
    Generates and returns a list of query suggestions for the authenticated user.
    """
    suggestions = await suggestion_service.get_suggestions(user_id=str(current_user.id))
    return suggestions

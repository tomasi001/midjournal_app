from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Dict, Any

from src.interfaces.query_service import QueryService
from src.data_models.schemas import User
from src.api.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/query",
    tags=["query"],
    responses={404: {"description": "Not found"}},
)


class QueryRequest(BaseModel):
    text: str


class QueryResponse(BaseModel):
    results: List[Dict[str, Any]]


@router.post("/", response_model=QueryResponse)
def perform_query(
    request: QueryRequest,
    current_user: User = Depends(get_current_user),
    query_service: QueryService = Depends(),
):
    """
    Accepts a user's query, retrieves relevant document chunks, and returns them.
    """
    results = query_service.query(user_id=str(current_user.id), query_text=request.text)
    return {"results": results}

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from fastapi.responses import StreamingResponse

from src.interfaces.query_service import QueryService
from src.data_models.schemas import User
from src.api.dependencies.auth import get_current_user
from src.api.dependencies.services import get_query_service
from src.llm.service import OllamaInferenceService

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
    query_service: QueryService = Depends(get_query_service),
):
    """
    Accepts a user's query, retrieves relevant document chunks, and returns them.
    """
    results = query_service.query(user_id=str(current_user.id), query_text=request.text)
    return {"results": results}


# This is a new, separate instance for the streaming endpoint.
# In a real app, this would be managed more elegantly.
llm_service = OllamaInferenceService()


@router.post("/chat", response_class=StreamingResponse)
async def perform_chat_query(
    request: QueryRequest,
    current_user: User = Depends(get_current_user),
    query_service: QueryService = Depends(get_query_service),
):
    """
    Accepts a user's query, retrieves context, and streams a response from an LLM.
    """
    # 1. Get context
    context_docs = query_service.query(
        user_id=str(current_user.id), query_text=request.text
    )
    context_text = [doc["text"] for doc in context_docs if "text" in doc]

    # 2. Generate and stream response
    response_stream = llm_service.generate_response_stream(
        query=request.text,
        context=context_text,
        user_id=str(current_user.id),
        model_config={},  # Passing an empty dict for now
    )

    return StreamingResponse(response_stream, media_type="text/plain")

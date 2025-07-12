from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends

from src.data_models.schemas import (
    JournalEntry,
    JournalEntryCreate,
    User,
)
from src.api.dependencies.auth import get_current_user
from src.journal.service import JournalService
from src.api.dependencies.services import get_journal_service

router = APIRouter(
    prefix="/journal",
    tags=["journal"],
    responses={404: {"description": "Not found"}},
)


@router.post("/entry", response_model=JournalEntry, status_code=201)
def create_journal_entry(
    entry: JournalEntryCreate,
    current_user: User = Depends(get_current_user),
    journal_service: JournalService = Depends(get_journal_service),
):
    return journal_service.create_journal_entry(
        user_id=current_user.id, entry_data=entry
    )


@router.get("/entries", response_model=List[JournalEntry])
def get_journal_entries(
    current_user: User = Depends(get_current_user),
    journal_service: JournalService = Depends(get_journal_service),
):
    return journal_service.get_journal_entries(user_id=current_user.id)


@router.get("/entries/{entry_id}", response_model=JournalEntry)
def get_journal_entry(
    entry_id: UUID,
    current_user: User = Depends(get_current_user),
    journal_service: JournalService = Depends(get_journal_service),
):
    return journal_service.get_journal_entry(user_id=current_user.id, entry_id=entry_id)

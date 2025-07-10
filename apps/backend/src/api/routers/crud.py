from uuid import UUID

from sqlalchemy.orm import Session

from src.db import models
from src.data_models import schemas


def create_journal_entry(db: Session, entry: schemas.JournalEntryCreate, user_id: UUID):
    db_entry = models.JournalEntry(**entry.model_dump(), user_id=user_id)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


def get_journal_entries(db: Session, user_id: UUID, skip: int = 0, limit: int = 100):
    return (
        db.query(models.JournalEntry)
        .filter(models.JournalEntry.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

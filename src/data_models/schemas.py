import uuid
from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Document(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    source_name: str  # e.g., 'chat_export.json', 'My Diary.pdf'
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    status: str  # e.g., 'processing', 'complete', 'failed'


class TextChunk(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    document_id: Optional[str] = None
    journal_entry_id: Optional[str] = None
    text: str
    vector: Optional[List[float]] = None  # The embedding vector
    metadata: Dict = Field(default_factory=dict)


class JournalEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: Optional[str] = None
    content: str  # The main text of the journal entry
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # The following fields are populated by the analysis service
    analysis_summary: Optional[str] = None
    generated_image_url: Optional[str] = None

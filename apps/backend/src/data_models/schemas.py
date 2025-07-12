import uuid
from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field


# User Schemas
class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class UserInDB(User):
    hashed_password: str


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


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


# Journal Entry Schemas
class JournalEntryBase(BaseModel):
    title: Optional[str] = None
    content: str


class JournalEntryCreate(JournalEntryBase):
    pass


class JournalEntry(JournalEntryBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    sentiment: Optional[str] = None
    keywords: Optional[List[str]] = None
    summary: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class IngestionResponse(BaseModel):
    message: str
    document_id: str


class TTSRequest(BaseModel):
    text: str


class TTSResponse(BaseModel):
    audio_content: str  # Base64 encoded audio
    content_type: str  # e.g., "audio/wav"


class QueryRequest(BaseModel):
    text: str


class ChatHistoryBase(BaseModel):
    query: str
    response: str


class ChatHistoryCreate(ChatHistoryBase):
    pass


class ChatHistory(ChatHistoryBase):
    id: uuid.UUID
    user_id: uuid.UUID
    timestamp: datetime

    class Config:
        from_attributes = True


class SuggestionsResponse(BaseModel):
    suggestions: List[str]


class JournalAnalysis(BaseModel):
    sentiment: str
    keywords: List[str]
    summary: str

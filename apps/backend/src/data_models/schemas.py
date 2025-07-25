import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
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
    refresh_token: str


class TokenData(BaseModel):
    email: Optional[str] = None


class RefreshRequest(BaseModel):
    refresh_token: str


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


# Journal Analysis Schemas
class CoreEmotionalLandscapeSchema(BaseModel):
    dominant_emotions: List[Dict[str, Any]] = Field(
        description="e.g., [{'emotion': 'Joy', 'intensity': 0.8}]"
    )
    emotional_valence: str = Field(
        description="e.g., 'Positive', 'Negative', 'Neutral'"
    )
    emotional_shifts: List[str] = Field(
        description="e.g., ['Shift from neutral to anxious after discussing work']"
    )


class KeyThemesTopicsSchema(BaseModel):
    top_keywords: List[str] = Field(
        description="e.g., ['work', 'family', 'stress', 'goals']"
    )
    identified_themes: List[str] = Field(
        description="e.g., ['Professional Development', 'Family Dynamics', 'Coping with Pressure']"
    )


class CognitivePatternsSchema(BaseModel):
    recurring_thoughts: List[str] = Field(description="e.g., ['I need to be perfect']")
    self_perception: str = Field(description="e.g., 'Overwhelmed but resilient'")
    beliefs_values: List[str] = Field(
        description="e.g., ['Hard work is essential', 'Honesty above all']"
    )
    problems_challenges: List[str] = Field(
        description="e.g., ['Time management', 'Dealing with criticism']"
    )


class RelationalDynamicsSchema(BaseModel):
    mentioned_individuals: List[Dict[str, Any]] = Field(
        description="e.g., [{'name': 'Sarah', 'relationship': 'colleague', 'sentiment': 'positive'}]"
    )
    relationship_tone: List[str] = Field(
        description="e.g., ['Strained with John', 'Supportive with Emily']"
    )


class PotentialTriggersContextualCluesSchema(BaseModel):
    events_situations: List[str] = Field(
        description="e.g., ['Meeting with manager', 'Weekend trip']"
    )
    time_bound_indicators: List[str] = Field(
        description="e.g., ['Monday morning', 'Last night']"
    )


# Journal Entry Schemas
class JournalEntryBase(BaseModel):
    title: Optional[str] = None
    content: str


class JournalEntryCreate(JournalEntryBase):
    pass


class JournalEntry(JournalEntryBase):
    id: uuid.UUID
    user_id: uuid.UUID
    entry_number: int
    created_at: datetime
    updated_at: datetime
    sentiment: Optional[str] = None
    keywords: Optional[List[str]] = None
    summary: Optional[str] = None
    image_url: Optional[str] = None
    emotional_landscape: Optional[CoreEmotionalLandscapeSchema] = None
    themes_topics: Optional[KeyThemesTopicsSchema] = None
    cognitive_patterns: Optional[CognitivePatternsSchema] = None
    relational_dynamics: Optional[RelationalDynamicsSchema] = None
    contextual_clues: Optional[PotentialTriggersContextualCluesSchema] = None

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
    title: str
    sentiment: str
    keywords: List[str]
    summary: str
    emotional_landscape: CoreEmotionalLandscapeSchema
    themes_topics: KeyThemesTopicsSchema
    cognitive_patterns: CognitivePatternsSchema
    relational_dynamics: RelationalDynamicsSchema
    contextual_clues: PotentialTriggersContextualCluesSchema

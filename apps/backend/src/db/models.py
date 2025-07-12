import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    JSON,
    ARRAY,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    documents = relationship("Document", back_populates="owner")
    journal_entries = relationship("JournalEntry", back_populates="owner")
    chat_history = relationship("ChatHistory", back_populates="user")


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    source_name = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    status = Column(String, nullable=False)

    owner = relationship("User", back_populates="documents")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    entry_number = Column(Integer, nullable=False)
    title = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )
    sentiment = Column(String, nullable=True)
    keywords = Column(ARRAY(String), nullable=True)
    summary = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)

    owner = relationship("User", back_populates="journal_entries")

    __table_args__ = (
        UniqueConstraint("user_id", "entry_number", name="uq_user_entry_number"),
    )


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    query = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow)

    user = relationship("User", back_populates="chat_history")

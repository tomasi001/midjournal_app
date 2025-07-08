-- Main table for users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table to track uploaded documents for batch processing
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL, -- e.g., 'processing', 'complete', 'failed'
    INDEX idx_documents_user_id (user_id)
);

-- Table for journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMTz NOT NULL DEFAULT NOW(),
    analysis_summary TEXT,
    generated_image_url TEXT,
    INDEX idx_journal_entries_user_id (user_id)
);

-- Note: Text chunks with vectors will be stored in the Vector DB (e.g., Qdrant).
-- A relational table for text chunks could be added here for metadata-only searches
-- if needed, but we will omit it for the initial design to keep the relational DB focused.
-- CREATE TABLE text_chunks (...) 
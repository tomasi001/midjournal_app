# Vector Database Schema (Qdrant)

This document outlines the schema for the collections that will be stored in our vector database, Qdrant. The primary goal is to store text chunks and their embeddings while ensuring strict data isolation between users.

---

## Collection: `text_chunks`

Each user's text chunks will be stored in a single, shared collection named `text_chunks`. We will rely on Qdrant's payload indexing and filtering capabilities to ensure that a user can only query their own data.

### Vector Parameters

- **Size:** The dimension of the embedding model being used. For instance, using a `sentence-transformers` model like `all-MiniLM-L6-v2` would mean a size of **384**. This needs to be finalized when the embedding model is chosen.
- **Distance Metric:** `Cosine` - This is generally effective for semantic similarity based on text embeddings.

### Payload Schema

The payload of each vector will contain the following metadata, which is crucial for filtering and context retrieval.

- **`user_id` (UUID, Indexed):**

  - **Description:** The unique identifier for the user who owns this text chunk.
  - **Type:** `keyword` (in Qdrant terms)
  - **Indexing:** This field **MUST** be indexed to allow for fast and efficient filtering. This is the core of our multi-tenant security model.
  - **Example:** `"2a1b0a8e-5b7c-4e8f-9d1a-3c4b5e6f7g8h"`

- **`document_id` (UUID, Indexed):**

  - **Description:** The ID of the source document this chunk came from (if applicable, e.g., from a bulk upload).
  - **Type:** `keyword`
  - **Indexing:** Indexed to allow retrieval of all chunks from a specific document.
  - **Example:** `"9f8e7d6c-5b4a-3c2b-1a09-f8e7d6c5b4a3"`

- **`journal_entry_id` (UUID, Indexed):**

  - **Description:** The ID of the journal entry this chunk belongs to (if applicable).
  - **Type:** `keyword`
  - **Indexing:** Indexed to link chunks to a specific journal entry.
  - **Example:** `"c1b2a3d4-e5f6-a7b8-9c0d-1e2f3a4b5c6d"`

- **`text` (String):**
  - **Description:** The actual text content of the chunk.
  - **Type:** `text` (for full-text search capabilities if needed, though not the primary use case).
  - **Indexing:** Optional, could be enabled for hybrid search later.

### Example Query

When a user performs a query, the search request to Qdrant **MUST** include a `filter` clause on the `user_id`.

```json
{
  "vector": [0.1, 0.2, 0.3, ...],
  "limit": 10,
  "with_payload": true,
  "filter": {
    "must": [
      {
        "key": "user_id",
        "match": {
          "value": "THE_CURRENT_USERS_ID_HERE"
        }
      }
    ]
  }
}
```

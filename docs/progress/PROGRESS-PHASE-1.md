# Phase 1: Core RAG MVP

This file tracks the progress for implementing the core features of the MidJournal application.

---

## 1.1 User Authentication & Data Siloing

- [x] **Task 1.1.1: Implement User Authentication System (Backend)**
  - [x] Create `src/auth/` and implement `AuthenticationService`.
  - [x] Implement `POST /auth/register` endpoint.
  - [x] Implement `POST /auth/login` endpoint.
  - [x] Implement JWT middleware/decorator.
  - [x] Implement `GET /auth/me` endpoint.
- [x] **Task 1.1.2: Enforce User Data Siloing in Backend Services**
  - [x] Require `user_id` in all relevant endpoints and services.
  - [x] Implement `user_id` filtering in `VectorStoreClient`.
  - [x] Ensure `WHERE user_id` clause in all PostgreSQL queries.

---

## 1.2 Ingestion Service (Text & Embeddings)

- [x] **Task 1.2.1: Implement Message Queue Client**
  - [x] Create `src/message_queue/` and implement `MessageQueueClient`.
  - [x] Implement `publish` method.
  - [x] Implement `subscribe` method.
- [x] **Task 1.2.2: Develop Text Processing Service (Chunking & Embeddings)**
  - [x] Create `src/text_processing/` module.
  - [x] Implement `TextSplitter` in `src/text_processing/chunking.py`.
  - [x] Implement `EmbeddingService` in `src/text_processing/embedding.py`.
  - [x] Create orchestration service in `src/text_processing/service.py`.
- [x] **Task 1.2.3: Document Ingestion Service** - Implement the service that orchestrates the ingestion flow, publishing tasks to the message queue.

---

## 1.3 Query & Retrieval

- [x] **Task 1.3.1: Query Service** - Create a service that takes a user query, embeds it, and retrieves relevant document chunks from the vector store.
- [x] **Task 1.3.2: Query API Endpoint** - Expose the query service via a secure API endpoint.

---

## 1.4 LLM Integration

- [x] **Task 1.4.1: LLM Inference Service** - Create a service to take retrieved context and a user query and generate a response using an LLM.
- [x] **Task 1.4.2: Streaming API Endpoint** - Create a new endpoint that streams the LLM's response back to the user.

---

## 1.5 Finalization & Review

- [~] **Task 1.5.1: Write Comprehensive Unit & Integration Tests**
  - [x] Add placeholder unit tests to validate CI pipeline.
  - [ ] Write comprehensive unit tests for all services.
  - [ ] Write integration tests for service interactions.
- [ ] **Task 1.5.2: Develop End-to-End (E2E) Tests for Core Flow**
  - [ ] Write `Playwright` E2E test for register -> ingest -> query flow.
- [~] **Task 1.5.3: Set up Initial CI/CD Pipeline for Backend & Frontend**
  - [x] Update `ci.yml` to run linting and unit tests for both backend and frontend.
  - [ ] Add step to build and push Docker images.
  - [ ] Create deployment workflow (`deploy-dev.yml`).
- [~] **Task 1.5.4: Implement Basic Monitoring & Logging**
  - [x] Add diagnostic logging to backend services for debugging.
  - [ ] Integrate full structured logging (JSON).
  - [ ] Configure cloud provider's logging service.
  - [ ] Set up basic error alerts.

---

**Completion of Phase 1:** The core RAG application is functional. Users can register, log in, upload text, and chat with their personal vectorized data. The system is tested, and the basic CI/CD pipeline is operational for continuous development and deployment to `development` environments.

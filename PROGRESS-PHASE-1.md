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
  - [ ] Require `user_id` in all relevant endpoints and services.
  - [ ] Implement `user_id` filtering in `VectorStoreClient`.
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

## 1.3 Core Query API & RAG Logic

- [x] **Task 1.3.1: Query Service** - Create a service that takes a user query, embeds it, and retrieves relevant document chunks from the vector store.
- [x] **Task 1.3.2: Query API Endpoint** - Expose the query service via a secure API endpoint.

---

## 1.4 Basic Frontend (Web)

- [ ] **Task 1.4.1: Set up Frontend Project Structure**
  - [ ] Create `frontend/` directory.
  - [ ] Initialize web project (React/Vue/etc.).
- [ ] **Task 1.4.2: Implement User Registration & Login UI**
  - [ ] Create registration/login forms.
  - [ ] Implement client-side logic to call auth APIs.
  - [ ] Implement JWT storage and basic routing.
- [ ] **Task 1.4.3: Implement Text Input for Journal Entries**
  - [ ] Create journal entry page with text area.
  - [ ] Implement "Submit" to call ingestion API.
- [ ] **Task 1.4.4: Implement Basic Chat Interface**
  - [ ] Create chat page with input and history.
  - [ ] Implement client-side logic to call query API.

---

## 1.5 Testing & Deployment (Phase 1)

- [ ] **Task 1.5.1: Write Comprehensive Unit & Integration Tests**
  - [ ] Write unit tests for all new services.
  - [ ] Write integration tests for service interactions.
  - [ ] Ensure tests cover logic, edge cases, and errors.
- [ ] **Task 1.5.2: Develop End-to-End (E2E) Tests for Core Flow**
  - [ ] Write `Playwright` E2E test for register -> ingest -> query flow.
- [ ] **Task 1.5.3: Set up Initial CI/CD Pipeline for Backend & Frontend**
  - [ ] Update `ci.yml` to build backend Docker images.
  - [ ] Update `ci.yml` to build the frontend application.
  - [ ] Create `deploy-dev.yml` to deploy backend and frontend to dev.
- [ ] **Task 1.5.4: Implement Basic Monitoring & Logging**
  - [ ] Integrate structured logging into backend services.
  - [ ] Configure cloud provider's logging service.
  - [ ] Set up basic error alerts.

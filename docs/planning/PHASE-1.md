# Phase 1: Core RAG MVP (Minimal Viable Product)

**Objective:** Implement the fundamental RAG pipeline for text input, storage, and basic chat query, establishing the core backend and a functional frontend.

**Duration:** Weeks 4-10 (Estimate: 7 weeks. Adjust as necessary. Target completion: ~August 25, 2025 AEST)

---

## 1.1 User Authentication & Data Siloing

**Goal:** Securely manage user access and ensure strict isolation of individual user data.

- **Task 1.1.1: Implement User Authentication System (Backend)**

  - **Action:** Create a new module `src/auth/` and implement the concrete `AuthenticationService` based on the interface defined in Phase 0.
  - **Action:** Implement user registration endpoint (`POST /auth/register`) that takes email and password, hashes the password using `bcrypt`, stores the user in the `User` table (PostgreSQL), and returns a success response.
  - **Action:** Implement user login endpoint (`POST /auth/login`) that verifies credentials, generates a JWT (JSON Web Token), and returns the token.
  - **Action:** Implement a JWT-based authorization middleware/decorator for FastAPI that validates tokens on incoming requests and extracts the `user_id`.
  - **Action:** Implement a user info endpoint (`GET /auth/me`) that returns the authenticated user's details.
  - **Suggested Tools:** `passlib` (for bcrypt), `PyJWT` for token handling.
  - **Deliverable:**
    - `src/auth/service.py` implementing `AuthenticationService`.
    - `src/api/routers/auth.py` with registration, login, and user info endpoints.
    - `src/api/dependencies/auth.py` with JWT authentication/authorization logic.
  - **Verification:**
    - Unit tests for password hashing/verification and JWT generation/validation.
    - Integration tests for registration and login API endpoints.
    - Test authentication by attempting to access a protected endpoint with/without a valid token.

- **Task 1.1.2: Enforce User Data Siloing in Backend Services**
  - **Action:** Modify all relevant API endpoints and internal service calls to _require_ `user_id` as an input parameter, derived from the authenticated request.
  - **Action:** Implement logical partitioning in the `VectorStoreClient` concrete implementation: every `add_documents` call MUST include the `user_id` as metadata, and every `query` call MUST include a filter on the `user_id` to retrieve only relevant chunks.
  - **Action:** Ensure all database queries (PostgreSQL) for user-specific data include a `WHERE user_id = :current_user_id` clause.
  - **Deliverable:**
    - Modified `src/vector_store/clients/qdrant_client.py` (or `weaviate_client.py`) with `user_id` filtering logic.
    - Updated `src/api/routers/` and `src/services/` modules to pass and enforce `user_id`.
  - **Verification:**
    - Integration tests: User A uploads data, User B attempts to query User A's data (should fail or return empty).
    - Verify through logs/debugging that `user_id` filters are always applied to vector database and relational database queries.

---

## 1.2 Ingestion Service (Text & Embeddings)

**Goal:** Enable users to upload plain text, process it into chunks and embeddings, and store it in the vector database, associated with their user ID.

- **Task 1.2.1: Implement Message Queue Client**

  - **Action:** Create `src/message_queue/` module and implement the concrete `MessageQueueClient` based on the interface. Use `pika` (for RabbitMQ) or a client for Kafka.
  - **Action:** Implement `publish(queue_name: str, message: dict)` to send JSON messages to the queue.
  - **Action:** Implement `subscribe(queue_name: str, callback_function: Callable)` to listen for messages and process them with a provided callback.
  - **Suggested Tools:** `pika` (RabbitMQ client).
  - **Deliverable:** `src/message_queue/client.py` implementing message queue operations.
  - **Verification:**
    - Unit tests for `publish` and `subscribe` (using mock queue or a lightweight local queue).
    - Integration test: Service A publishes a message, Service B consumes and processes it.

- **Task 1.2.2: Develop Text Processing Service (Chunking & Embeddings)**

  - **Action:** Create `src/text_processing/` module.
  - **Action:** Implement the concrete `TextSplitter` within `src/text_processing/chunking.py`. Start with a simple character-based recursive splitter (e.g., LangChain's `RecursiveCharacterTextSplitter`).
  - **Action:** Implement the concrete `EmbeddingService` within `src/text_processing/embedding.py`. Integrate with the chosen embedding model (e.g., Hugging Face `sentence-transformers` for `BAAI/bge-small-en-v1.5`).
  - **Action:** Create `src/text_processing/service.py` to orchestrate chunking and embedding generation.
  - **Deliverable:**
    - `src/text_processing/chunking.py` (Text Splitter implementation).
    - `src/text_processing/embedding.py` (Embedding Service implementation).
    - `src/text_processing/service.py` (Orchestration logic).
  - **Verification:**
    - Unit tests for `TextSplitter` (e.g., verify chunk size, overlap).
    - Unit tests for `EmbeddingService` (e.g., verify output dimension, consistency).
    - Integration test: Pass a text, verify chunks and embeddings are generated correctly.

- **Task 1.2.3: Implement Document Ingestion Service (API Endpoint & Consumer)**
  - **Action:** Create `src/ingestion/` module.
  - **Action:** Implement the concrete `DocumentIngestionService` based on the interface.
  - **Action:** Create a FastAPI endpoint (`POST /ingest/text`) in `src/api/routers/ingestion.py` that accepts plain text and `user_id`. This endpoint should publish a message to an "ingestion-queue" via `MessageQueueClient`. This API endpoint will be a **serverless function**.
  - **Action:** Develop a separate consumer service (can be another **serverless function** triggered by the queue) that subscribes to the "ingestion-queue."
  - **Action:** The consumer service's callback function should:
    1.  Receive the text content and `user_id` from the queue message.
    2.  Call `TextProcessingService` to chunk the text and generate embeddings.
    3.  Call `VectorStoreClient` to store the chunks and embeddings, ensuring `user_id` is passed as metadata.
    4.  Store metadata about the original document (e.g., `document_id`, `user_id`, `uploaded_at`) in PostgreSQL.
  - **Deliverable:**
    - `src/ingestion/service.py` implementing ingestion logic.
    - `src/api/routers/ingestion.py` with `POST /ingest/text` endpoint.
    - `src/ingestion/consumer.py` containing the queue consumer logic.
  - **Verification:**
    - Integration test: Call the ingestion API endpoint, verify a message appears in the queue, and then verify chunks/embeddings appear in the Vector DB and document metadata in PostgreSQL for the correct `user_id`.

---

## 1.3 Core Query API & RAG Logic

**Goal:** Enable users to chat with their vectorized thoughts, grounded in their personal data.

- **Task 1.3.1: Implement LLM Inference Service**

  - **Action:** Create `src/llm/` module.
  - **Action:** Implement the concrete `LLMInferenceService` based on the interface.
  - **Action:** Integrate with the chosen LLM (e.g., Llama 3 via `ollama` or a cloud provider's API).
  - **Action:** Implement `generate_response(prompt: str, context: List[str], user_id: str, model_config: Dict) -> str`.
  - **Action:** Design the system prompt (in `src/llm/prompts.py`) to strictly instruct the LLM to _only_ use provided `context` for grounding its answers and avoid hallucination.
    - **Example System Prompt snippet:** "You are a helpful assistant who answers questions based _only_ on the provided text excerpts. If the answer cannot be found in the provided text, state that you don't know."
  - **Suggested Tools:** `ollama` client (if self-hosting Llama 3), `langchain` or `llama_index` for prompt templating/orchestration.
  - **Deliverable:**
    - `src/llm/service.py` implementing `LLMInferenceService`.
    - `src/llm/prompts.py` containing the system prompt and any necessary prompt templates.
  - **Verification:**
    - Unit tests: Test `generate_response` with mocked LLM calls.
    - Manual testing: Provide contexts with known answers and contexts with no answers to verify grounding.

- **Task 1.3.2: Implement Main Query API Service Endpoint**
  - **Action:** Create `src/query/` module.
  - **Action:** Create a FastAPI endpoint (`POST /query/chat`) in `src/api/routers/query.py` that accepts a user's natural language query and `user_id`. This API endpoint will be a **serverless function**.
  - **Action:** Inside the endpoint:
    1.  Validate the incoming request and authenticate the `user_id`.
    2.  Call `TextProcessingService.generate_embedding` to embed the user's query.
    3.  Call `VectorStoreClient.query` using the query embedding and crucially, the `user_id` filter, to retrieve relevant chunks (`top_k=5` or `10` initially).
    4.  Extract the text content from the retrieved chunks.
    5.  Call `LLMInferenceService.generate_response`, passing the user's query, the retrieved chunk texts as `context`, and the `user_id`.
    6.  Return the LLM's response.
  - **Deliverable:** `src/api/routers/query.py` with the `/query/chat` endpoint.
  - **Verification:**
    - Integration test: Upload some sample text for a user, then query that text and verify a relevant, grounded response is received.
    - Manual testing: Test various queries to ensure correct context retrieval and LLM response.

---

## 1.4 Basic Frontend (Web)

**Goal:** Provide a minimal, functional web interface for user interaction with the core RAG functionality.

- **Task 1.4.1: Set up Frontend Project Structure**

  - **Action:** Create a `frontend/` directory in the project root.
  - **Action:** Initialize a simple web project (e.g., using `create-react-app`, `Vue CLI`, or a plain HTML/CSS/JS setup with a build tool like Webpack/Vite).
  - **Suggested Tools:** React/Vue/Svelte + Vite.
  - **Deliverable:** `frontend/` directory with a basic, runnable web application.

- **Task 1.4.2: Implement User Registration & Login UI**

  - **Action:** Create pages/components for user registration and login forms.
  - **Action:** Implement client-side logic to send credentials to the backend `POST /auth/register` and `POST /auth/login` endpoints.
  - **Action:** Store the received JWT token securely (e.g., in `localStorage` or `sessionStorage` for simplicity in V1, with a plan to move to `HttpOnly` cookies later).
  - **Action:** Implement basic routing for authenticated vs. unauthenticated users.
  - **Deliverable:** Functional registration and login forms in the frontend.
  - **Verification:** Successfully register a new user and log in to the application.

- **Task 1.4.3: Implement Text Input for Journal Entries**

  - **Action:** Create a "Journal Entry" page/component.
  - **Action:** Provide a large text area for users to type or paste their entries.
  - **Action:** Implement a "Submit" button that sends the text content to the `POST /ingest/text` endpoint, including the `user_id` from the stored JWT.
  - **Deliverable:** Frontend page for submitting text entries.
  - **Verification:** Successfully submit a text entry from the frontend, and verify it's processed and stored in the backend.

- **Task 1.4.4: Implement Basic Chat Interface**
  - **Action:** Create a "Chat with Thoughts" page/component.
  - **Action:** Implement an input field for the user's query and a send button.
  - **Action:** Display a conversation history (simple list of user queries and LLM responses).
  - **Action:** Implement client-side logic to send queries to the `POST /query/chat` endpoint and display the response.
  - **Deliverable:** Functional chat interface in the frontend.
  - **Verification:** Successfully ask questions to the chat interface and receive responses based on previously uploaded text.

---

## 1.5 Testing & Deployment (Phase 1)

**Goal:** Ensure the core MVP is stable, tested, and deployable to development and staging environments.

- **Task 1.5.1: Write Comprehensive Unit & Integration Tests**

  - **Action:** For all newly developed backend services (`AuthenticationService`, `DocumentIngestionService`, `TextProcessingService`, `LLMInferenceService`, `QueryService`) and API endpoints, write comprehensive unit tests (`tests/unit/`).
  - **Action:** Write integration tests (`tests/integration/`) that verify the interactions between these services (e.g., API Gateway -> FastAPI -> Service -> Database/Queue/VectorDB).
  - **Action:** Ensure tests cover core logic, edge cases, and error handling for each component.
  - **Deliverable:** Expanded `tests/` directory with new unit and integration test files.
  - **Verification:** All tests pass, and code coverage targets (defined in Phase 0) are met for core components.

- **Task 1.5.2: Develop End-to-End (E2E) Tests for Core Flow**

  - **Action:** Write a basic E2E test script (`tests/e2e/`) using `Playwright` that simulates the following flow:
    1.  User registers/logs in.
    2.  User submits a plain text journal entry.
    3.  User navigates to the chat interface.
    4.  User asks a question related to the submitted text.
    5.  Verify a relevant response is displayed.
  - **Deliverable:** `tests/e2e/` with an executable E2E test for the core RAG flow.
  - **Verification:** E2E test runs successfully against a locally deployed environment.

- **Task 1.5.3: Set up Initial CI/CD Pipeline for Backend & Frontend**

  - **Action:** Update `.github/workflows/ci.yml` (or your chosen CI platform configuration) to:
    - Build Docker images for all backend services on `push` to `main` and `pull_request` to `main`.
    - Run all unit and integration tests for the backend.
    - Build the frontend application (e.g., `npm run build` or `yarn build`).
  - **Action:** Create a separate CI/CD workflow (`.github/workflows/deploy-dev.yml`) to automatically deploy the backend services (using IaC from Phase 0) and the built frontend assets to the `development` environment upon successful `main` branch pushes.
  - **Action:** Implement basic health checks for deployed services.
  - **Deliverable:** Updated CI/CD configurations (`.github/workflows/*.yml`).
  - **Verification:** Push to `main` branch, observe the CI/CD pipeline running, and confirm successful deployment to the `development` environment.

- **Task 1.5.4: Implement Basic Monitoring & Logging**
  - **Action:** Integrate a basic logging library into all backend services (e.g., Python's `logging` module).
  - **Action:** Configure structured logging (JSON format) for easier parsing.
  - **Action:** Ensure all API requests, key service calls (e.g., `LLMInferenceService` calls, `VectorStoreClient` operations), and errors are logged.
  - **Action:** Configure cloud provider's default logging service (e.g., AWS CloudWatch Logs, Google Cloud Logging) to collect logs from deployed serverless functions.
  - **Action:** Set up basic error alerts (e.g., email notification for critical errors) using the cloud provider's monitoring services.
  - **Deliverable:**
    - Backend code updated with comprehensive logging.
    - Cloud logging configured for deployed services.
    - Basic error alerts set up.
  - **Verification:** Trigger an intentional error in the `development` environment and verify the error log appears and an alert is triggered.

---

**Completion of Phase 1:** The core RAG application is functional. Users can register, log in, upload text, and chat with their personal vectorized data. The system is tested, and the basic CI/CD pipeline is operational for continuous development and deployment to `development` environments.

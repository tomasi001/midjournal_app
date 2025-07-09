# Phase 3: Enhanced Interactivity & Input Modalities

**Objective:** Expand the application's input methods beyond text, introduce basic automated insight generation from journal entries, and refine user experience, all while adhering to our architectural principles of abstraction, modularity, asynchronous processing, data siloing, observability, IaC, and monorepo best practices.

**Duration:** Weeks 11-18 (Estimate: 8 weeks. Target completion: ~October 20, 2025 AEST)

**Current Root:** `/Users/thomasshields/midjournal_app`
**Backend App:** `apps/backend`
**Frontend App:** `apps/frontend`
**Shared Packages:** `packages/api-client`, `packages/e2e-tests`

---

## 3.1 Voice Interaction (Speech-to-Text & Text-to-Speech)

**Goal:** Enable seamless voice input for queries and voice output for LLM responses, ensuring an abstract `TextToSpeechService` and efficient client-side STT.

- **Task 3.1.1: Integrate Client-Side Speech-to-Text (STT)**

  - **Action:** In the `apps/frontend/` application, integrate a client-side STT solution (e.g., Web Speech API for browser-native capabilities, or a lightweight JavaScript library based on a small on-device model like `whisper.js`). Prioritize user privacy and performance for client-side processing.
  - **Action:** Add a microphone button to the chat interface (`apps/frontend/src/app/chat/page.tsx` or relevant component) and the journal entry input area (`apps/frontend/src/app/journal/page.tsx` or relevant component).
  - **Action:** Implement event listeners to start/stop recording, capture audio, and convert it to text.
  - **Action:** Send the transcribed text to the existing `POST /ingest/text` or `POST /query/chat` endpoints via the `@midjournal/api-client`.
  - **Suggested Tools:** Web Speech API (for browser support), `react-media-recorder` (React hook for audio recording), `whisper.js` (for more control/offline capabilities).
  - **Deliverable:** Frontend (`apps/frontend/`) with functional microphone buttons that transcribe speech to text.
  - **Verification:**
    - **Manual Test:** Speak into the microphone in the chat and journal entry UIs; verify the transcribed text appears accurately.
    - **E2E Test:** Update `packages/e2e-tests/` to include a test case: Record a simple query, verify the transcription and subsequent LLM response.

- **Task 3.1.2: Implement Backend Text-to-Speech (TTS) Service**

  - **Action:** Create a new module `apps/backend/src/tts/` and define a `TextToSpeechService` interface in `apps/backend/src/interfaces/text_to_speech_service.py` based on the **Abstraction Principle**.
    ```bash
    mkdir -p apps/backend/src/tts
    touch apps/backend/src/tts/__init__.py
    touch apps/backend/src/tts/service.py
    touch apps/backend/src/interfaces/text_to_speech_service.py
    ```
  - **Deliverable:** Necessary directories and empty files for TTS service and interface.
  - **Verification:** Run `ls apps/backend/src/tts/service.py` and `ls apps/backend/src/interfaces/text_to_speech_service.py`.
  - **Action:** Implement a concrete `TextToSpeechService` in `apps/backend/src/tts/service.py`. Use an open-source library that can run locally or be deployed (e.g., `Coqui TTS`, `Mozilla TTS` for self-hosted) or a cloud provider's API (e.g., `AWS Polly`/`Google Cloud Text-to-Speech` for cloud-based). Prioritize lower latency for conversational responses.
  - **Action:** Implement a method `synthesize_speech(text: str, user_id: str) -> bytes` that converts text into an audio byte stream (e.g., MP3 or WAV). Ensure the `user_id` is passed but the service doesn't store user-specific audio unless explicitly required and designed for data retention/deletion policies.
  - **Deliverable:** `apps/backend/src/tts/service.py` with `TextToSpeechService` implementation.
  - **Verification:**
    - **Unit Test:** Write a test for `synthesize_speech` in `apps/backend/tests/unit/test_tts_service.py` with sample text and verify audio output (e.g., by saving to a file and playing).
    - **Performance Test:** Evaluate latency and audio quality for typical response lengths.

- **Task 3.1.3: Integrate TTS into Query API & Frontend Playback**
  - **Action:** Modify the `POST /query/chat` endpoint in `apps/backend/src/api/routers/query.py`. After receiving the LLM response, call `TextToSpeechService.synthesize_speech` (using the injected service based on the **Abstraction Principle**).
  - **Action:** Return the audio byte stream (e.g., Base64 encoded WAV/MP3) along with the text response from the API. Update the Pydantic schema in `apps/backend/src/data_models/schemas.py` to include the audio field.
  - **Action:** Re-generate your shared API client (`packages/api-client`) to include the updated schema.
    ```bash
    # From monorepo root:
    turbo run backend#dev & # Ensure backend is running
    sleep 5 # Give it time to start
    curl http://localhost:8000/openapi.json > apps/backend/docs/openapi.json
    turbo run build --filter=@midjournal/api-client # Regenerate client
    fg # Bring backend to foreground
    <Ctrl+C> # Stop backend
    ```
  - **Deliverable:** Updated `apps/backend/src/api/routers/query.py`, `apps/backend/src/data_models/schemas.py`, and regenerated `packages/api-client`.
  - **Verification:** Confirm the new audio field is present in the API client.
  - **Action:** In the `apps/frontend/` chat interface (`apps/frontend/src/app/chat/page.tsx` or components), modify the display of LLM responses to include a playback button or automatically play the received audio.
  - **Suggested Tools:** HTML5 `<audio>` tag or a JavaScript audio library for playback from Base64.
  - **Deliverable:** Frontend chat interface capable of playing back audio responses.
  - **Verification:**
    - **Manual Test:** Send a query via chat; verify both text and audio responses are received and playable.
    - **E2E Test:** Update `packages/e2e-tests/` to perform a voice query, receive a text response, and verify audio playback.

---

### **Git Commit Checkpoint 3.1: Voice Interaction Implemented**

- **Action:** Stage and commit all changes related to STT frontend, TTS backend service and interface, API updates, API client regeneration, and frontend audio playback.
  ```bash
  git add apps/backend/src/tts/ apps/backend/src/interfaces/ apps/backend/src/api/ apps/backend/src/data_models/ apps/backend/docs/openapi.json packages/api-client/ apps/frontend/src/ packages/e2e-tests/
  git commit -m "feat(voice): Implement Speech-to-Text and Text-to-Speech for interactive queries"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match.

---

## 3.2 Expanded Input Modalities

**Goal:** Enable users to upload various file types for ingestion, including scanned documents, leveraging abstraction for OCR and parsing services.

- **Task 3.2.1: Implement OCR for Image/PDF Notes**

  - **Action:** Create a new module `apps/backend/src/ocr/` and define an `OCRService` interface in `apps/backend/src/interfaces/ocr_service.py` based on the **Abstraction Principle**.
    ```bash
    mkdir -p apps/backend/src/ocr
    touch apps/backend/src/ocr/__init__.py
    touch apps/backend/src/ocr/service.py
    touch apps/backend/src/interfaces/ocr_service.py
    ```
  - **Deliverable:** Necessary directories and empty files for OCR service and interface.
  - **Verification:** Run `ls apps/backend/src/ocr/service.py` and `ls apps/backend/src/interfaces/ocr_service.py`.
  - **Action:** Implement a concrete `OCRService` in `apps/backend/src/ocr/service.py` using a chosen OCR library (e.g., `Tesseract` via `pytesseract` for open-source, or cloud OCR APIs like AWS Textract/Google Cloud Vision).
  - **Action:** Add methods `extract_text_from_image(image_bytes: bytes) -> str` and `extract_text_from_pdf(pdf_bytes: bytes) -> str` (to handle multi-page PDFs).
  - **Action:** Update the `DocumentIngestionService` (`apps/backend/src/ingestion/service.py`) to handle image (JPEG, PNG) and PDF file uploads. The `POST /ingest/file` endpoint in `apps/backend/src/api/routers/ingestion.py` should be enhanced to accept file uploads (e.g., using `UploadFile` in FastAPI).
  - **Action:** For image uploads, pass the image bytes to `OCRService` to get text. For PDF uploads, pass the PDF bytes to `OCRService`. In both cases, feed the extracted text into the existing text ingestion pipeline (triggering a message to the "ingestion-queue" for asynchronous processing, adhering to the **Asynchronous Processing Principle**).
  - **Deliverable:**
    - `apps/backend/src/ocr/service.py` with `OCRService` implementation.
    - Updated `apps/backend/src/ingestion/service.py` and `apps/backend/src/api/routers/ingestion.py` to handle image and PDF files.
  - **Verification:**
    - **Unit Tests:** Write tests for `OCRService` in `apps/backend/tests/unit/test_ocr_service.py` with various image/PDF inputs (known good and bad scans).
    - **Integration Tests:** Update `packages/e2e-tests/` to upload a scanned image or a text-based PDF; verify the content is extracted and ingested correctly for the correct `user_id` (enforcing **Data Siloing Principle**).

- **Task 3.2.2: Enhance Bulk Upload for Common Document Types**
  - **Action:** Create a new module `apps/backend/src/parsing/` and define a `DocumentParserService` interface in `apps/backend/src/interfaces/document_parser_service.py` based on the **Abstraction Principle**.
    ```bash
    mkdir -p apps/backend/src/parsing
    touch apps/backend/src/parsing/__init__.py
    touch apps/backend/src/parsing/service.py
    touch apps/backend/src/interfaces/document_parser_service.py
    ```
  - **Deliverable:** Necessary directories and empty files for document parsing service and interface.
  - **Verification:** Run `ls apps/backend/src/parsing/service.py` and `ls apps/backend/src/interfaces/document_parser_service.py`.
  - **Action:** Implement a concrete `DocumentParserService` in `apps/backend/src/parsing/service.py` to support `.docx` (using `python-docx`) and `.md` (using a markdown parser like `markdown-it-py`).
  - **Action:** Extend `DocumentIngestionService` (`apps/backend/src/ingestion/service.py`) to integrate with `DocumentParserService`.
  - **Action:** Update the `POST /ingest/file` endpoint in `apps/backend/src/api/routers/ingestion.py` to accept these file types. Feed the extracted plain text into the existing text chunking and embedding pipeline (triggering asynchronous processing).
  - **Action:** In the `apps/frontend/`, update the file upload component (`apps/frontend/src/app/journal/page.tsx` or a dedicated upload page) to accept these new file types.
  - **Deliverable:**
    - `apps/backend/src/parsing/service.py` with parsing logic.
    - Updated `apps/backend/src/ingestion/service.py` and `src/api/routers/ingestion.py` to handle `.docx` and `.md` files.
    - Frontend file upload component updated.
  - **Verification:**
    - **Unit Tests:** Write tests for `DocumentParserService` in `apps/backend/tests/unit/test_parsing_service.py` with various `.docx` and `.md` inputs.
    - **Integration Tests:** Update `packages/e2e-tests/` to upload sample `.docx` and `.md` files; verify content is correctly ingested and retrievable via query for the correct `user_id`.
    - Test with large files to check performance.

---

### **Git Commit Checkpoint 3.2: Expanded Input Modalities**

- **Action:** Stage and commit all changes related to OCR backend service and interface, document parsing backend service and interface, updated ingestion API, and frontend file upload.
  ```bash
  git add apps/backend/src/ocr/ apps/backend/src/parsing/ apps/backend/src/interfaces/ apps/backend/src/ingestion/ apps/backend/src/api/ apps/frontend/src/ packages/e2e-tests/
  git commit -m "feat(input): Add OCR for images/PDFs and support for DOCX/MD files"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match.

---

## 3.3 Journaling & Basic Insights

**Goal:** Provide dedicated journaling functionality and automatically extract basic insights from entries, leveraging existing LLM services and ensuring data persistence.

- **Task 3.3.1: Implement Dedicated Journal Entry Capture & Storage**

  - **Action:** Update the relational database schema in `apps/backend/db/schema.sql` (and potentially `apps/backend/src/db/models.py` for ORM mapping) to create a new `JournalEntry` table with fields: `id`, `user_id` (FK, enforcing **Data Siloing Principle**), `content` (text), `created_at` (timestamp), `updated_at` (timestamp), `sentiment` (enum/float), `keywords` (array of strings), `summary` (text).
  - **Action:** Create a FastAPI endpoint `POST /journal/entry` in `apps/backend/src/api/routers/journal.py` that accepts journal content and `user_id`. Store the raw content in the new table. This API endpoint will be a **serverless function**.
  - **Action:** Create a FastAPI endpoint `GET /journal/entries` in `apps/backend/src/api/routers/journal.py` that retrieves a user's journal entries (paginated, by date). This API endpoint will also be a **serverless function**.
  - **Action:** Define a new Pydantic model for `JournalEntry` in `apps/backend/src/data_models/schemas.py`.
  - **Action:** Re-generate your shared API client (`packages/api-client`) to include the new journal endpoints and response schemas.
    ```bash
    # From monorepo root:
    turbo run backend#dev & # Ensure backend is running
    sleep 5 # Give it time to start
    curl http://localhost:8000/openapi.json > apps/backend/docs/openapi.json
    turbo run build --filter=@midjournal/api-client # Regenerate client
    fg # Bring backend to foreground
    <Ctrl+C> # Stop backend
    ```
  - **Deliverable:**
    - Updated `apps/backend/db/schema.sql` and `apps/backend/src/db/models.py`.
    - `apps/backend/src/data_models/schemas.py` with `JournalEntry` model.
    - `apps/backend/src/api/routers/journal.py` with `POST` and `GET` endpoints for journal entries.
    - Regenerated `packages/api-client`.
  - **Verification:**
    - **DB Migration:** Run the necessary database migration for the new table.
    - **Integration Tests:** Use `packages/e2e-tests/` to submit a journal entry via the frontend, then retrieve it to verify persistence for the correct `user_id`.
    - Direct database query to confirm data integrity.

- **Task 3.3.2: Implement Journal Analysis Service (Sentiment & Keywords)**

  - **Action:** Create a new module `apps/backend/src/analysis/` and implement a `JournalAnalysisService` based on the **Modularity Principle**.
    ```bash
    mkdir -p apps/backend/src/analysis
    touch apps/backend/src/analysis/__init__.py
    touch apps/backend/src/analysis/service.py
    touch apps/backend/src/analysis/consumer.py # For asynchronous processing
    ```
  - **Deliverable:** Necessary directories and empty files for journal analysis service and consumer.
  - **Verification:** Run `ls apps/backend/src/analysis/service.py` and `ls apps/backend/src/analysis/consumer.py`.
  - **Action:** Develop an asynchronous process (e.g., a message queue consumer for a "journal-analysis-queue" in `apps/backend/src/analysis/consumer.py`) that triggers when a new journal entry is saved (adhering to **Asynchronous Processing Principle**).
  - **Action:** The consumer should:
    1. Fetch the raw `JournalEntry.content`.
    2. Call `LLMInferenceService` (`apps/backend/src/llm/service.py`) with a specific prompt engineered for **sentiment analysis** (e.g., "Analyze the sentiment of the following text: [text]. Respond with 'Positive', 'Neutral', or 'Negative'.").
    3. Call `LLMInferenceService` with a specific prompt engineered for **keyword/theme extraction** (e.g., "Extract up to 5 key themes or keywords from the following text: [text]. Respond as a comma-separated list.").
    4. Update the `JournalEntry` in the database with the extracted `sentiment` and `keywords`.
  - **Suggested Tools:** `langchain` or `llama_index` for structured LLM calls and prompt engineering.
  - **Deliverable:**
    - `apps/backend/src/analysis/service.py` with analysis logic.
    - `apps/backend/src/analysis/consumer.py` for asynchronous processing.
    - Updated `apps/backend/src/api/routers/journal.py` (to publish message to "journal-analysis-queue" after saving, rather than directly calling analysis).
  - **Verification:**
    - **Unit Tests:** Write tests for `JournalAnalysisService` in `apps/backend/tests/unit/test_analysis_service.py` with various journal entries.
    - **Integration Tests:** Update `packages/e2e-tests/` to submit journal entries with clear positive, negative, and neutral sentiments; verify the `sentiment` and `keywords` fields are correctly populated in the database after asynchronous processing.

- **Task 3.3.3: Implement Basic Insight Display in Frontend**
  - **Action:** Update the "Journal Entry" UI or create a new "Journal Dashboard" page in `apps/frontend/src/app/journal/page.tsx` (or a new `apps/frontend/src/app/dashboard/page.tsx`).
  - **Action:** When displaying journal entries, fetch and show the associated `sentiment` and `keywords` using the updated `@midjournal/api-client`.
  - **Action:** Potentially add simple visualizations (e.g., a count of positive/negative entries, a word cloud for keywords using a frontend charting library if simple).
  - **Deliverable:** Frontend UI (`apps/frontend/`) displaying basic journal insights.
  - **Verification:** Verify that sentiment and keywords are visible and accurately reflect the content of journal entries in the frontend.

---

### **Git Commit Checkpoint 3.3: Journaling & Basic Insights**

- **Action:** Stage and commit all changes related to journal entry DB schema, backend API, analysis service and consumer, API client regeneration, and frontend display.
  ```bash
  git add apps/backend/db/schema.sql apps/backend/src/db/models.py apps/backend/src/data_models/ apps/backend/src/api/ apps/backend/src/analysis/ apps/backend/docs/openapi.json packages/api-client/ apps/frontend/src/ packages/e2e-tests/
  git commit -m "feat(journal): Add dedicated journaling and basic sentiment/keyword analysis"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match.

---

## 3.4 Personalized Query Suggestions

**Goal:** Provide proactive, context-aware query suggestions to enhance user interaction, leveraging LLM capabilities.

- **Task 3.4.1: Implement Query Suggestion Service**

  - **Action:** Create a new relational database table `ChatHistory` (`apps/backend/db/schema.sql`) to store user chat turns (`id`, `user_id`, `query`, `response`, `timestamp`). This will enable context-aware suggestions (adhering to **Data Siloing Principle**).
  - **Action:** Create a new module `apps/backend/src/suggestions/` and implement a `QuerySuggestionService` based on the **Abstraction Principle**.
    ```bash
    mkdir -p apps/backend/src/suggestions
    touch apps/backend/src/suggestions/__init__.py
    touch apps/backend/src/suggestions/service.py
    ```
  - **Deliverable:** Necessary directories and empty files for query suggestion service and updated DB schema.
  - **Verification:** Run `ls apps/backend/src/suggestions/service.py` and verify `ChatHistory` table in `db/schema.sql`.
  - **Action:** Create a FastAPI endpoint `GET /suggestions/query` in `apps/backend/src/api/routers/suggestions.py` that takes `user_id` and optionally a `current_context` (e.g., the last few chat turns, or the currently viewed journal entry ID). This will be a **serverless function**.
  - **Action:** Inside `QuerySuggestionService.get_suggestions(user_id: str, context: Optional[str] = None)`:
    1. Retrieve recent chat history for the `user_id` from the `ChatHistory` table.
    2. Optionally, retrieve relevant chunks from the vector store based on `current_context` and `user_id`.
    3. Call `LLMInferenceService` (`apps/backend/src/llm/service.py`) with a prompt engineered to generate relevant follow-up questions or insights based on the provided context (chat history, retrieved chunks).
    4. Return a list of 3-5 suggested query strings.
  - **Action:** Define a new Pydantic schema for the suggestion response in `apps/backend/src/data_models/schemas.py`.
  - **Action:** Re-generate your shared API client (`packages/api-client`) to include the new suggestions endpoint and response schemas.
    ```bash
    # From monorepo root:
    turbo run backend#dev & # Ensure backend is running
    sleep 5 # Give it time to start
    curl http://localhost:8000/openapi.json > apps/backend/docs/openapi.json
    turbo run build --filter=@midjournal/api-client # Regenerate client
    fg # Bring backend to foreground
    <Ctrl+C> # Stop backend
    ```
  - **Deliverable:**
    - `apps/backend/src/suggestions/service.py`.
    - `apps/backend/src/api/routers/suggestions.py` with the `/suggestions/query` endpoint.
    - `apps/backend/src/data_models/schemas.py` updated.
    - Regenerated `packages/api-client`.
  - **Verification:**
    - **Unit Tests:** Write tests for `QuerySuggestionService` in `apps/backend/tests/unit/test_suggestion_service.py` with various contexts.
    - **Integration Test:** Update `packages/e2e-tests/` to perform a chat interaction, then request suggestions; verify the suggestions are relevant and helpful.

- **Task 3.4.2: Integrate Suggestions into Frontend Chat Interface**
  - **Action:** In the `apps/frontend/` chat interface (`apps/frontend/src/app/chat/page.tsx`), display the suggested queries (e.g., as clickable buttons below the chat input or LLM response).
  - **Action:** Implement client-side logic so that when a user clicks a suggestion, it either populates the chat input field or automatically sends the query.
  - **Deliverable:** Frontend chat (`apps/frontend/`) with dynamic query suggestions.
  - **Verification:** Click on suggestions and verify they correctly trigger new queries or populate the input field.

---

### **Git Commit Checkpoint 3.4: Personalized Query Suggestions**

- **Action:** Stage and commit all changes related to `ChatHistory` table, query suggestion backend service, API endpoint, API client regeneration, and frontend integration.
  ```bash
  git add apps/backend/db/schema.sql apps/backend/src/data_models/ apps/backend/src/api/ apps/backend/src/suggestions/ apps/backend/docs/openapi.json packages/api-client/ apps/frontend/src/ packages/e2e-tests/
  git commit -m "feat(suggestions): Implement personalized LLM-driven query suggestions"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match.

---

## 3.5 Scalability & Cost Optimization (Phase 3)

**Goal:** Improve the robustness and efficiency of the RAG pipeline for future growth, implementing further **Observability** and **Asynchronous Processing** refinements.

- **Task 3.5.1: Refine Message Queue Usage & Error Handling**

  - **Action:** Review all message producers and consumers within `apps/backend/src/` to ensure idempotent processing (messages can be safely retried without adverse effects). This is crucial for the **Asynchronous Processing Principle**.
  - **Action:** Implement Dead-Letter Queues (DLQs) for all critical message queues (e.g., `ingestion-queue`, `journal-analysis-queue`). Messages that fail processing after a configured number of retries should be moved to a DLQ for manual inspection/reprocessing. Configure these using IaC in `apps/backend/infra/`.
  - **Action:** Implement robust retry mechanisms (with exponential backoff) for transient failures in all external service calls (e.g., database connection issues, temporary LLM API errors, Vector DB errors) using libraries like `tenacity` for Python.
  - **Deliverable:**
    - Updated message queue consumer code (`apps/backend/src/ingestion/consumer.py`, `apps/backend/src/analysis/consumer.py`) with idempotency and retry logic.
    - DLQs configured in `apps/backend/infra/` for relevant queues.
  - **Verification:**
    - **Integration Tests:** Simulate transient failures (e.g., temporarily disconnect DB or mock external service errors); verify retries work and messages are eventually processed or moved to DLQ.
    - **Manual Inspection:** After simulating failures, manually inspect the DLQ via cloud console or RabbitMQ management UI for any failed messages.

- **Task 3.5.2: Explore Initial LLM Cost Optimizations**

  - **Action:** For self-hosted LLMs (Ollama), investigate and implement:
    - **Quantized Models:** Test performance and accuracy with 4-bit or 8-bit quantized versions of the chosen LLM. Update `model_config` in `LLMInferenceService` (`apps/backend/src/llm/service.py`).
    - **Batching:** For non-real-time LLM calls (e.g., for journal analysis), implement request batching to reduce inference costs and increase throughput. This will primarily affect asynchronous consumers.
  - **Action:** For cloud-based LLMs, monitor API usage costs via your cloud provider's billing dashboard and identify any immediate optimization opportunities (e.g., adjusting model size, caching frequently used prompts, leveraging cheaper inference endpoints if available).
  - **Deliverable:**
    - Updated `apps/backend/src/llm/service.py` to support quantized models or batching (if applicable).
    - A short report (`apps/backend/docs/devops/llm_cost_analysis_p2.md`) on initial cost findings and recommendations.
  - **Verification:**
    - Monitor LLM inference costs via cloud provider dashboards (or local resource usage for Ollama).
    - Verify functional correctness and response quality after applying optimizations using your existing E2E tests.

- **Task 3.5.3: Set up Detailed Metrics (Observability Phase 3)**
  - **Action:** For each core backend service (API Gateway, Ingestion API and Consumer, Query API, Analysis Consumer, TTS Service), instrument the code to expose custom metrics (adhering to **Observability Principle**):
    - **Request Latency:** Histogram for API endpoint response times.
    - **Error Rate:** Counter for specific error types (e.g., `LLM_API_ERROR`, `VECTOR_DB_TIMEOUT`).
    - **Throughput:** Counter for successful requests per second.
    - **Queue Depth:** Gauge for the number of messages in relevant queues.
  - **Action:** Integrate a metrics collection agent (e.g., Prometheus exporter sidecar for Docker services, or CloudWatch custom metrics for Lambda) using `apps/backend/infra/` for production, and configure `docker-compose.yml` for local dev.
  - **Action:** Create a basic Grafana dashboard (connected to Prometheus or CloudWatch) with key metrics for each service (latency, error rate, throughput, queue depth) for Phase 3 services.
  - **Suggested Tools:** `Prometheus`, `Grafana`, `cortex` (for long-term storage if needed), `boto3` (for CloudWatch custom metrics).
  - **Deliverable:**
    - Backend services (`apps/backend/src/`) instrumented with metrics.
    - Metrics collection configured in `apps/backend/infra/` and `docker-compose.yml`.
    - Initial Grafana dashboard.
  - **Verification:**
    - Generate traffic to the application (e.g., via `packages/e2e-tests/` or load tests); verify metrics appear in Grafana and reflect system behavior.
    - Trigger intentional errors and confirm they increment error counters on the dashboard.

---

### **Git Commit Checkpoint 3.5: Scalability & Cost Optimization**

- **Action:** Stage and commit all changes related to message queue refinements (idempotency, DLQs), retry mechanisms, LLM cost optimizations, and detailed metrics setup.
  ```bash
  git add apps/backend/src/ apps/backend/infra/ apps/backend/docs/devops/ docker-compose.yml
  git commit -m "feat(perf/observability): Enhance message queue robustness, LLM cost, and detailed metrics"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match.

---

**Completion of Phase 3:** The application now supports multiple input modalities (text, voice, image/PDF, DOCX, MD), provides basic automated insights from journal entries, and offers personalized query suggestions. The backend's robustness is enhanced with improved message queue handling, and initial steps for cost optimization and detailed monitoring are in place, all developed in alignment with our defined architectural principles. The frontend is updated to support these new features.

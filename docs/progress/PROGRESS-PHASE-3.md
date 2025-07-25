# Phase 3 Progress: Enhanced Interactivity & Input Modalities

**Objective:** Expand the application's input methods beyond text, introduce basic automated insight generation from journal entries, and refine user experience, all while adhering to our architectural principles.

**Status:** In Progress

---

## 3.1 Voice Interaction (Speech-to-Text & Text-to-Speech)

- [x] **Task 3.1.1: Integrate Client-Side Speech-to-Text (STT)**
  - [x] Add microphone button to chat and journal UIs.
  - [x] Implement client-side audio capture and transcription (e.g., Web Speech API).
  - [x] Send transcribed text to existing API endpoints.
- [x] **Task 3.1.2: Implement Backend Text-to-Speech (TTS) Service**
  - [x] Create `TextToSpeechService` interface and `tts` module.
  - [x] Implement concrete TTS service (e.g., gTTS).
  - [x] Implement `synthesize_speech` method.
- [x] **Task 3.1.3: Integrate TTS into Query API & Frontend Playback**
  - [x] Create `/tts/synthesize` endpoint.
  - [x] Update API schema to include audio in response.
  - [x] Wire up frontend to call TTS endpoint and play audio.

---

## 3.2 Expanded Input Modalities

- [x] **Task 3.2.1: Implement OCR for Image/PDF Notes**
  - [x] Create `OCRService` interface and `ocr` module.
  - [x] Implement concrete OCR service (e.g., Tesseract).
  - [x] Enhance ingestion service and API to handle image/PDF uploads.
  - [x] Feed extracted text into the asynchronous ingestion pipeline.
- [x] **Task 3.2.2: Enhance Bulk Upload for Common Document Types**
  - [x] Create `DocumentParserService` interface and `parsing` module.
  - [x] Implement concrete parsing service for `.docx` and `.md`.
  - [x] Enhance ingestion service and API to handle `.docx`/`.md` uploads.
  - [x] Update frontend to accept new file types.

---

## 3.3 Journaling & Basic Insights

- [x] **Task 3.3.1: Implement Dedicated Journal Entry Capture & Storage**
  - [x] Update DB schema with `JournalEntry` table.
  - [x] Create `POST /journal/entry` and `GET /journal/entries` endpoints.
  - [x] Define `JournalEntry` Pydantic model.
  - [x] Regenerate shared API client.
- [x] **Task 3.3.2: Implement Journal Analysis Service (Sentiment & Keywords)**
  - [x] Create `analysis` module and `JournalAnalysisService`.
  - [x] Develop asynchronous consumer for a `journal-analysis-queue`.
  - [x] Use `LLMInferenceService` for sentiment/keyword extraction.
  - [x] Update `JournalEntry` in DB with analysis results.
- [x] **Task 3.3.3: Implement Basic Insight Display in Frontend**
  - [x] Update frontend to display sentiment and keywords for journal entries.
  - [x] Add simple visualizations (e.g., word cloud).

---

## 3.4 Personalized Query Suggestions

- [x] **Task 3.4.1: Implement Query Suggestion Service**
  - [x] Update DB schema with `ChatHistory` table.
  - [x] Create `QuerySuggestionService` interface and `suggestions` module.
  - [x] Create `GET /suggestions/query` endpoint.
  - [x] Use LLM to generate suggestions based on chat history/context.
  - [x] Regenerate shared API client.
- [x] **Task 3.4.2: Integrate Suggestions into Frontend Chat Interface**
  - [x] Display suggestions as clickable buttons in the UI.
  - [x] Clicking a suggestion populates input or sends query.

---

## 3.5 Scalability & Cost Optimization (Phase 3)

- [x] **Task 3.5.1: Refine Message Queue Usage & Error Handling**
  - [x] Ensure idempotent processing in consumers.
  - [x] Implement Dead-Letter Queues (DLQs) for critical queues.
  - [x] Implement robust retry mechanisms with exponential backoff.
- [x] **Task 3.5.2: Explore Initial LLM Cost Optimizations**
  - [x] Test and implement quantized models for self-hosted LLMs.
  - [x] Implement request batching for non-real-time LLM calls.
- [ ] **Task 3.5.3: Set up Detailed Metrics (Observability)**
  - [ ] Instrument backend services with custom metrics (latency, error rate, throughput).
  - [ ] Integrate metrics collection agent (e.g., Prometheus).
  - [ ] Create a basic Grafana dashboard.
- [ ] **Task 3.5.4: Set up Structured Logging (Observability)**
  - [ ] Integrate a structured logging library (e.g., `structlog`).
  - [ ] Replace all `print` and basic `logging` calls.
  - [ ] Configure structured output (JSON).
- [ ] **Task 3.5.5: Set up Distributed Tracing (Observability)**
  - [ ] Integrate OpenTelemetry for distributed tracing.
  - [ ] Propagate trace context across services.
  - [ ] Visualize traces in Jaeger or a similar tool.

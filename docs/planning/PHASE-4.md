# Phase 4: Advanced Features & Refinement

**Objective:** Introduce creative AI capabilities (image generation), enable personalized and complex data insights, and significantly enhance system security, data governance, and overall robustness within the monorepo. This phase strictly adheres to our architectural principles of Abstraction, Modularity, Asynchronous Processing, Data Siloing, Observability, Infrastructure as Code, and Monorepo Best Practices.

**Duration:** Weeks 19-26 (Estimate: 8 weeks. Target completion: ~December 15, 2025 AEST)

**Current Root:** `/Users/thomasshields/midjournal_app`
**Backend App:** `apps/backend`
**Frontend App:** `apps/frontend`
**Shared Packages:** `packages/api-client`, `packages/e2e-tests`

---

## 4.1 Image Generation for Journaling

**Goal:** Provide a visual "reward" and creative expression by generating images based on journal entries, ensuring the **ImageGenerationService** is abstract and processing is **asynchronous**.

- **Task 4.1.1: Integrate Image Generation Service (Backend)**

  - **Action:** Create a new module `apps/backend/src/image_gen/` and define an `ImageGenerationService` **interface** (e.g., `apps/backend/src/interfaces/image_generation_service.py`) if not already present from Phase 0.
    ```bash
    mkdir -p apps/backend/src/image_gen
    touch apps/backend/src/image_gen/__init__.py
    touch apps/backend/src/image_gen/service.py
    touch apps/backend/src/interfaces/image_generation_service.py
    ```
  - **Deliverable:** Necessary directories and empty files for image generation service.
  - **Verification:** Run `ls apps/backend/src/image_gen/service.py` and `ls apps/backend/src/interfaces/image_generation_service.py`.
  - **Action:** Implement a concrete `ImageGenerationService` in `apps/backend/src/image_gen/service.py` using a self-hosted Stable Diffusion variant (e.g., via `Hugging Face Diffusers` or `Automatic1111 web UI API`). This service should implement `generate_image(prompt: str, user_id: str, style_parameters: Dict) -> bytes`.
  - **Action:** Create a dedicated "image-gen-queue" and a new **asynchronous** consumer (`apps/backend/src/image_gen/consumer.py`) for the image generation process. This consumer will subscribe to messages from the "image-gen-queue" and trigger the `ImageGenerationService`. This strictly adheres to the **Asynchronous Processing Principle**.
  - **Deliverable:** `apps/backend/src/image_gen/service.py` with `ImageGenerationService` implementation, and `apps/backend/src/image_gen/consumer.py` for asynchronous processing.
  - **Verification:**
    - **Unit Test:** Write a unit test for `generate_image` in `apps/backend/tests/unit/test_image_gen_service.py` with mock image generation to verify interface adherence and parameter handling.
    - **Integration Test (Async):** Programmatically send a message to the "image-gen-queue" (e.g., using your `MessageQueueClient`), then verify the `image_gen/consumer.py` processes it and `generate_image` is invoked. Ensure that `user_id` is propagated and enforced where data is stored, aligning with **Data Siloing**.

- **Task 4.1.2: Develop Prompt Generation Module from Journal Insights**

  - **Action:** Create `apps/backend/src/image_gen/prompt_generator.py`.
    ```bash
    touch apps/backend/src/image_gen/prompt_generator.py
    ```
  - **Deliverable:** Empty `prompt_generator.py` file.
  - **Verification:** Run `ls apps/backend/src/image_gen/prompt_generator.py`.
  - **Action:** Modify the `apps/backend/src/analysis/consumer.py` (or create a new chained consumer) to trigger image prompt generation after sentiment/keyword analysis of a `JournalEntry`. The prompt generator (`apps/backend/src/image_gen/prompt_generator.py`) will leverage `JournalEntry.content`, `sentiment`, and `keywords` and `LLMInferenceService` (from `apps/backend/src/llm/service.py`) to create descriptive image prompts. This ensures the prompt generation is modular and uses existing LLM capabilities.
  - **Action:** Publish a message to the "image-gen-queue" with the generated prompt and `user_id` for asynchronous image generation.
  - **Deliverable:** Updated `apps/backend/src/analysis/consumer.py` logic and `apps/backend/src/image_gen/prompt_generator.py` containing the logic to transform journal insights into LLM-driven image prompts.
  - **Verification:**
    - **Unit Test:** Write tests for `prompt_generator.py` in `apps/backend/tests/unit/test_image_gen_prompt.py` with sample journal entries to verify generated prompts are coherent and creative.
    - **Integration Test:** Submit a sample journal entry via the backend API; inspect queue messages or logs to confirm an image generation prompt is created and queued for the image generation service.

- **Task 4.1.3: Display Generated Images in Journaling Interface (Frontend)**
  - **Action:** When an image is generated (and stored in S3 or other cloud storage), ensure its URL is stored and linked to the corresponding `JournalEntry` in your PostgreSQL database (`apps/backend/src/db/models.py`). This will involve adding a new column to the `JournalEntry` model, maintaining **Data Siloing**.
  - **Action:** Update the backend API (`apps/backend/src/api/routers/journal.py`) to return the image URL when querying journal entries. You'll also need to update the Pydantic schema in `apps/backend/src/data_models/schemas.py`.
  - **Action:** Re-generate your shared API client (`packages/api-client`) to include the updated `JournalEntry` schema with the image URL field.
    ```bash
    # From monorepo root:
    turbo run backend#dev & # Ensure backend is running
    sleep 5 # Give it time to start
    curl http://localhost:8000/openapi.json > apps/backend/docs/openapi.json
    turbo run build --filter=@midjournal/api-client # Regenerate client
    fg # Bring backend to foreground
    <Ctrl+C> # Stop backend
    ```
  - **Deliverable:** Backend database schema, API, and regenerated API client updated to support image URLs.
  - **Verification:** Verify the `JournalEntry` model and API schema now include an image URL field. Confirm `packages/api-client/src/models/JournalEntry.ts` has the new field.
  - **Action:** In the `apps/frontend/` "Journal Dashboard" or "Journal Entry" view (`apps/frontend/src/app/journal/page.tsx` or components), display the generated image alongside the journal content. Implement a simple image gallery or carousel if multiple images can be associated or styles are selectable.
  - **Deliverable:** Frontend displays AI-generated images linked to journal entries.
  - **Verification:**
    - **Manual Test:** Log in to the frontend and navigate to the journal view. Verify a placeholder or a generated image appears correctly for journal entries (you might need to manually trigger image generation or mock its presence for initial testing).
    - **End-to-end Test:** Update `packages/e2e-tests/` to submit a journal entry from the frontend; verify an image is eventually generated (after asynchronous processing) and appears in the UI.

---

### **Git Commit Checkpoint 4.1: Image Generation Integrated**

- **Action:** Stage and commit all changes related to image generation backend logic, prompt generation, frontend display, and API client updates.
  ```bash
  git add apps/backend/src/image_gen/ apps/backend/src/interfaces/ apps/backend/src/data_models/ apps/backend/src/db/models.py apps/backend/src/api/ apps/backend/docs/openapi.json packages/api-client/ apps/frontend/src/
  git commit -m "feat(image-gen): Implement AI image generation and display for journal entries"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match.

---

## 4.2 Custom Insight Generation & Visualization

**Goal:** Empower users to ask complex questions about their entire personal data corpus and visualize the aggregated insights, leveraging the **LLM Inference Service** and respecting **Data Siloing**.

- **Task 4.2.1: Implement Custom Insight Generation Service (Backend)**

  - **Action:** Create a new module `apps/backend/src/custom_insights/`.
    ```bash
    mkdir -p apps/backend/src/custom_insights
    touch apps/backend/src/custom_insights/__init__.py
    touch apps/backend/src/custom_insights/service.py
    ```
  - **Deliverable:** Necessary directories and empty files for custom insights service.
  - **Verification:** Run `ls apps/backend/src/custom_insights/service.py`.
  - **Action:** Develop a `CustomInsightService` in `apps/backend/src/custom_insights/service.py` that accepts a natural language query and `user_id`. Use `LLMInferenceService` (from `apps/backend/src/llm/service.py`) to:
    1.  Identify relevant data points/types across the user's data (journal entries, ingested documents).
    2.  Formulate structured queries (e.g., for PostgreSQL `apps/backend/src/db/database.py` or Vector DB `apps/backend/src/vector_store/clients/qdrant.py`), **always including the `user_id` filter for data siloing**.
    3.  Synthesize a high-level textual summary from the retrieved data.
    4.  Crucially, request the LLM to output structured data (e.g., JSON with specific keys for charts) if a visualization is intended, aligning with structured output for later processing.
  - **Action:** Create a new FastAPI endpoint `POST /insights/custom` in `apps/backend/src/api/routers/insights.py` (create this new router for better **Modularity**) that returns textual summaries and/or structured data. Define a new Pydantic schema in `apps/backend/src/data_models/schemas.py` for the insight response. This API endpoint will be a **serverless function**.
  - **Deliverable:** `apps/backend/src/custom_insights/service.py` and a new FastAPI endpoint for custom insights, with updated schemas.
  - **Verification:**
    - **Unit Test:** `apps/backend/tests/unit/test_custom_insights_service.py` with mock LLM and DB interactions for various queries.
    - **Integration Test:** Start the backend. Use `curl` or `Postman` to send a `POST` request to `/insights/custom` with a sample query (e.g., `{"query": "Show me my mood trends over the last month", "user_id": "..."}`). Verify an appropriate textual summary and/or structured data is returned.
  - **Action:** Re-generate your shared API client (`packages/api-client`) to include the new custom insights endpoint and response schemas.
    ```bash
    # From monorepo root:
    turbo run backend#dev & # Ensure backend is running
    sleep 5 # Give it time to start
    curl http://localhost:8000/openapi.json > apps/backend/docs/openapi.json
    turbo run build --filter=@midjournal/api-client # Regenerate client
    fg # Bring backend to foreground
    <Ctrl+C> # Stop backend
    ```
  - **Deliverable:** API client updated with custom insights API.
  - **Verification:** Confirm `packages/api-client/src/models/` and `packages/api-client/src/api/` contain definitions for custom insights.

- **Task 4.2.2: Implement Data Visualization (Frontend)**
  - **Action:** In `apps/frontend/`, integrate a charting library (e.g., `React-Chartjs-2`).
    ```bash
    # From monorepo root:
    pnpm add react-chartjs-2 chart.js --filter=frontend
    pnpm add -D @types/chart.js --filter=frontend
    ```
  - **Deliverable:** Charting library added to frontend dependencies.
  - **Verification:** Check `apps/frontend/package.json` for `react-chartjs-2` and `chart.js`.
  - **Action:** Create a new "Custom Insights" page/component in `apps/frontend/src/app/insights/page.tsx` (and link from layout/navigation).
  - **Action:** Implement logic to parse the structured data (JSON) received from `POST /insights/custom` via your `@midjournal/api-client` and render appropriate charts (bar, line, etc.) using the chosen charting library. Allow users to input custom queries into a text field on this page.
  - **Deliverable:** Frontend page capable of rendering dynamic charts from backend-generated structured insights, and an input field for queries.
  - **Verification:**
    - **Manual Test:** Start both frontend and backend: `turbo run dev`.
    - Navigate to the new "Custom Insights" page.
    - Enter a query (e.g., "Show my mood over time").
    - Verify a relevant chart appears and visualizes the data.
    - Stop dev servers (`Ctrl+C`).

---

### **Git Commit Checkpoint 4.2: Custom Insights & Visualization**

- **Action:** Stage and commit all changes related to custom insights backend logic, frontend visualization, and API client updates.
  ```bash
  git add apps/backend/src/custom_insights/ apps/backend/src/api/ apps/backend/src/data_models/ apps/backend/docs/openapi.json packages/api-client/ apps/frontend/src/ apps/frontend/package.json pnpm-lock.yaml
  git commit -m "feat(custom-insights): Enable LLM-driven custom insights with frontend visualization"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match.

---

## 4.3 Enhanced Frontend & User Preferences

**Goal:** Provide a more polished user experience with greater personalization options, ensuring settings are persisted and used across services.

- **Task 4.3.1: UI for Viewing and Interacting with Custom Insights (Frontend)**

  - **Action:** Refine the "Custom Insights" page (`apps/frontend/src/app/insights/page.tsx`) to include:
    - A history of past custom queries and their generated charts/summaries (e.g., storing recent queries in local storage for a simpler V1, or a user-specific `UserInsightsHistory` DB table for a more robust solution, ensuring **Data Siloing**).
    - Ability to save favorite insights (requires backend support for a `SavedInsights` table in `apps/backend/src/db/models.py`).
    - Export options for insights (e.g., CSV for data, PNG for charts).
  - **Deliverable:** Fully featured "Custom Insights" dashboard UI.
  - **Verification:** Test saving, retrieving from history, and exporting various insights from the frontend.

- **Task 4.3.2: Implement User Settings for Preferences (Backend & Frontend)**
  - **Action:** Create a new relational database table `UserSettings` linked to `User` (`apps/backend/src/db/models.py`) with fields like `user_id` (FK, enforcing **Data Siloing**), `llm_tone` (e.g., 'formal', 'casual'), `image_style` (e.g., 'abstract', 'realistic'). This will require a migration.
  - **Action:** Create backend API endpoints (`GET /settings`, `PUT /settings`) in a new `apps/backend/src/api/routers/settings.py` router to manage user preferences. Update `apps/backend/src/data_models/schemas.py` for user settings. These API endpoints will be **serverless functions**.
  - **Deliverable:** `UserSettings` DB table, associated CRUD API endpoints, and updated schemas.
  - **Verification:**
    - Perform DB migration.
    - Use `curl` or `Postman` to `GET` and `PUT` user settings; verify changes persist in the database for the correct `user_id`.
  - **Action:** Re-generate your shared API client (`packages/api-client`) to include the new settings endpoints and schemas.
    ```bash
    # From monorepo root:
    turbo run backend#dev & # Ensure backend is running
    sleep 5 # Give it time to start
    curl http://localhost:8000/openapi.json > apps/backend/docs/openapi.json
    turbo run build --filter=@midjournal/api-client # Regenerate client
    fg # Bring backend to foreground
    <Ctrl+C> # Stop backend
    ```
  - **Deliverable:** API client updated with user settings API.
  - **Verification:** Confirm `packages/api-client/src/api/` contains definitions for user settings.
  - **Action:** Create a "Settings" page in the frontend (`apps/frontend/src/app/settings/page.tsx`) where users can adjust their `llm_tone` and `image_style` using the new API client.
  - **Action:** Integrate these preferences into `LLMInferenceService` (`apps/backend/src/llm/service.py`) and `ImageGenerationService` (`apps/backend/src/image_gen/service.py`) in the backend. When making LLM or image generation calls, retrieve the user's settings and pass `llm_tone` or `image_style` as parameters (e.g., `model_config`). This demonstrates using the stored preferences.
  - **Deliverable:** Frontend "Settings" page, and backend services utilizing user preferences.
  - **Verification:**
    - Change a setting in the frontend's "Settings" page.
    - Generate a new image or query the LLM. Verify the output reflects the changed preference (e.g., a more "formal" tone or "abstract" image style).

---

### **Git Commit Checkpoint 4.3: Enhanced Frontend & User Preferences**

- **Action:** Stage and commit all changes related to refined custom insights UI, user settings backend, frontend settings page, and service integration.
  ```bash
  git add apps/backend/src/db/models.py apps/backend/src/api/ apps/backend/src/data_models/ apps/backend/src/llm/service.py apps/backend/src/image_gen/service.py apps/backend/docs/openapi.json packages/api-client/ apps/frontend/src/ apps/frontend/package.json pnpm-lock.yaml
  git commit -m "feat(user-settings): Implement user preferences and enhance custom insights UI"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match.

---

## 4.4 Security & Data Governance Hardening

**Goal:** Ensure the system is highly secure, compliant with privacy regulations, and provides users control over their data, critically adhering to **Data Siloing** and **Infrastructure as Code**.

- **Task 4.4.1: Implement Comprehensive Data Encryption**

  - **Action:** **Data at Rest Encryption:** Verify (and update `apps/backend/infra/` Pulumi code if necessary) PostgreSQL, Vector Database (Qdrant), and S3 buckets (for images/documents) are configured for encryption at rest (e.g., AWS RDS encryption, Qdrant encryption settings, S3 SSE-S3/SSE-KMS). This is a foundational security measure.
  - **Action:** **Data in Transit Encryption:** Ensure all API endpoints are served over HTTPS (enforced by API Gateway/Load Balancer via `apps/backend/infra/`). Verify all internal service-to-service communication uses TLS (e.g., secure connections for RabbitMQ, Postgres, Qdrant within Docker Compose for local dev, and cloud services for deployed infra). This protects data as it moves through the system.
  - **Deliverable:** Updated `apps/backend/infra/` IaC with encryption configurations; updated documentation (`apps/backend/docs/devops/security.md`) confirming encryption in transit and at rest.
  - **Verification:**
    - **Local:** For Docker Compose, check configurations like `db_data` volume encryption (if supported) and confirm `https` for local API endpoints.
    - **Cloud (Manual/Scripted):** After deployment, use cloud provider consoles/CLI to confirm encryption settings are active for all relevant resources deployed via Pulumi.
    - **Network:** Review cloud provider network flow logs or use local tools (e.g., `openssl s_client`) to verify TLS/SSL for internal communications.

- **Task 4.4.2: Refine Access Controls & Data Isolation Enforcement**

  - **Action:** Conduct a thorough review of all service-to-service communication and FastAPI API endpoints (`apps/backend/src/api/routers/`).
  - **Action:** Implement the **Principle of Least Privilege** within your `apps/backend/infra/` Pulumi stack for IAM roles. Each backend service/Lambda function should have the minimum necessary IAM permissions required for its function.
  - **Action:** Double-check all database (`apps/backend/src/db/database.py`) and vector database (`apps/backend/src/vector_store/clients/qdrant.py`) queries to ensure `user_id` filtering is **always** applied and cannot be bypassed. This is paramount for **Data Siloing**.
  - **Action:** Add rate limiting and WAF (Web Application Firewall) rules at the API Gateway level using your `apps/backend/infra/` Pulumi code. This protects against common web attacks and abuse.
  - **Deliverable:** Updated IAM policies in `apps/backend/infra/`, confirmed `user_id` enforcement in backend services, and API Gateway WAF/rate limit rules.
  - **Verification:**
    - **Access Control Audit:** Manually review IAM policies in your cloud provider for `apps/backend` services deployed via Pulumi.
    - **Data Isolation Test:** With a valid user token, update `packages/e2e-tests/` to attempt to query/access data belonging to a _different_ user. This should consistently fail with an authorization error.
    - **Rate Limiting Test:** Use a load testing tool (e.g., `locust`, `hey`) to send a high volume of requests to an endpoint; verify rate limiting is enforced (e.g., 429 Too Many Requests response).

- **Task 4.4.3: Develop Data Retention, Deletion, and Export Policies/Tools**

  - **Action:** **Policy Definition:** Create a new document `apps/backend/docs/legal/data_privacy_policy.md`. Define clear data retention, deletion, and export procedures compliant with Australian privacy laws (Australian Privacy Principles, Privacy Act 1988).
  - **Deliverable:** Documented data privacy policy.
  - **Verification:** Review the document for clarity and completeness with legal/compliance (if applicable).
  - **Action:** **Data Deletion:** Implement a "Delete My Account" feature in `apps/frontend/src/app/settings/page.tsx` which triggers a backend API endpoint (`DELETE /user/data` in `apps/backend/src/api/routers/auth.py` or a new `user.py` router for user management). This backend process, adhering to **Modularity**, should permanently delete all associated user data from PostgreSQL (`apps/backend/src/db/`), Vector DB (`apps/backend/src/vector_store/`), and S3 (if used for images/documents), for the specified `user_id`. Implement soft delete first, then a hard delete after a retention period.
  - **Action:** **Data Export:** Implement an "Export My Data" feature in `apps/frontend/src/app/settings/page.tsx` which triggers a backend API endpoint (`GET /user/export` in `apps/backend/src/api/routers/auth.py` or `user.py`). This backend process should collect all user data for the given `user_id` and package it into a common format (e.g., JSON or CSV archive) for the user to download.
  - **Deliverable:** Backend API endpoints for deletion/export, and Frontend UI for these features.
  - **Verification:**
    - **Data Deletion Test:** Update `packages/e2e-tests/` to create a test user, add some journal entries/images. Use the frontend "Delete My Account" feature. Verify no traces of the user's data remain in any database or storage after the process completes.
    - **Data Export Test:** Update `packages/e2e-tests/` to create a test user with data. Use the frontend "Export My Data" feature. Verify the downloaded archive is complete and correctly formatted.

- **Task 4.4.4: Conduct Initial Security Audits/Penetration Testing (Automated within Monorepo)**
  - **Action:** Integrate a basic automated security scan into your `turbo.json` for both backend and frontend. This enables continuous security checks within your **Monorepo Best Practices**.
    ```json
    // In turbo.json, under tasks:
    "backend#security-scan": {
      "cwd": "apps/backend",
      "command": "poetry run bandit -r src/", // Example: Bandit for Python security
      "outputs": [],
      "cache": false
    },
    "frontend#security-scan": {
      "cwd": "apps/frontend",
      "command": "pnpm audit --audit-level critical", // Example: pnpm audit
      "outputs": [],
      "cache": false
    }
    ```
  - **Deliverable:** Turborepo security scan tasks defined. A short report (`apps/backend/docs/devops/security_scan_report_p4.md`) summarizing initial findings and remediation plan.
  - **Verification:** Run `turbo run backend#security-scan` and `turbo run frontend#security-scan`. Review their output for immediate vulnerabilities. Prioritize and remediate any critical or high-severity vulnerabilities identified. Re-scan to confirm vulnerabilities are closed. _Note: For a true penetration test, a third-party firm is usually engaged later._

---

### **Git Commit Checkpoint 4.4: Security & Data Governance Hardening**

- **Action:** Stage and commit all changes related to encryption (infra), access controls, data isolation, WAF/rate limits (infra), data retention/deletion/export features, security policy documentation, and new security scan tasks.
  ```bash
  git add apps/backend/infra/ apps/backend/src/ apps/backend/docs/ apps/frontend/src/ apps/frontend/package.json turbo.json
  git commit -m "feat(security): Implement comprehensive security & data governance features"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match.

---

## 4.5 Robustness & Observability (Monorepo Adapted)

**Goal:** Mature the system's resilience, error handling, and monitoring capabilities, reinforcing the **Observability Principle**.

- **Task 4.5.1: Implement Comprehensive Error Handling & Retry Mechanisms (Backend)**

  - **Action:** Review and standardize error handling across all backend services in `apps/backend/src/`, using custom exceptions where appropriate and consistent error responses for the FastAPI API (`apps/backend/src/api/`). This promotes a predictable API.
  - **Action:** Implement global exception handlers for FastAPI in `apps/backend/src/api/main.py`.
  - **Action:** Ensure all external API calls (LLM, Vector DB, Image Gen, TTS, etc.) from `apps/backend/src/` have robust retry logic with exponential backoff and circuit breakers (e.g., using libraries like `tenacity` for Python). This enhances system resilience against transient failures.
  - **Deliverable:** Standardized error handling, global exception handlers, and robust retry/circuit breaker patterns in backend code.
  - **Verification:**
    - **Unit Test:** Write tests in `apps/backend/tests/unit/test_error_handling.py` to assert custom exceptions are raised and handled.
    - **Integration Test:** Simulate external service failures (e.g., mock a 500 response from an LLM API); verify retries are attempted and fallbacks/errors are handled gracefully in your backend logs.

- **Task 4.5.2: Set up Distributed Tracing (OpenTelemetry)**

  - **Action:** Instrument all backend services (FastAPI endpoints, ingestion consumer, analysis consumer, image gen consumer, TTS service) within `apps/backend/src/` with OpenTelemetry SDK for Python. This will involve modifying `main.py` and potentially adding middleware or decorators to services.
  - **Action:** Configure traces to be exported to a central tracing backend (e.g., Jaeger, Tempo). This configuration can be part of your `apps/backend/infra/` Pulumi setup for cloud deployment or `docker-compose.yml` for local development.
  - **Action:** Ensure context propagation (e.g., W3C Trace Context) is correctly implemented across service boundaries (HTTP headers, message queue headers). This provides a complete view of end-to-end request flows.
  - **Deliverable:** Backend services instrumented with OpenTelemetry; tracing backend deployed and configured (potentially in `apps/backend/infra/` or via Docker Compose `docker-compose.yml` for local dev).
  - **Verification:** Perform an end-to-end user action (e.g., ingest a journal entry, then query it) while tracing is active. Use the tracing dashboard (e.g., Jaeger UI) to view the full request flow across all services and identify bottlenecks and latency hotspots, demonstrating **Observability**.

- **Task 4.5.3: Refine Alerting System**
  - **Action:** Based on observed metrics and logs from Phases 1, 2, and 3, refine alerting thresholds and create new alerts for critical business metrics (e.g., LLM response latency, ingestion queue depth, user registration failures, image generation error rates, custom insight generation failures). These alerts will be configured in your monitoring system, triggered by metrics exposed by your backend services.
  - **Action:** Configure alerts to notify relevant teams/channels (e.g., Slack, PagerDuty, email). This often involves integration with your cloud provider's alerting services (e.g., AWS CloudWatch Alarms, GCP Monitoring Alerts) or a dedicated alerting platform configured via `apps/backend/infra/`.
  - **Action:** Implement runbooks for common alerts and store them in `apps/backend/docs/devops/runbooks/`. This provides clear steps for incident response.
  - **Deliverable:** Updated alerting configurations (via IaC in `apps/backend/infra/` or your monitoring platform); documented runbooks.
  - **Verification:** Simulate conditions that should trigger alerts (e.g., artificially increase latency in a dev environment, create specific error conditions for the new features); verify alerts fire correctly and prompt appropriate actions, proving the effectiveness of your **Observability** efforts.

---

### **Git Commit Checkpoint 4.5: Robustness & Observability Enhancements**

- **Action:** Stage and commit all changes related to error handling, retry mechanisms, OpenTelemetry integration, and refined alerting.
  ```bash
  git add apps/backend/src/ apps/backend/infra/ apps/backend/docs/devops/ docker-compose.yml # If Jaeger/Tempo added
  git commit -m "feat(observability): Enhance error handling, distributed tracing, and alerting"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match.

---

**Completion of Phase 4:** Your application now offers advanced AI-driven features like image generation and custom, data-driven insights with visualizations. Crucially, the system's security, data governance, and operational robustness have been significantly hardened, establishing a reliable, observable, and privacy-conscious platform within your monorepo, all built upon the consistent architectural principles.

---

Do you want to discuss the next steps, or perhaps review any specific aspect of this detailed Phase 4 plan?

# Phase 0: Foundation & Design - Fully Defined for Execution

**Objective:** Solidify architectural decisions, define interfaces, and set up development environment.

**Duration:** Weeks 1-3 (This is an estimated duration; actual time may vary based on team size and complexity. Re-evaluate at the end of the phase.)

---

## 0.1 Project Setup & Management

- **Task 0.1.1: Initialize Version Control Repository**

  - **Action:** Create a new private Git repository on GitHub.
  - **Action:** Initialize the repository with a `README.md` file containing the project's high-level vision and a `.gitignore` file for Python and common development artifacts.
  - **Action:** Configure branch protection rules: `main` branch requires at least 1 review and passing CI checks.
  - **Deliverable:** Git repository initialized on GitHub (`https://github.com/<your-org>/personalized-rag-app`).
  - **Verification:** `README.md` and `.gitignore` are present in the `main` branch.

- **Task 0.1.2: Set up Project Management Tool**

  - **Action:** Create a new project board in Jira (or a similar tool like Asana/Trello).
  - **Action:** Define the following workflow columns: `Backlog`, `To Do`, `In Progress`, `Code Review`, `Testing`, `Done`.
  - **Action:** Create epics for each major phase (e.g., "Phase 0: Foundation & Design," "Phase 1: Core RAG MVP").
  - **Action:** Create initial tasks (Jira issues) for each item listed in this Phase 0 roadmap and assign them to the `Backlog` or `To Do` column.
  - **Deliverable:** Configured Jira project board with initial epics and tasks.
  - **Verification:** All tasks from this document are represented as Jira issues.

- **Task 0.1.3: Establish Communication Channels**
  - **Action:** Create a dedicated project channel in Slack (e.g., `#rag-app-project`).
  - **Action:** Schedule a recurring 30-minute daily stand-up meeting (e.g., 9:30 AM AEST, Monday-Friday) and a 60-minute weekly sprint review/planning meeting (e.g., 1:00 PM AEST, Monday).
  - **Deliverable:** Active Slack channel and calendar invitations for recurring meetings.
  - **Verification:** Team members have joined the Slack channel and accepted meeting invites.

---

## 0.2 Detailed Requirements & User Stories

**Goal:** Translate high-level vision into concrete, actionable requirements.

- **Task 0.2.1: Refine User Flows & Create Detailed User Stories**

  - **Action:** For each core feature, conduct a dedicated brainstorming session (2-4 hours) to walk through the user journey step-by-step.
    - **Core Features:** `Input (Text, Voice, Bulk)`, `Querying (Chat)`, `Insight Generation (Basic & Custom)`, `Journaling`, `Image Reward`.
  - **Action:** For each step identified, write detailed User Stories in a markdown file (`docs/requirements/user_stories.md`) following the template:

    ```markdown
    ### Feature: [Feature Name]

    #### User Story: [Brief Title]

    **As a:** [Type of User]
    **I want to:** [Action/Goal]
    **So that I can:** [Benefit/Reason]

    **Acceptance Criteria:**

    - [CRITERIA 1: Measurable outcome]
    - [CRITERIA 2: System behavior]
    - [CRITERIA 3: Error handling/Edge case]

    **Notes/Assumptions:**

    - [Any additional context]
    ```

  - **Action:** For each user story, identify and document specific acceptance criteria that define when the story is "done."
  - **Action:** Document edge cases, error states, and alternative paths directly within the relevant user stories or in a separate "Edge Cases" section within the `user_stories.md` file.
  - **Deliverable:** `docs/requirements/user_stories.md` containing all refined user flows and detailed user stories.
  - **Verification:** Review meeting with stakeholders to ensure all critical user journeys are covered and acceptance criteria are clear.

- **Task 0.2.2: Map Out User Types & Personas**

  - **Action:** Based on the refined user flows, identify 2-4 primary user types (e.g., "The Reflective Journaler," "The Knowledge Seeker," "The Casual Note-Taker").
  - **Action:** For each user type, create a detailed persona document in `docs/requirements/personas.md` including:
    - **Name (Placeholder):** e.g., "Sarah, The Reflective Journaler"
    - **Demographics:** (Optional, high-level)
    - **Goals:** What do they want to achieve with the app?
    - **Pain Points:** What problems does the app solve for them?
    - **Key Activities:** How will they primarily interact with the app?
    - **Motivations:** Why would they use this app?
    - **Quote:** A representative quote.
  - **Deliverable:** `docs/requirements/personas.md` with defined user types and personas.
  - **Verification:** Internal team review to validate personas align with the product vision.

- **Task 0.2.3: Define Non-Functional Requirements (NFRs)**

  - **Action:** Create a dedicated NFRs document (`docs/requirements/nfrs.md`) using the following structure for each requirement:

    ```markdown
    ### NFR Category: [e.g., Performance, Security, Scalability]

    #### Requirement: [Specific NFR Title]

    **Description:** [Detailed explanation of the requirement]
    **Metric:** [How will it be measured? e.g., "Latency (ms)", "Uptime (%)", "Cost per user ($)"]
    **Target:** [Specific, quantifiable goal, e.g., "< 500ms", "99.9%", "< $5/month"]
    **Measurement Tool/Method:** [How will this metric be tracked? e.g., "Prometheus/Grafana", "Cloud Monitoring", "Billing Reports"]
    **Priority:** [High, Medium, Low]
    **Impact if not met:** [Consequences]
    ```

  - **Action:** Quantify all NFRs with specific metrics and targets.
    - **Performance:**
      - Chat Query Latency: Target `< 500ms` (P90) for responses.
      - Document Ingestion Rate: Target `100 documents/minute` (average) for bulk uploads.
      - Voice Transcription Latency: Target `< 200ms` for transcription of 10-second audio clips.
    - **Scalability:**
      - Concurrent Users: Support `1,000 concurrent users` in V1.
      - Data Volume: Support `10GB of vectorized data` per user.
    - **Security:**
      - Data Encryption: All data at rest (database, storage) MUST be encrypted using AES-256. All data in transit MUST use TLS 1.2+.
      - Authentication: Implement industry-standard password hashing (e.g., bcrypt) and enforce strong password policies.
      - Authorization: Strict row-level/document-level access control based on `user_id` for all data access.
    - **Availability:**
      - System Uptime: Target `99.9%` uptime for core services.
      - RPO (Recovery Point Objective): Target `1 hour` (max data loss).
      - RTO (Recovery Time Objective): Target `4 hours` (max downtime).
    - **Cost-Effectiveness:**
      - Average Cost per Active User: Target `< $2.00 per month`.
      - Optimize serverless function memory and duration.
    - **Data Privacy:**
      - Compliance: Adhere to Australian privacy principles (APP) and GDPR where applicable.
      - User Data Control: Provide clear mechanisms for user data export and deletion.
  - **Deliverable:** `docs/requirements/nfrs.md` with all non-functional requirements clearly defined and quantified.
  - **Verification:** Formal review and sign-off on NFRs by the lead architect/product owner.

---

## 0.3 Architectural Design & Interface Definition

**Goal:** Design the system components and define how they will interact.

- **Task 0.3.1: Define API Contracts (Interfaces) for Each Major Component/Service**

  - **Action:** Create a dedicated directory `src/interfaces/` in the codebase.
  - **Action:** For each major service abstraction identified, define its API contract using Python `typing.Protocol` or `abc.ABC` for abstract base classes, or `pydantic` models for data structures.

    - **Example (Python `src/interfaces/llm_inference_service.py`):**

      ```python
      from typing import List, Dict, Protocol

      class LLMInferenceService(Protocol):
          def generate_response(self, prompt: str, context: List[str], user_id: str, model_config: Dict) -> str:
              """Generates a response from the LLM based on prompt and context."""
              ...

          def analyze_text_for_insights(self, text: str, analysis_type: str) -> Dict:
              """Analyzes text to extract specific insights (e.g., sentiment, keywords)."""
              ...
      ```

    - **Action:** Define data transfer objects (DTOs) using `pydantic.BaseModel` for all inputs and outputs of these service methods.

  - **Deliverable:** Python interface files (`.py`) for all core services within `src/interfaces/`, defining method signatures and DTOs.
  - **Verification:** Code review of interface definitions to ensure clarity, completeness, and adherence to design principles.

- **Task 0.3.2: Define Data Model Schemas**

  - **Action:** Create a `src/data_models/` directory.
  - **Action:** For each data entity (`User`, `Document`, `TextChunk`, `JournalEntry`, `Insight`, `Image`), define its schema using `pydantic.BaseModel` for Python representation.
  - **Action:** For the relational database (PostgreSQL), write initial SQL DDL (Data Definition Language) scripts in `db/schema.sql` to create tables, define columns, data types, primary keys, foreign keys, and indexes.
  - **Action:** For the vector database (Qdrant/Weaviate), define the collection schema (including `user_id` as a filterable field) in a markdown file (`docs/architecture/vector_db_schema.md`).
  - **Deliverable:**
    - Python data model files (`.py`) in `src/data_models/`.
    - `db/schema.sql` with initial PostgreSQL DDL.
    - `docs/architecture/vector_db_schema.md` outlining vector database collection structure.
  - **Verification:** Review of schemas for consistency, normalization (for relational), and efficiency.

- **Task 0.3.3: Create High-Level and Detailed Architectural Diagrams**
  - **Action:** Choose a diagramming tool: PlantUML (preferred for code-based diagrams) or Draw.io (for visual drag-and-drop).
  - **Action:** **High-Level System Diagram:** Create a logical diagram showing the major components (Frontend, API Gateway, Authentication Service, Ingestion Service, Query Service, Image Generation Service, Message Queue, Vector DB, Relational DB, LLM Service) and their primary data flows.
    - **Focus:** Logical separation, main communication paths.
    - **Format:** PlantUML (`docs/architecture/high_level_diagram.puml`) or Draw.io (`.drawio` file).
  - **Action:** **Detailed Data Flow Diagrams (at least two):**
    - **Ingestion Flow:** Illustrate the path from user input (text, voice, bulk) through `DocumentIngestionService`, `MessageQueue`, `TextProcessingService`, to `VectorStoreClient` and Relational DB. Emphasize `user_id` propagation.
    - **Query Flow:** Illustrate the path from user query (text/voice) through `API Gateway`, `Query Service`, `VectorStoreClient` (with `user_id` filtering), `LLMInferenceService`, and back to the user.
    - **Format:** PlantUML (`docs/architecture/ingestion_flow.puml`, `docs/architecture/query_flow.puml`) or Draw.io.
  - **Action:** Export all diagrams to SVG format for easy embedding and version control (`docs/architecture/*.svg`).
  - **Deliverable:** `docs/architecture/` directory containing `.puml` (or `.drawio`) source files and `.svg` exports for all diagrams.
  - **Verification:** Peer review of diagrams for accuracy, clarity, and completeness.

---

## 0.4 Technology Stack & Initial Setup

**Goal:** Select foundational technologies and prepare the development environment.

- **Task 0.4.1: Finalize Initial Open-Source Selections & Justify**

  - **Action:** Create `docs/tech_stack_decisions.md` documenting the final choices for each category.
  - **Action:** For each choice, include:
    - **Category:** e.g., "Vector Database"
    - **Chosen Technology:** e.g., "Qdrant"
    - **Version (if applicable):** e.g., "1.9.0"
    - **Reasoning:** e.g., "Good balance of performance, open-source, multi-tenancy support via collections/filtering, active community."
    - **Alternatives Considered:** e.g., "Weaviate (more opinionated, higher resource usage), pgvector (simpler, but less optimized for pure vector search at scale)."
  - **Deliverable:** `docs/tech_stack_decisions.md` with justified technology choices.
  - **Verification:** Review by lead architect/technical lead.

- **Task 0.4.2: Set up Core Development Environment**

  - **Action:** Initialize a Poetry project in the root directory (`poetry init`).
  - **Action:** Add initial core dependencies (e.g., `fastapi`, `uvicorn`, `pydantic`, `langchain`, `qdrant-client`, `psycopg2-binary`).
  - **Action:** Create a `Dockerfile` for the main backend API service (`src/api/Dockerfile`).
  - **Action:** Create a `docker-compose.yml` in the project root to orchestrate local development services:
    - PostgreSQL database.
    - Qdrant vector database.
    - RabbitMQ message queue.
    - The main FastAPI backend service.
  - **Action:** Write clear, step-by-step local setup instructions in `docs/development/local_setup.md`, including `git clone`, `docker compose up`, and initial data seeding commands.
  - **Deliverable:**
    - `pyproject.toml` and `poetry.lock` with core dependencies.
    - `src/api/Dockerfile`.
    - `docker-compose.yml` for local environment.
    - `docs/development/local_setup.md`.
  - **Verification:** A new developer can follow `local_setup.md` and successfully bring up the local environment and run a basic "Hello World" endpoint.

- **Task 0.4.3: Initialize Infrastructure as Code (IaC) Framework**
  - **Action:** Create an `infra/` directory in the project root.
  - **Action:** Initialize a Terraform project within `infra/` (`terraform init`).
  - **Action:** Write a minimal Terraform configuration (`infra/main.tf`) to provision:
    - A new VPC (Virtual Private Cloud) in your chosen AWS region (e.g., `ap-southeast-2` for Australia).
    - Subnets (public and private).
    - An SQS queue (for initial message queue testing).
    - A basic Lambda function (Python runtime) that responds to an HTTP trigger (API Gateway).
  - **Action:** Document the process for applying and destroying the infrastructure in `docs/devops/iac_guide.md`.
  - **Deliverable:** `infra/` directory with initialized Terraform configuration.
  - **Verification:** Successfully run `terraform plan` and `terraform apply` to provision the basic infrastructure, then `terraform destroy` to clean up.

---

## 0.5 DevOps & CI/CD Strategy

**Goal:** Plan for automated testing, building, and deployment.

- **Task 0.5.1: Plan Automated Testing Strategy**

  - **Action:** Create a `tests/` directory in the project root with subdirectories: `tests/unit/`, `tests/integration/`, `tests/e2e/`.
  - **Action:** Document the testing strategy in `docs/devops/testing_strategy.md`, specifying:
    - **Unit Tests:**
      - **Framework:** `pytest`
      - **Scope:** Individual functions, methods, and classes, mocking external dependencies.
      - **Coverage Target:** `80%` code coverage for core logic.
    - **Integration Tests:**
      - **Framework:** `pytest`
      - **Scope:** Interactions between services (e.g., API endpoint to database, service to message queue). Use `docker-compose` for local integration test environment.
    - **End-to-End (E2E) Tests:**
      - **Framework:** `Playwright` (for web frontend)
      - **Scope:** Full user journeys from UI interaction to backend processing and UI update. Run against the `staging` environment.
  - **Action:** Define a clear process for writing testable code (e.g., dependency injection for services).
  - **Deliverable:**
    - `tests/` directory structure.
    - `docs/devops/testing_strategy.md`.
  - **Verification:** Review of the testing strategy by the development team.

- **Task 0.5.2: Define Environments and CI/CD Pipeline Stages**
  - **Action:** Create `docs/devops/ci_cd_strategy.md` outlining the CI/CD pipeline stages and environment definitions.
  - **Action:** Define the following environments with their purpose and access controls:
    - `development`: For individual developer testing, frequently updated.
    - `staging`: Mirror of production, for integration testing, UAT, and performance testing.
    - `production`: Live environment, highly restricted access.
  - **Action:** Outline the CI/CD pipeline stages using GitHub Actions (chosen platform):
    - **`on: push` (to any branch):**
      - `Linting & Formatting`: Run `flake8`, `black`, `isort`.
      - `Unit Tests`: Run `pytest tests/unit/` with code coverage reporting.
    - **`on: pull_request` (to `main` branch):**
      - `Linting & Formatting`
      - `Unit Tests`
      - `Build Docker Images`: Build Docker images for all services.
    - **`on: push` (to `main` branch):**
      - `Linting & Formatting`
      - `Unit Tests`
      - `Build & Push Docker Images`: Build and push tagged Docker images to a container registry (e.g., ECR).
      - `Deploy to Development`: Automatically deploy the latest images to the `development` environment using Terraform/IaC.
      - `Run Integration Tests`: Execute `pytest tests/integration/` against the `development` environment.
      - `Deploy to Staging (Manual Approval)`: Require manual approval to deploy to `staging`.
      - `Run E2E Tests`: Execute `Playwright` tests against the `staging` environment.
      - `Deploy to Production (Manual Approval)`: Require manual approval and potentially additional checks (e.g., blue/green deployment) to deploy to `production`.
  - **Action:** Create a placeholder GitHub Actions workflow file (`.github/workflows/ci.yml`) with the initial linting and unit test steps.
  - **Deliverable:**
    - `docs/devops/ci_cd_strategy.md`.
    - `.github/workflows/ci.yml` (initial draft).
  - **Verification:** Push a small code change to trigger the initial CI workflow and ensure it passes linting and unit tests.

---

**Completion of Phase 0:** All documents mentioned above are finalized and stored in the project repository. All initial setup tasks are complete, and the team is ready to begin coding on core features with a clear understanding of the architecture, interfaces, requirements, and development environment.

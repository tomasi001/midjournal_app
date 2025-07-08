# Project Progress

## Phase 0: Foundation & Design

### 0.1 Project Setup & Management

- **Task 0.1.1: Initialize Version Control Repository**
  - [ ] Create a new private Git repository on GitHub. (Skipped: I don't have access to GitHub to create repositories).
  - [x] Initialize the repository with a `README.md` file containing the project's high-level vision and a `.gitignore` file for Python and common development artifacts.
  - [ ] Configure branch protection rules: `main` branch requires at least 1 review and passing CI checks. (Skipped: I don't have access to GitHub repository settings).
- **Task 0.1.2: Set up Project Management Tool**
  - [ ] Create a new project board in Jira (or a similar tool like Asana/Trello). (Skipped: External tool setup).
  - [ ] Define workflow columns. (Skipped: External tool setup).
  - [ ] Create epics. (Skipped: External tool setup).
  - [ ] Create initial tasks. (Skipped: External tool setup).
- **Task 0.1.3: Establish Communication Channels**
  - [ ] Create a dedicated project channel in Slack. (Skipped: External tool setup).
  - [ ] Schedule recurring meetings. (Skipped: External tool setup).

### 0.2 Detailed Requirements & User Stories

- **Task 0.2.1: Refine User Flows & Create Detailed User Stories**
  - [x] Create `docs/requirements/user_stories.md` with detailed user stories.
- **Task 0.2.2: Map Out User Types & Personas**
  - [x] Create `docs/requirements/personas.md`.
- **Task 0.2.3: Define Non-Functional Requirements (NFRs)**
  - [x] Create `docs/requirements/nfrs.md`.

### 0.3 Architectural Design & Interface Definition

- **Task 0.3.1: Define API Contracts (Interfaces) for Each Major Component/Service**
  - [x] Create `src/interfaces/` directory.
  - [x] Define service interfaces (`llm_inference_service.py`, etc.) with `Protocol` and `pydantic` DTOs.
- **Task 0.3.2: Define Data Model Schemas**
  - [x] Create `src/data_models/` directory.
  - [x] Define `pydantic` data models.
  - [x] Create `db/schema.sql`.
  - [x] Create `docs/architecture/vector_db_schema.md`.
- **Task 0.3.3: Create High-Level and Detailed Architectural Diagrams**
  - [x] Create `docs/architecture/` directory.
  - [x] Create high-level system diagram.
  - [x] Create detailed data flow diagrams (Ingestion & Query).
  - [ ] Export diagrams to SVG. (Skipped: Cannot generate SVG from PlantUML)

### 0.4 Technology Stack & Initial Setup

- **Task 0.4.1: Finalize Initial Open-Source Selections & Justify**
  - [x] Create `docs/tech_stack_decisions.md`.
- **Task 0.4.2: Set up Core Development Environment**
  - [x] Initialize Poetry project.
  - [x] Add core dependencies.
  - [x] Create `src/api/Dockerfile`.
  - [x] Create `docker-compose.yml`.
  - [x] Create `docs/development/local_setup.md`.
- **Task 0.4.3: Initialize Infrastructure as Code (IaC) Framework (Switched to Pulumi)**
  - [x] Create `infra/` directory.
  - [x] Initialize Pulumi project.
  - [x] Create `infra/__main__.py` with minimal AWS resources.
  - [x] Create `docs/devops/iac_guide.md`.

### 0.5 DevOps & CI/CD Strategy

- **Task 0.5.1: Plan Automated Testing Strategy**
  - [x] Create `tests/` directory structure.
  - [x] Create `docs/devops/testing_strategy.md`.
- **Task 0.5.2: Define Environments and CI/CD Pipeline Stages**
  - [x] Create `docs/devops/ci_cd_strategy.md`.
  - [ ] Create `.github/workflows/ci.yml`.

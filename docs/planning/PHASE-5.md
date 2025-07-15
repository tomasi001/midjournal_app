# Phase 5: Advanced Journal Entry Analysis

**Objective:** Implement a sophisticated, LLM-driven analysis pipeline for individual journal entries, generating a structured output covering emotional landscapes, themes, cognitive patterns, relational dynamics, and contextual clues. This enhances the foundation for future longitudinal insights and strongly adheres to our architectural principles.

**Duration:** Weeks 27-34 (Estimate: 8 weeks. Target completion: \~February 17, 2026 AEST)

**Current Root:** `/Users/thomasshields/midjournal_app`
**Backend App:** `apps/backend`
**Frontend App:** `apps/frontend`
**Shared Packages:** (None for API client as per notes)

---

## 5.1 Redefine Journal Analysis Output Structure

**Goal:** Modify the `JournalEntry` data model and backend Pydantic schemas to accommodate the richer, structured analysis outputs.

- **Task 5.1.1: Update JournalEntry Database Model (Alembic Migration)**

  - **Action:** Create a new Alembic migration script in `apps/backend/alembic/versions/` to add new JSONB columns to the `JournalEntry` table in `apps/backend/src/db/models.py`. These columns will store the detailed analysis output. This ensures our **Data Siloing** by keeping analysis alongside the entry.
    - `emotional_landscape`: `Column(JSON, nullable=True)` (to store dominant emotions, valence, shifts)
    - `themes_topics`: `Column(JSON, nullable=True)` (to store keywords, identified themes)
    - `cognitive_patterns`: `Column(JSON, nullable=True)` (to store recurring thoughts, self-perception, beliefs, problems)
    - `relational_dynamics`: `Column(JSON, nullable=True)` (to store mentioned individuals, relationship tone)
    - `contextual_clues`: `Column(JSON, nullable=True)` (to store events, time-bound indicators)
  - **Deliverable:** A new Alembic migration file in `apps/backend/alembic/versions/` and updated `apps/backend/src/db/models.py`.
  - **Verification:**
    - Run `alembic revision --autogenerate -m "Add structured analysis fields to JournalEntry"`.
    - Inspect the generated migration script to confirm it adds the correct JSONB columns.
    - Run `alembic upgrade head` to apply the migration.
    - Manually connect to the PostgreSQL database and inspect the `journal_entries` table schema to confirm the new columns exist.

- **Task 5.1.2: Update Pydantic Schemas for Journal Entry Analysis**

  - **Action:** Define detailed Pydantic models in `apps/backend/src/data_models/schemas.py` that precisely reflect the structured output requirements for each analysis section. These will be the canonical representation for the API.

    - Define individual schemas for each analysis section:

      ```python
      class CoreEmotionalLandscapeSchema(BaseModel):
          dominant_emotions: List[Dict[str, Any]] = Field(description="e.g., [{'emotion': 'Joy', 'intensity': 0.8}]")
          emotional_valence: str = Field(description="e.g., 'Positive', 'Negative', 'Neutral'")
          emotional_shifts: List[str] = Field(description="e.g., ['Shift from neutral to anxious after discussing work']")

      class KeyThemesTopicsSchema(BaseModel):
          top_keywords: List[str] = Field(description="e.g., ['work', 'family', 'stress', 'goals']")
          identified_themes: List[str] = Field(description="e.g., ['Professional Development', 'Family Dynamics', 'Coping with Pressure']")

      class CognitivePatternsSchema(BaseModel):
          recurring_thoughts: List[str] = Field(description="e.g., ['I need to be perfect']")
          self_perception: str = Field(description="e.g., 'Overwhelmed but resilient'")
          beliefs_values: List[str] = Field(description="e.g., ['Hard work is essential', 'Honesty above all']")
          problems_challenges: List[str] = Field(description="e.g., ['Time management', 'Dealing with criticism']")

      class RelationalDynamicsSchema(BaseModel):
          mentioned_individuals: List[Dict[str, Any]] = Field(description="e.g., [{'name': 'Sarah', 'relationship': 'colleague', 'sentiment': 'positive'}]")
          relationship_tone: List[str] = Field(description="e.g., ['Strained with John', 'Supportive with Emily']")

      class PotentialTriggersContextualCluesSchema(BaseModel):
          events_situations: List[str] = Field(description="e.g., ['Meeting with manager', 'Weekend trip']")
          time_bound_indicators: List[str] = Field(description="e.g., ['Monday morning', 'Last night']")
      ```

    - Update the `JournalEntry` schema in `apps/backend/src/data_models/schemas.py` to include these new analysis fields as optional `Optional[CoreEmotionalLandscapeSchema]`, `Optional[KeyThemesTopicsSchema]`, etc.

  - **Deliverable:** Updated `apps/backend/src/data_models/schemas.py` with the new detailed Pydantic models.
  - **Verification:** Review `apps/backend/src/data_models/schemas.py` to ensure the new models are correctly defined and integrated into the `JournalEntry` schema.

---

### **Git Commit Checkpoint 5.1: Analysis Output Structure Defined**

- **Action:** Stage and commit all changes related to database model updates and Pydantic schema definitions.
  ```bash
  git add apps/backend/src/db/models.py apps/backend/src/data_models/schemas.py apps/backend/alembic/versions/
  git commit -m "feat(analysis): Redefine JournalEntry schema for detailed structured analysis via Alembic"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match.

---

## 5.2 Implement Advanced Journal Analysis Service

**Goal:** Leverage the LLM to perform deep, structured analysis of individual journal entries, adhering to **Modularity** and **Asynchronous Processing**.

- **Task 5.2.1: Enhance JournalAnalysisService for Deep Analysis**

  - **Action:** Modify `apps/backend/src/analysis/service.py` (`JournalAnalysisService`). This service will now orchestrate multiple LLM calls or a single complex multi-task prompt to generate the full structured output.
  - **Action:** Create a new module `apps/backend/src/analysis/prompts.py` to store distinct, carefully engineered LLM prompts. Each prompt should guide the `LLMInferenceService` to output structured JSON data for one of the five analysis sections (`Core Emotional Landscape`, `Key Themes & Topics`, `Cognitive Patterns & Insights`, `Relational Dynamics`, `Potential Triggers & Contextual Clues`). The prompts must clearly define the expected JSON structure.
  - **Action:** The `JournalAnalysisService` will use the `LLMInferenceService` (from `apps/backend/src/llm/service.py`) to process the journal entry content. It should parse and validate the LLM's JSON output using the new Pydantic models defined in `data_models/schemas.py`. Implement error handling for malformed LLM responses.
  - **Deliverable:** Updated `apps/backend/src/analysis/service.py` and new `apps/backend/src/analysis/prompts.py`.
  - **Verification:** Manually test the LLM prompts via a standalone script or an API endpoint that directly invokes the `JournalAnalysisService` with sample journal entries. Verify that the service returns a `JournalAnalysisOutputSchema` populated with plausible data.

- **Task 5.2.2: Update Asynchronous Consumer for New Analysis**

  - **Action:** Modify `apps/backend/src/analysis/consumer.py` (the "journal-analysis-queue" consumer). When a new journal entry or an update to an existing entry is received, this consumer will now:
    1.  Fetch the raw `JournalEntry.content` and `user_id`.
    2.  Call the enhanced `JournalAnalysisService.analyze_entry(content, user_id)` to get the full structured analysis.
    3.  Update the `JournalEntry` in the database (`apps/backend/src/db/models.py` via `apps/backend/src/db/database.py`) with the complete analysis data (`emotional_landscape`, `themes_topics`, etc.). This update must strictly adhere to **Data Siloing** by ensuring the `user_id` is part of the update query.
    4.  After the analysis is saved, trigger a new message to the "image-gen-queue" with the `JournalEntry.id` and `user_id` (and potentially a relevant prompt hint from the analysis) for asynchronous image generation.
  - **Deliverable:** Updated `apps/backend/src/analysis/consumer.py`.
  - **Verification:** Deploy the updated backend services. Submit a journal entry via the frontend. After a short delay (due to **Asynchronous Processing**), query the journal entry directly from the database or via the backend API. Confirm that the new `emotional_landscape`, `themes_topics`, `cognitive_patterns`, `relational_dynamics`, and `contextual_clues` fields are populated with valid, structured data.

---

### **Git Commit Checkpoint 5.2: Advanced Analysis Logic**

- **Action:** Stage and commit all changes related to the enhanced analysis service, new prompt module, and updated asynchronous consumer.
  ```bash
  git add apps/backend/src/analysis/ apps/backend/src/llm/service.py # If service.py needs modifications to handle multi-task prompts/structured output
  git commit -m "feat(analysis): Implement advanced LLM-driven structured journal entry analysis"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match.

---

## 5.3 Frontend Integration & Visualization (Individual Entry)

**Goal:** Display the newly generated structured insights clearly within the frontend for individual journal entries.

- **Task 5.3.1: Enhance Individual Journal Entry Display**
  - **Action:** In the `apps/frontend/` "Journal Dashboard" (`apps/frontend/src/app/journal/page.tsx`) or individual "Journal Entry" view (`apps/frontend/src/app/journal/[id]/result/page.tsx`), modify the UI to fetch and showcase the new structured analysis.
  - **Action:** Design a user-friendly and intuitive UI to present each of the five analysis sections. Leverage existing UI components (`Card`, `Badge`, `ScrollArea`, etc.) where appropriate, and create new ones as needed for visualization (e.g., simple charts, interactive lists).
    - **Core Emotional Landscape:** Use visual cues like color-coded tags for dominant emotions, intensity indicators (e.g., small progress bars or varying font sizes), and distinct sections for emotional valence and shifts.
    - **Key Themes & Topics:** Display as prominent tags or a small, dynamic word cloud.
    - **Cognitive Patterns & Insights:** Present as bullet points or accordion sections for recurring thoughts, dedicated text blocks for self-perception, and clear lists for beliefs/values and problems/challenges.
    - **Relational Dynamics:** List mentioned individuals with their associated sentiment (e.g., a small emoji or colored dot) and relationship tone.
    - **Potential Triggers & Contextual Clues:** Display as a chronological list of events/situations and clearly marked time indicators.
  - **Action:** Ensure the frontend correctly parses the JSON data received from the backend API for these analysis fields.
  - **Deliverable:** Updated frontend UI (`apps/frontend/`) for individual journal entries displaying the structured analysis outputs. This includes modifications to pages and potentially new UI components in `apps/frontend/src/components/`.
  - **Verification:** Start both frontend and backend (`turbo run dev`). Submit a new journal entry via the frontend. After analysis is complete (a short delay), navigate to the individual journal entry view. Verify that all five detailed analysis sections are visible, well-formatted, and reflect the content of the journal entry.

---

### **Git Commit Checkpoint 5.3: Frontend Analysis Display**

- **Action:** Stage and commit all frontend changes related to displaying the structured analysis for individual entries.
  ```bash
  git add apps/frontend/src/
  git commit -m "feat(frontend): Display detailed structured analysis for individual journal entries"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match.

---

**Completion of Phase 5:** The application now performs deep, structured analysis on individual journal entries, providing valuable insights into emotions, themes, cognitive patterns, relational dynamics, and triggers. This data is persistently stored and beautifully presented in the frontend, laying a strong foundation for future longitudinal profiling while maintaining rigorous adherence to our architectural principles.

# Phase 4 Progress: Advanced Features & Refinement

## 4.1 Image Generation for Journaling

- [x] **Task 4.1.1: Integrate Image Generation Service (Backend)**
  - [x] Create `image_gen` module and interface file.
  - [x] Implement concrete `ImageGenerationService`.
  - [x] Create `image-gen-queue` and async consumer.
- [x] **Task 4.1.2: Develop Prompt Generation Module from Journal Insights**
  - [x] Create `prompt_generator.py`.
  - [x] Modify analysis consumer to trigger prompt generation.
  - [x] Publish message to `image-gen-queue`.
- [x] **Task 4.1.3: Display Generated Images in Journaling Interface (Frontend)**

  - [x] Update `JournalEntry` model with image URL.
  - [x] Update backend API to return image URL.
  - [x] Regenerate shared API client.
  - [x] Display image in frontend journal view.

- [ ] **Git Commit Checkpoint 4.1**

## 4.2 Custom Insight Generation & Visualization

- [ ] **Task 4.2.1: Implement Custom Insight Generation Service (Backend)**
  - [ ] Create `custom_insights` module.
  - [ ] Develop `CustomInsightService`.
  - [ ] Create `POST /insights/custom` endpoint.
  - [ ] Regenerate shared API client.
- [ ] **Task 4.2.2: Implement Data Visualization (Frontend)**

  - [ ] Add charting library to frontend.
  - [ ] Create "Custom Insights" page.
  - [ ] Implement logic to parse data and render charts.

- [ ] **Git Commit Checkpoint 4.2**

## 4.3 Enhanced Frontend & User Preferences

- [ ] **Task 4.3.1: UI for Viewing and Interacting with Custom Insights (Frontend)**
  - [ ] Refine "Custom Insights" page with history, favorites, export.
- [ ] **Task 4.3.2: Implement User Settings for Preferences (Backend & Frontend)**

  - [ ] Create `UserSettings` database table.
  - [ ] Create backend API endpoints for settings.
  - [ ] Regenerate shared API client.
  - [ ] Create "Settings" page in frontend.
  - [ ] Integrate preferences into backend services.

- [ ] **Git Commit Checkpoint 4.3**

## 4.4 Security & Data Governance Hardening

- [ ] **Task 4.4.1: Implement Comprehensive Data Encryption**
  - [ ] Configure encryption at rest for all data stores.
  - [ ] Ensure encryption in transit for all communication.
- [ ] **Task 4.4.2: Refine Access Controls & Data Isolation Enforcement**
  - [ ] Implement Principle of Least Privilege in IAM roles.
  - [ ] Enforce `user_id` filtering in all database queries.
  - [ ] Add rate limiting and WAF rules to API Gateway.
- [ ] **Task 4.4.3: Develop Data Retention, Deletion, and Export Policies/Tools**
  - [ ] Define data privacy policy document.
  - [ ] Implement "Delete My Account" feature.
  - [ ] Implement "Export My Data" feature.
- [ ] **Task 4.4.4: Conduct Initial Security Audits/Penetration Testing**

  - [ ] Integrate automated security scans into Turborepo pipeline.
  - [ ] Summarize findings and create remediation plan.

- [ ] **Git Commit Checkpoint 4.4**

## 4.5 Robustness & Observability (Monorepo Adapted)

- [ ] **Task 4.5.1: Implement Comprehensive Error Handling & Retry Mechanisms (Backend)**
  - [ ] Standardize error handling across backend services.
  - [ ] Implement global exception handlers in FastAPI.
  - [ ] Implement retry logic for all external API calls.
- [ ] **Task 4.5.2: Set up Distributed Tracing (OpenTelemetry)**
  - [ ] Instrument all backend services with OpenTelemetry.
  - [ ] Configure trace export to a central backend.
  - [ ] Ensure context propagation across service boundaries.
- [ ] **Task 4.5.3: Refine Alerting System**

  - [ ] Refine alerting thresholds and create new critical alerts.
  - [ ] Configure alert notifications.
  - [ ] Create runbooks for common alerts.

- [ ] **Git Commit Checkpoint 4.5**

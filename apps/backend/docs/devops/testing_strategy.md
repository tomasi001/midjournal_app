# Automated Testing Strategy

This document defines the automated testing strategy for the MidJournal application, covering unit, integration, and end-to-end (E2E) tests.

## Guiding Principles

- **Test Pyramid:** We will follow the principles of the test pyramid, with a large base of fast unit tests, a smaller number of integration tests, and a very small number of broad E2E tests.
- **Testable Code:** Code should be written with testability in mind, primarily through the use of **Dependency Injection**. Services, database clients, and other external dependencies should be injected into business logic rather than being hard-coded, allowing them to be easily mocked or replaced in tests.

---

## Test Types & Scope

### 1. Unit Tests

- **Framework:** `pytest`
- **Location:** `apps/backend/tests/unit/`
- **Scope:**
  - Test individual functions, methods, and classes in isolation.
  - All external dependencies (e.g., database connections, LLM service calls, API clients) **must be mocked**.
  - Focus on business logic, edge cases, and validation within a single component.
- **Coverage Target:** We aim for `80%` code coverage for core application logic. This will be measured and reported during the CI pipeline.

### 2. Integration Tests

- **Framework:** `pytest`
- **Location:** `apps/backend/tests/integration/`
- **Scope:**
  - Test the interaction between two or more services.
  - These tests will run against a real environment provisioned by `docker-compose`, including the API, a real database, and other backend services.
  - Example Test Case: An API endpoint successfully writes data to the PostgreSQL database and creates a job in RabbitMQ.
  - External third-party services (e.g., a real OpenAI API endpoint) will still be mocked to avoid cost and non-determinism.

### 3. End-to-End (E2E) Tests

- **Framework:** `Playwright` (for the web frontend)
- **Location:** `apps/frontend/tests/e2e/` (or a dedicated `tests/e2e` package)
- **Scope:**
  - Test full user journeys from the perspective of a user interacting with the live application UI.
  - These tests will be run against the `staging` environment, which should be a complete mirror of production.
  - Example Test Case: A user logs in, creates a new journal entry through the UI, asks a question about it in the chat, and verifies the correct response is displayed.

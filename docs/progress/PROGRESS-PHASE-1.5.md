# Phase 1.5: Backend Monorepo Integration

**Objective:** Transform the existing `/Users/thomasshields/midjournal_app` directory into a monorepo, moving the current Python backend into an `apps/backend` subdirectory and integrating it with Turborepo for task orchestration.

**Status:** Completed.

---

## 1.5.1 Prepare Monorepo Root (Current Directory)

- [x] **Task 1.5.1.1: Initialize `package.json` with pnpm.**
- [x] **Task 1.5.1.2: Add Turborepo dependency.**
- [x] **Task 1.5.1.3: Create `turbo.json` with base configuration.**
- [x] **Task 1.5.1.4: Commit initial monorepo setup.**

---

## 1.5.2 Relocate Python Backend (Within Current Root)

- [x] **Task 1.5.2.1: Create `apps/backend` directory.**
- [x] **Task 1.5.2.2: Move all existing backend files into `apps/backend`.**
- [x] **Task 1.5.2.3: Commit backend relocation.**

---

## 1.5.3 Update Internal Backend Paths

- [x] **Task 1.5.3.1: Move and Update `docker-compose.yml` to Monorepo Root.**
- [x] **Task 1.5.3.2: Update `Dockerfile` paths for new build context.**
- [x] **Task 1.5.3.3: Commit Docker configuration updates.**

---

## 1.5.4 Configure Turborepo for Backend Orchestration

- [x] **Task 1.5.4.1: Add `[tool.poetry.scripts]` to `pyproject.toml`.**
- [x] **Task 1.5.4.2: Update `turbo.json` with backend-specific tasks.**
- [x] **Task 1.5.4.3: Commit Turborepo task configuration.**

---

## 1.5.5 Final Verification & Cleanup

- [x] **Task 1.5.5.1: Resolve `poetry.lock` inconsistencies.**
- [x] **Task 1.5.5.2: Resolve Docker build failures (`--no-root`).**
- [x] **Task 1.5.5.3: Resolve Docker networking race condition with healthchecks.**
- [x] **Task 1.5.5.4: Run full stack from monorepo root successfully.**
- [x] **Task 1.5.5.5: Clean up redundant files (`venv`).**
- [x] **Task 1.5.5.6: Commit final cleanup.**

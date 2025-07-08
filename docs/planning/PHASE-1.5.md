# Phase 1.5: Backend Monorepo Integration (In-Place Conversion)

**Objective:** Transform the existing `/Users/thomasshields/midjournal_app` directory into a monorepo, moving the current Python backend into an `apps/backend` subdirectory and integrating it with Turborepo for task orchestration.

**Current (and Target Monorepo) Root:** `/Users/thomasshields/midjournal_app`
**Python Backend Location (after move):** `/Users/thomasshields/midjournal_app/apps/backend`

---

## 1.5.1 Prepare Monorepo Root (Current Directory)

**Goal:** Initialize core Node.js/Turborepo files directly in your current project root.

- **Task 1.5.1.1: Navigate to Project Root**

  - **Action:** Ensure your terminal's current working directory is `/Users/thomasshields/midjournal_app`.
    ```bash
    cd /Users/thomasshields/midjournal_app
    ```
  - **Deliverable:** Your terminal is at the project root.
  - **Verification:** Run `pwd`. Output should be `/Users/thomasshields/midjournal_app`.

- **Task 1.5.1.2: Initialize npm/pnpm/Yarn and Workspaces**

  - **Action:** Initialize a `package.json` file. (Using `pnpm` is generally recommended for monorepos due to efficient package linking).
    ```bash
    pnpm init # Or npm init -y
    ```
  - **Deliverable:** A `package.json` file is created in your current directory.
  - **Verification:** Run `ls package.json`. The file should exist.
  - **Action:** Edit `package.json` to include the `workspaces` key and add initial `scripts`.
    ```json
    # /Users/thomasshields/midjournal_app/package.json
    {
      "name": "midjournal-monorepo",
      "version": "0.1.0",
      "private": true,
      "scripts": {
        "dev": "turbo run dev",
        "build": "turbo run build",
        "lint": "turbo run lint",
        "test": "turbo run test"
      },
      "devDependencies": {
        # This will be added in the next step
      },
      "workspaces": [
        "apps/*",
        "packages/*"
      ]
    }
    ```
  - **Deliverable:** `package.json` updated with `workspaces` and initial `scripts`.
  - **Verification:** Open `package.json` in a text editor and visually confirm the `workspaces` array and `scripts`.
  - **Action:** Install Turborepo as a development dependency.
    ```bash
    pnpm add -D turbo@latest # Or npm install -D turbo@latest
    ```
  - **Deliverable:** `turbo` package installed, `package.json` updated with `devDependencies`, and `pnpm-lock.yaml` (or `package-lock.json`) generated.
  - **Verification:** Run `grep "turbo" package.json` (should show `turbo` in `devDependencies`). Run `ls -d node_modules/turbo/` to confirm its installation.

- **Task 1.5.1.3: Create Turborepo Configuration**
  - **Action:** Create the `turbo.json` file in the project root.
    ```bash
    touch turbo.json
    ```
  - **Deliverable:** An empty `turbo.json` file is created.
  - **Verification:** Run `ls turbo.json`. The file should exist.
  - **Action:** Add the basic configuration to `turbo.json`.
    ```json
    # /Users/thomasshields/midjournal_app/turbo.json
    {
      "$schema": "[https://turbo.build/schema.json](https://turbo.build/schema.json)",
      "tasks": {
        "build": {
          "outputs": [".next/**", "dist/**", "build/**"]
        },
        "dev": {
          "cache": false,
          "persistent": true
        },
        "lint": {
          "outputs": []
        },
        "test": {
          "outputs": []
        },
        "clean": {
          "cache": false
        }
      }
    }
    ```
  - **Deliverable:** `turbo.json` contains the default task configurations.
  - **Verification:** Open `turbo.json` in a text editor and visually confirm the content.

---

### **Git Commit Checkpoint 1.5.1: Initial Monorepo Setup**

- **Action:** Stage and commit the changes for the monorepo root setup.
  ```bash
  git add package.json pnpm-lock.yaml turbo.json
  git commit -m "feat(monorepo): Initialize monorepo root with Turborepo and PNPM workspaces"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match.

---

## 1.5.2 Relocate Python Backend (Within Current Root)

**Goal:** Move the existing Python project content into the `apps/backend` subdirectory _within the current root_.

- **Task 1.5.2.1: Create `apps/backend` Directory**

  - **Action:** From your current project root (`/Users/thomasshields/midjournal_app`), create the `apps` directory and `backend` subdirectory.
    ```bash
    mkdir -p apps/backend
    ```
  - **Deliverable:** `apps/` and `apps/backend/` directories exist within your project root.
  - **Verification:** Run `ls -d apps/` and `ls -d apps/backend/`. Both should exist.

- **Task 1.5.2.2: Move Existing Backend Files into `apps/backend`**
  - **Action:** From your current project root (`/Users/thomasshields/midjournal_app`), move _all existing files and directories that belong to your backend_ into the `apps/backend/` subdirectory.
    - **Important:** Be careful _not_ to move the newly created monorepo files (`package.json`, `pnpm-lock.yaml`, `node_modules/`, `turbo.json`, `apps/`, `packages/`).
    ```bash
    # From /Users/thomasshields/midjournal_app (your current root)
    mv db apps/backend/
    mv docker-compose.yml apps/backend/
    mv docs apps/backend/
    mv infra apps/backend/
    mv poetry.lock apps/backend/
    mv pyproject.toml apps/backend/
    mv src apps/backend/
    mv tests apps/backend/
    # Move any other root-level backend files (e.g., .dockerignore, .gitignore, README.md if it's backend-specific)
    mv README.md apps/backend/ # If your README.md is backend-specific
    mv PROGRESS.md apps/backend/ # Assuming these are backend-specific progress files
    mv PROGRESS-PHASE-1.md apps/backend/
    # If you have a .dockerignore at the root, move it:
    # mv .dockerignore apps/backend/
    ```
  - **Deliverable:** All core backend files and directories are now located inside `/Users/thomasshields/midjournal_app/apps/backend/`. Your project root now primarily contains `package.json`, `turbo.json`, `apps/`, `node_modules/`.
  - **Verification:**
    - Run `ls -d apps/backend/src/` (should exist).
    - Run `ls -d apps/backend/pyproject.toml` (should exist).
    - Run `ls -d package.json` (should exist at root).
    - Run `ls -d turbo.json` (should exist at root).
    - Run `ls -d apps/backend/docker-compose.yml` (should exist).
    - Run `ls -d db/` (should _not_ exist at root).

---

### **Git Commit Checkpoint 1.5.2: Backend Relocated**

- **Action:** Stage and commit the file moves.
  ```bash
  git add apps/backend/ db docker-compose.yml docs infra poetry.lock pyproject.toml src tests README.md PROGRESS.md PROGRESS-PHASE-1.md # Adjust based on actual files moved
  git commit -m "refactor(backend): Relocate Python backend into apps/backend directory"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match. Run `git status` to ensure no unexpected untracked files.

---

## 1.5.3 Update Internal Backend Paths

**Goal:** Adjust file paths and configurations within the moved backend to reflect its new location.

- **Task 1.5.3.1: Move and Update `docker-compose.yml` to Monorepo Root**

  - **Action:** Move `docker-compose.yml` from `apps/backend` to the monorepo root.
    ```bash
    mv apps/backend/docker-compose.yml ./
    ```
  - **Deliverable:** `docker-compose.yml` file is now at `/Users/thomasshields/midjournal_app/`.
  - **Verification:** Run `ls docker-compose.yml` (should exist at root). Run `ls apps/backend/docker-compose.yml` (should _not_ exist).
  - **Action:** Edit the `docker-compose.yml` in the monorepo root. Update the `build` context and `volumes` paths to be relative to the _new monorepo root_.

    ```yaml
    # /Users/thomasshields/midjournal_app/docker-compose.yml
    version: "3.8"

    services:
      backend:
        build:
          context: ./apps/backend # <-- IMPORTANT: This is now relative to the monorepo root
          dockerfile: src/api/Dockerfile # This path is relative to the `context`
        ports:
          - "8000:8000"
        volumes:
          - ./apps/backend:/app # <-- IMPORTANT: Mount the backend code from its new location
          # Add other service specific volumes if they were absolute or relative to old root
        environment:
          # ... your existing environment variables
        depends_on:
          - db
          - qdrant
          - rabbitmq
      db:
        image: postgres:15-alpine
        environment:
          POSTGRES_DB: yourdb
          POSTGRES_USER: youruser
          POSTGRES_PASSWORD: yourpassword
        ports:
          - "5432:5432"
        volumes:
          - db_data:/var/lib/postgresql/data
          - ./apps/backend/db/schema.sql:/docker-entrypoint-initdb.d/schema.sql # <-- IMPORTANT: This path needs to be relative to the NEW root
      qdrant:
        image: qdrant/qdrant:latest
        ports:
          - "6333:6333"
          - "6334:6334"
        volumes:
          - qdrant_data:/qdrant/data
      rabbitmq:
        image: rabbitmq:3-management-alpine
        ports:
          - "5672:5672"
          - "15672:15672"
        volumes:
          - rabbitmq_data:/var/lib/rabbitmq

    volumes:
      db_data:
      qdrant_data:
      rabbitmq_data:
    ```

  - **Deliverable:** `docker-compose.yml` is correctly updated for the monorepo structure and located at the monorepo root.
  - **Verification:** Open `docker-compose.yml` and visually inspect the `build` context and `volumes` for the `backend` service and `db` volume mounts to ensure they correctly refer to `apps/backend` or the new monorepo root for shared assets like `db/schema.sql`.

- **Task 1.5.3.2: Review and Update `Dockerfile` Paths**

  - **Action:** Open `/Users/thomasshields/midjournal_app/apps/backend/src/api/Dockerfile`.
  - **Action:** Adjust `COPY` commands to correctly refer to files and directories relative to the `apps/backend` context (which is now the Docker build context).

    ```dockerfile
    # apps/backend/src/api/Dockerfile
    FROM python:3.11-slim-buster

    WORKDIR /app

    # Copy pyproject.toml and poetry.lock from apps/backend to /app
    # The build context is apps/backend, so ../../ refers to that
    COPY ../../pyproject.toml ./
    COPY ../../poetry.lock ./

    RUN pip install poetry
    # Install backend dependencies
    RUN poetry install --no-root --no-dev

    # Copy the backend source code
    COPY ../../src ./src
    COPY ../../db ./db
    COPY ../../tests ./tests
    COPY ../../infra ./infra
    COPY ../../docs ./docs
    COPY ../../.dockerignore ./ # If you had a .dockerignore at apps/backend root

    EXPOSE 8000

    CMD ["poetry", "run", "uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
    ```

  - **Deliverable:** `Dockerfile` is updated to correctly copy files from the new `apps/backend` context.
  - **Verification:** No immediate verification; will be tested when building Docker image.

- **Task 1.5.3.3: Verify Python Import Paths**
  - **Action:** Python's module resolution typically works relative to where the `poetry run` command is executed or where the `PYTHONPATH` is set. Since your `src/` directory remains directly inside `apps/backend`, imports like `from src.api.routers import auth` should still work correctly _when executed from within the `apps/backend` context_ (as Turborepo will ensure). Therefore, no explicit changes should be required for internal Python imports.
  - **Deliverable:** No changes were explicitly made to Python import paths.
  - **Verification:** No immediate verification.

---

### **Git Commit Checkpoint 1.5.3: Docker Compose & Dockerfile Paths Updated**

- **Action:** Stage and commit the changes to `docker-compose.yml` and `Dockerfile`.
  ```bash
  git add docker-compose.yml apps/backend/src/api/Dockerfile
  git commit -m "fix(backend): Update docker-compose and Dockerfile paths for monorepo"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match.

---

## 1.5.4 Configure Turborepo for Backend Orchestration

**Goal:** Define Turborepo tasks to build, test, lint, and run your Python backend.

- **Task 1.5.4.1: Add Backend Scripts to `apps/backend/pyproject.toml`**

  - **Action:** Open `/Users/thomasshields/midjournal_app/apps/backend/pyproject.toml`.
  - **Action:** Add (or ensure existing) `[tool.poetry.scripts]` section to define executable commands for your backend.

    ```toml
    # /Users/thomasshields/midjournal_app/apps/backend/pyproject.toml
    # ... (your existing pyproject.toml content) ...

    [tool.poetry.scripts]
    start = "uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload" # Added --reload for dev
    test = "pytest tests/"
    lint = "flake8 src/ tests/" # Assuming flake8, adjust as per your linter
    format = "black src/ tests/" # Assuming black, adjust as per your formatter
    build-docker = "poetry export -f requirements.txt --output requirements.txt --without-hashes && docker build -t midjournal-backend:latest ."
    ```

  - **Deliverable:** `pyproject.toml` with updated `[tool.poetry.scripts]` section.
  - **Verification:**
    - From the monorepo root: `cd apps/backend/`
    - Run: `poetry run start --help` (You should see Uvicorn's help message).
    - Run: `poetry run test --help` (You should see pytest's help message).
    - Run: `poetry run build-docker --help` (This command will attempt to run `docker build --help`, verifying the script exists. It will likely fail to _build_ without a docker daemon, but the script execution should start.)
    - Return to monorepo root: `cd ../..`

- **Task 1.5.4.2: Update `turbo.json` for Backend Tasks**
  - **Action:** Open `/Users/thomasshields/midjournal_app/turbo.json`.
  - **Action:** Add the following backend-specific tasks under the `tasks` section. Ensure `cwd` points to `apps/backend`.
    ```json
    # /Users/thomasshields/midjournal_app/turbo.json
    {
      "$schema": "[https://turbo.build/schema.json](https://turbo.build/schema.json)",
      "tasks": {
        "build": {
          "outputs": [".next/**", "dist/**", "build/**"],
          "dependsOn": ["^build"]
        },
        "dev": {
          "cache": false,
          "persistent": true
        },
        "lint": {
          "outputs": []
        },
        "test": {
          "outputs": []
        },
        "clean": {
          "cache": false
        },
        // --- Backend Specific Tasks ---
        "backend#dev": {
          "cwd": "apps/backend",
          "command": "poetry run start",
          "persistent": true,
          "cache": false
        },
        "backend#build": {
          "cwd": "apps/backend",
          "command": "poetry run build-docker",
          "outputs": ["."],
          "cache": false,
          "inputs": [
            "apps/backend/poetry.lock",
            "apps/backend/pyproject.toml",
            "apps/backend/src/**",
            "apps/backend/db/**",
            "apps/backend/tests/**",
            "apps/backend/Dockerfile",
            "apps/backend/.dockerignore"
          ]
        },
        "backend#test": {
          "cwd": "apps/backend",
          "command": "poetry run test",
          "outputs": ["apps/backend/coverage.xml", "apps/backend/htmlcov/"],
          "inputs": [
            "apps/backend/src/**",
            "apps/backend/tests/**",
            "apps/backend/pyproject.toml"
          ]
        },
        "backend#lint": {
          "cwd": "apps/backend",
          "command": "poetry run lint",
          "outputs": [],
          "inputs": [
            "apps/backend/src/**",
            "apps/backend/tests/**"
          ]
        },
        "backend#format": {
          "cwd": "apps/backend",
          "command": "poetry run format",
          "outputs": [],
          "cache": false
        }
      }
    }
    ```
  - **Deliverable:** `turbo.json` updated with comprehensive backend task definitions.
  - **Verification:**
    - Run from monorepo root (`/Users/thomasshields/midjournal_app`): `turbo run backend#lint`. Output should show `flake8` running (and potentially errors if any exist), then `turbo` reporting success or failure.
    - Run: `turbo run backend#test`. Output should show `pytest` running, then `turbo` reporting success or failure.
    - Run: `turbo run backend#build`. This will attempt to build the Docker image. Monitor its output. (It might take a while the first time).

---

### **Git Commit Checkpoint 1.5.4: Turborepo Backend Tasks Configured**

- **Action:** Stage and commit the changes to `pyproject.toml` and `turbo.json`.
  ```bash
  git add apps/backend/pyproject.toml turbo.json
  git commit -m "feat(monorepo): Configure Turborepo tasks for Python backend"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match.

---

## 1.5.5 Final Verification & Cleanup

**Goal:** Ensure everything works from the new monorepo root and remove any redundant files.

- **Task 1.5.5.1: Run Backend Development from Monorepo Root**

  - **Action:** From the monorepo root (`/Users/thomasshields/midjournal_app`), attempt to bring up the full stack using `docker compose`.
    ```bash
    docker compose up --build # This will rebuild images based on new paths
    ```
  - **Deliverable:** All Docker services (backend, db, qdrant, rabbitmq) start successfully without errors.
  - **Verification:**
    - Observe terminal output for no "Error" messages from Docker Compose.
    - Wait for `backend` service logs to show Uvicorn starting and listening (e.g., `Uvicorn running on http://0.0.0.0:8000`).
    - Open your web browser and navigate to `http://localhost:8000/docs`. You should see the FastAPI Swagger UI.
    - Stop containers: Press `Ctrl+C` in the terminal.
  - **Action:** Now, try running just the backend using Turborepo's `dev` task, assuming other services are already running via `docker compose up -d` or separately.
    ```bash
    turbo run backend#dev
    ```
  - **Deliverable:** FastAPI backend starts via `turbo run`.
  - **Verification:**
    - Observe terminal output showing Uvicorn starting.
    - Access `http://localhost:8000/docs` in your browser to confirm functionality.
    - Stop the `turbo run backend#dev` process: `Ctrl+C`.

- **Task 1.5.5.2: Clean Up Redundant Files**
  - **Action:** Delete the `venv/` directory from within `apps/backend/` if it exists. Poetry manages its virtual environments globally by default or within project if configured, so a local `venv/` from the old setup is usually not needed within the monorepo context.
    ```bash
    rm -rf apps/backend/venv
    ```
  - **Deliverable:** `venv/` directory removed from `apps/backend/`.
  - **Verification:** Run `ls -d apps/backend/venv/`. It should report "No such file or directory".
  - **Action:** If there are any `__pycache__` directories at the old root (which is now your monorepo root) from your Python backend before the move, remove them.
    ```bash
    rm -rf __pycache__/
    ```
  - **Deliverable:** Any root-level `__pycache__` is removed.
  - **Verification:** Run `ls -d __pycache__/`. It should report "No such file or directory".

---

### **Git Commit Checkpoint 1.5.5: Final Verification & Cleanup**

- **Action:** Stage and commit any remaining cleanup (e.g., removal of `venv`, `__pycache__`).
  ```bash
  git add . # Add any new .gitignore entries if needed
  git commit -m "chore(monorepo): Final verification and cleanup post-backend migration"
  ```
- **Verification:** Run `git log -1`. The latest commit message should match. Run `git status` to ensure your working directory is clean.

---

**Completion of Phase 1.5:** Your Python backend is now successfully integrated into the monorepo structure _within your current Cursor IDE session's root directory_ (`/Users/thomasshields/midjournal_app`), located at `apps/backend/`, and its tasks are orchestrated by Turborepo. You are now fully prepared to add your Next.js frontend into `apps/frontend/` in the next phase!

---

To save this content as a Markdown file, you can copy the entire text above and paste it into a file named `PHASE-1.5-MONOREPO.md` in your project root.

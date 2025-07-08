# Environments and CI/CD Strategy

This document outlines the deployment environments and the Continuous Integration/Continuous Deployment (CI/CD) pipeline for the MidJournal application, implemented using GitHub Actions.

---

## Environments

We will use a standard three-environment setup:

1.  **`development`**

    - **Purpose:** For individual developer testing and automated integration tests. It is continuously updated with the latest changes from the `main` branch.
    - **Access:** Open to the development team.
    - **Deployment:** Fully automated on every push to the `main` branch.

2.  **`staging`**

    - **Purpose:** To serve as a complete, stable mirror of the production environment. This is where User Acceptance Testing (UAT), E2E tests, and performance testing occur.
    - **Access:** Open to the development team and internal stakeholders for testing.
    - **Deployment:** Manual trigger/approval required. Deploys a specific, tagged release from the `main` branch.

3.  **`production`**
    - **Purpose:** The live environment used by end-users.
    - **Access:** Highly restricted. No direct developer access.
    - **Deployment:** Manual trigger/approval required, with stricter checks. Deploys a well-tested, tagged release from the `main` branch that has been verified in `staging`.

---

## CI/CD Pipeline Stages (GitHub Actions)

The pipeline is defined in `.github/workflows/ci.yml`.

### 1. On `push` to any branch

- **Trigger:** A push to any feature branch or pull request branch.
- **Jobs:**
  - **`Linting & Formatting`**: Run `turbo run lint` to lint all workspaces. This will execute `flake8` for the backend.
  - **`Unit Tests`**: Run `turbo run test` to run unit tests on all workspaces. This will execute `pytest tests/unit/` within the `apps/backend` context.

### 2. On `pull_request` to `main` branch

- **Trigger:** A new pull request is opened targeting the `main` branch.
- **Jobs:**
  - Runs all jobs from the previous stage (`Linting & Formatting`, `Unit Tests`).
  - **`Build Docker Images`**: Build the backend Docker image to ensure it can be successfully built. This does not push the image.
    ```bash
    docker-compose -f docker-compose.yml build backend
    ```
  - These checks are required to pass before a PR can be merged.

### 3. On `push` to `main` branch (Post-Merge)

- **Trigger:** A pull request is merged into the `main` branch.
- **Jobs:**
  - Runs all checks from the PR stage again on the merged code.
  - **`Build & Push Docker Images`**: Build and push tagged Docker images for the backend service to our container registry (e.g., AWS ECR). Images are tagged with the Git commit SHA.
  - **`Deploy to Development`**: Automatically triggers the IaC pipeline (Pulumi) to deploy the newly built images to the `development` environment.
  - **`Run Integration Tests`**: Executes integration tests against the newly deployed `development` environment. This can be a `turbo run backend#test:integration` script if defined.

### 4. Manual Deployment to Staging & Production

- **Trigger:** Manual trigger via the GitHub Actions UI (e.g., using `workflow_dispatch`).
- **Workflow:**
  - A user selects a specific commit/tag to deploy.
  - **`Deploy to Staging`**: Requires manual approval. Deploys the selected version to the `staging` environment.
  - **`Run E2E Tests`**: After successful staging deployment, automatically runs `Playwright` E2E tests against it.
  - **`Deploy to Production`**: Requires a separate, stricter manual approval. Deploys the verified version from `staging` to the `production` environment.

# MidJournal Monorepo

This repository contains the source code for the MidJournal application, organized as a Turborepo-powered monorepo.

## What's Inside?

This monorepo includes the following applications:

- `apps/backend`: The core FastAPI application that handles user authentication, data ingestion, RAG pipeline, and LLM interaction.
- `apps/frontend`: The Next.js web application for the user interface.

## Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20+)
- [pnpm](https://pnpm.io/installation) (version managed by `package.json`)
- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose
- [Poetry](https://python-poetry.org/docs/#installation)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd midjournal_app
    ```

2.  **Install Node.js dependencies:**
    From the root of the monorepo, run `pnpm install`. This will install all necessary Node.js packages for all workspaces.

    ```bash
    pnpm install
    ```

3.  **Install Python dependencies:**
    Use `pnpm` to run the backend's dedicated installation script. This uses Poetry to install the Python dependencies.
    ```bash
    pnpm --filter backend install
    ```

### Running the Application

To start all services, including the backend containers and the frontend development server, simply run the following command from the root of the project:

```bash
pnpm dev
```

- The backend API will be available at `http://localhost:8000`.
- The frontend application will be available at `http://localhost:3000`.

## Available Scripts

Turborepo orchestrates all scripts from the root of the monorepo.

- `pnpm dev`: Starts all applications in development mode. The backend runs via Docker Compose, and the frontend uses the Next.js dev server.
- `pnpm build`: Builds all applications for production.
- `pnpm lint`: Runs the linter for both the frontend (`ESLint`) and backend (`Ruff`).
- `pnpm lint:fix`: Automatically fixes fixable linting errors in the backend code.
- `pnpm test`: Runs the test suites for all applications.

### Targeting a Specific Workspace

You can run scripts for a single application by using the `--filter` flag. This is useful for isolating tasks.

- **Run only the frontend dev server:**

  ```bash
  pnpm --filter frontend dev
  ```

- **Run only the backend linter:**
  ```bash
  pnpm --filter backend lint
  ```

<!-- We are triggering a CI RUN -->

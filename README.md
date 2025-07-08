# MidJournal Monorepo

This repository contains the source code for the MidJournal application, organized as a Turborepo-powered monorepo.

## What's Inside?

This monorepo includes the following apps and packages:

- `apps/backend`: The core FastAPI application that handles user authentication, data ingestion, RAG pipeline, and LLM interaction.
- `apps/frontend`: (Coming soon) The Next.js web application for the user interface.
- `packages/ui`: (Coming soon) Shared React components used by the frontend.
- `packages/config`: (Coming soon) Shared configuration files (e.g., ESLint, TypeScript).

## Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18+)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose
- [Poetry](https://python-poetry.org/docs/#installation) (for Python dependency management within the backend)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd midjournal_app
    ```

2.  **Install Node.js dependencies:**
    From the root of the monorepo, run:

    ```bash
    pnpm install
    ```

3.  **Install Python dependencies:**
    Navigate to the backend app and use Poetry to install its dependencies.
    ```bash
    cd apps/backend
    poetry install
    cd ../..
    ```

### Running the Application

1.  **Start Backend Infrastructure:**
    From the root of the monorepo, start the required services (Postgres, Qdrant, RabbitMQ, Ollama) using Docker Compose.

    ```bash
    docker-compose up -d
    ```

2.  **Run Development Servers:**
    From the root of the monorepo, use Turborepo to run the development server for the backend.
    ```bash
    turbo run dev
    ```
    This will start the backend on `http://localhost:8000`.

## Available Scripts

Turborepo is used to orchestrate tasks across the monorepo. Here are some of the main commands, which should be run from the root directory:

- `pnpm dev`: Start all applications in development mode.
- `pnpm build`: Build all applications for production.
- `pnpm test`: Run tests for all applications.
- `pnpm lint`: Run linters for all applications.

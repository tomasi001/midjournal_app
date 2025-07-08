# Local Development Setup

This guide provides instructions for setting up the local development environment for the MidJournal application.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v18+)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose
- [Poetry](https://python-poetry.org/docs/#installation) (for Python dependency management within the backend)

## Installation

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

## Running the Application

To run the full application stack locally, you will use a combination of Docker Compose (for services) and Turborepo (for the application code).

1.  **Start all infrastructure services:**
    From the root of the project directory, run:

    ```bash
    docker-compose up -d
    ```

    This command starts the PostgreSQL database, Qdrant, RabbitMQ, and Ollama services.

2.  **Run the backend development server:**
    From the root of the project directory, run:

    ```bash
    turbo run backend#dev
    ```

3.  **Verify the services:**
    You can check the status of the running containers with:

    ```bash
    docker-compose ps
    ```

    You should see all infrastructure services (`db`, `qdrant`, `rabbitmq`, `ollama`) in the "running" state.

4.  **Accessing the API:**
    The FastAPI backend will be available at `http://localhost:8000`. You can access the OpenAPI documentation at `http://localhost:8000/docs`.

## Stopping the Application

To stop all running infrastructure services, use the following command from the project root:

```bash
docker-compose down
```

This will stop and remove the containers. To remove the data volumes as well, you can run `docker-compose down -v`.

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

## Optional: Using a Local Ollama Instance (macOS with Apple Silicon)

Due to performance limitations with Docker on macOS (no GPU passthrough), you might want to run the Ollama instance directly on your host machine for better performance.

1.  **Install and run Ollama on macOS:**
    Follow the official instructions to install and run Ollama on your Mac. Make sure it's running and accessible at `http://localhost:11434`.

2.  **Configure the backend to use the local Ollama:**
    Before starting the Docker services, set the `OLLAMA_HOST_OVERRIDE` environment variable in your terminal:

    ```bash
    export OLLAMA_HOST_OVERRIDE=http://host.docker.internal:11434
    ```

    `host.docker.internal` is a special DNS name that resolves to the internal IP address of the host from within a Docker container.

3.  **Start the services:**
    Now, run `docker-compose up -d` as usual. The `backend` and `analysis-worker` services will connect to your local Ollama instance.

    If you are using your local Ollama, you can prevent the Docker-based Ollama service from starting to save resources:

    ```bash
    docker-compose up -d --scale ollama=0
    ```

4.  **Switching back:**
    To revert to using the Ollama instance defined in Docker Compose, simply unset the environment variable:

    ```bash
    unset OLLAMA_HOST_OVERRIDE
    ```

    Then restart your services with `docker-compose up -d`.

## Stopping the Application

To stop all running infrastructure services, use the following command from the project root:

```bash
docker-compose down
```

This will stop and remove the containers. To remove the data volumes as well, you can run `docker-compose down -v`.

# Local Development Setup

This guide provides instructions for setting up the local development environment for the MidJournal application.

## Prerequisites

- Python 3.9+
- Poetry
- Docker and Docker Compose

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd midjournal_app
    ```

2.  **Install Python dependencies:**
    ```bash
    poetry install
    ```

## Running the Application

To run the full application stack locally, you will use Docker Compose. This will start the backend FastAPI server, the PostgreSQL database, Qdrant, and RabbitMQ.

1.  **Start all services:**
    From the root of the project directory, run:

    ```bash
    docker-compose up -d
    ```

2.  **Verify the services:**
    You can check the status of the running containers with:

    ```bash
    docker-compose ps
    ```

    You should see all services (`backend`, `postgres`, `qdrant`, `rabbitmq`) in the "running" state.

3.  **Accessing the API:**
    The FastAPI backend will be available at `http://localhost:8000`. You can access the OpenAPI documentation at `http://localhost:8000/docs`.

## Database

The application uses PostgreSQL for the relational database. The service is managed by Docker Compose.

- **Connection:** The backend service connects to the database automatically using the `DATABASE_URL` environment variable defined in `docker-compose.yml`.
- **Initialization:** When the backend service starts, it automatically creates the necessary database tables.

## Stopping the Application

To stop all running services, use the following command:

```bash
docker-compose down
```

This will stop and remove the containers. To remove the data volumes as well, you can run `docker-compose down -v`.

# Local Development Setup

This guide provides step-by-step instructions to set up and run the MidJournal application locally for development.

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Poetry](https://python-poetry.org/docs/#installation) for Python package management
- Git

## Setup Instructions

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/tomasi001/midjournal_app.git
    cd midjournal_app
    ```

2.  **Install Python Dependencies:**
    If you want to have the dependencies available on your host machine for IDE integration (e.g., for VS Code's IntelliSense), run:

    ```bash
    poetry install
    ```

    _Note: The application runs inside Docker, so this step is primarily for local development tooling and is not strictly required to run the app._

3.  **Build and Run the Services:**
    This command will build the backend Docker image and start all the services defined in `docker-compose.yml` (backend, PostgreSQL, Qdrant, RabbitMQ).

    ```bash
    docker compose up --build
    ```

    The `--build` flag ensures the Docker image is rebuilt if there are changes to the `Dockerfile` or the source code it depends on.

4.  **Verify the Application is Running:**
    Once the services are up, you can check if the API is running by navigating to [http://localhost:8000](http://localhost:8000) in your browser or using `curl`. You should see:

    ```json
    {
      "message": "Welcome to the MidJournal API!"
    }
    ```

    You can also check the health endpoint:

    ```bash
    curl http://localhost:8000/health
    ```

    This should return `{"status":"ok"}`.

5.  **Accessing Services:**

    - **API Docs (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
    - **PostgreSQL:** Connect with a client on `localhost:5432` (user: `user`, pass: `password`, db: `midjournaldb`)
    - **Qdrant UI:** [http://localhost:6333/dashboard](http://localhost:6333/dashboard)
    - **RabbitMQ Management UI:** [http://localhost:15672](http://localhost:15672) (user: `guest`, pass: `guest`)

6.  **Stopping the Services:**
    To stop the running containers, press `Ctrl+C` in the terminal where `docker compose up` is running, and then run:
    ```bash
    docker compose down
    ```
    To stop and remove the data volumes (use with caution, as this will delete your local databases):
    ```bash
    docker compose down --volumes
    ```

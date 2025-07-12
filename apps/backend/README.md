# MidJournal Backend

This directory (`apps/backend`) contains the source code for the MidJournal backend application.

It is a FastAPI application that provides the core services for the MidJournal platform, including:

- User Authentication & Management
- Asynchronous Document Ingestion Pipeline (via RabbitMQ)
- Text Processing (Chunking & Embeddings)
- Vector Storage & Retrieval (Qdrant)
- RAG-based Chat with an LLM (Ollama)

## Tech Stack

- **Framework:** FastAPI
- **Database:** PostgreSQL (with SQLAlchemy)
- **Vector Store:** Qdrant
- **Message Queue:** RabbitMQ
- **LLM Integration:** LangChain, Ollama

For details on how to run this service as part of the wider monorepo, please see the main `README.md` in the project root.

"dev": "docker-compose up --build --remove-orphans",
"dev": "cd ../.. && if [ -n \"$OLLAMA_HOST_OVERRIDE\" ]; then docker-compose up --build --remove-orphans --scale ollama=0; else docker-compose up --build --remove-orphans; fi",

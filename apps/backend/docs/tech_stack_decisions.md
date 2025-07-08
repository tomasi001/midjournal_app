# Technology Stack Decisions

This document records the key technology choices for the MidJournal application, with a focus on open-source and scalable solutions.

---

### Category: Vector Database

- **Chosen Technology:** Qdrant
- **Version:** 1.9.0+
- **Reasoning:**
  - Excellent balance of performance and features for a self-hosted solution.
  - Strong support for payload filtering and indexing, which is critical for our multi-tenant (per-user) data isolation strategy.
  - Active open-source community and good documentation.
  - Written in Rust, offering high performance and memory safety.
- **Alternatives Considered:**
  - **Weaviate:** More opinionated and can have higher resource usage.
  - **pgvector:** Simpler to manage as it's a PostgreSQL extension, but less optimized for pure-play vector search at a very large scale compared to a dedicated solution like Qdrant.

---

### Category: Web Framework

- **Chosen Technology:** FastAPI
- **Reasoning:**
  - High-performance Python framework based on modern standards (ASGI).
  - Automatic interactive API documentation (Swagger UI / ReDoc) is invaluable for development and testing.
  - Pydantic integration is at its core, which aligns perfectly with our data modeling strategy for type safety and validation.
- **Alternatives Considered:**
  - **Flask:** More minimalist, but requires more boilerplate for async operations and data validation.
  - **Django:** A full-featured, "batteries-included" framework. It's excellent but might be overkill for our service-based architecture and brings more overhead than necessary.

---

### Category: Relational Database

- **Chosen Technology:** PostgreSQL
- **Reasoning:**
  - Mature, reliable, and feature-rich open-source relational database.
  - Excellent for storing structured user data, document metadata, and journal entries.
  - Robust support for various data types, indexing, and transactions.
- **Alternatives Considered:**
  - **MySQL/MariaDB:** Also a solid choice, but PostgreSQL is often favored for its extensibility and stricter data typing.
  - **SQLite:** Too simplistic for a production environment that requires concurrent write access.

---

### Category: Message Queue

- **Chosen Technology:** RabbitMQ
- **Reasoning:**
  - A mature and widely adopted message broker that is protocol-based (AMQP).
  - Provides robust features for routing, retries, and dead-letter queues, which are essential for our asynchronous ingestion pipeline.
  - Well-supported in the Python ecosystem.
- **Alternatives Considered:**
  - **AWS SQS:** A strong cloud-native choice. We may use this in production, but RabbitMQ is excellent for local development and is cloud-agnostic.
  - **Redis Streams:** Lightweight and fast, but lacks some of the more advanced brokering features of RabbitMQ.

---

### Category: LLM & AI Frameworks

- **Chosen Technology:** LangChain / LangGraph
- **Reasoning:**
  - Provides a comprehensive toolkit for building applications with LLMs.
  - Simplifies common RAG patterns like document loading, chunking, and chaining prompts.
  - LangGraph offers a way to build more complex, stateful multi-step AI agents, which will be useful for the advanced insight-generation features.
- **Alternatives Considered:**
  - **Building from scratch:** Gives full control but requires reinventing the wheel for many common LLM interaction patterns.
  - **LlamaIndex:** Also an excellent framework, heavily focused on the data ingestion and query part of RAG. LangChain is chosen for its broader ecosystem of tools and agent-based abstractions.

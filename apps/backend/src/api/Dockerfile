# --- Builder Stage ---
FROM python:3.11-slim as builder

WORKDIR /app

# Install poetry
RUN pip install poetry

# Copy dependency files.
# The build context set in docker-compose.yml is 'apps/backend'.
# These files are at the root of that context.
COPY pyproject.toml poetry.lock ./

# Configure poetry and install dependencies into a local .venv
RUN poetry config virtualenvs.in-project true && \
    poetry install --without dev --no-interaction --no-ansi

# --- Final Stage ---
FROM python:3.11-slim as final

WORKDIR /app

# Copy the virtual environment from the builder stage
COPY --from=builder /app/.venv ./.venv

# Activate the virtual environment
ENV PATH="/app/.venv/bin:$PATH"

# Copy the application source code.
# The context is 'apps/backend'. `src` is at the root of that context.
COPY src ./src

EXPOSE 8000

# Run the application
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"] 
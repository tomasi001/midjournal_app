# --- Builder Stage ---
FROM python:3.11-slim AS builder

WORKDIR /app

# Install poetry
RUN pip install poetry

# Copy dependency files.
# The build context set in docker-compose.yml is 'apps/backend'.
# These files are at the root of that context.
COPY pyproject.toml poetry.lock ./

# Configure poetry and install dependencies into a local .venv
RUN poetry config virtualenvs.in-project true && \
    poetry install --no-root --without dev --no-interaction --no-ansi

# --- Final Stage ---
FROM python:3.11-slim AS final

# Install Tesseract OCR engine and image processing libraries
# These are needed at runtime, not just during the build.
RUN apt-get update && \
    apt-get install -y tesseract-ocr libjpeg-dev zlib1g-dev && \
    rm -rf /var/lib/apt/lists/*

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
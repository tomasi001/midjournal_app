# Stage 1: Build the virtual environment
FROM python:3.11-slim as builder

# Set working directory
WORKDIR /app

# Install poetry
RUN pip install poetry

# Copy only the files necessary for dependency installation
COPY pyproject.toml poetry.lock ./

# Install dependencies into a virtual environment
RUN poetry config virtualenvs.in-project true && \
    poetry install --no-root --without dev

# Stage 2: Create the final production image
FROM python:3.11-slim as final

# Set working directory
WORKDIR /app

# Copy the virtual environment from the builder stage
COPY --from=builder /app/.venv ./.venv

# Activate the virtual environment
ENV PATH="/app/.venv/bin:$PATH"

# Copy the application source code
COPY ./src /app/src

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
# We'll need to create a main.py file in src/api/
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"] 
# LLM Cost Analysis & Optimization (Phase 3)

**Date:** 2025-07-09

## 1. Summary of Optimizations

During Phase 3, we implemented two key optimizations for our self-hosted Ollama LLM service to improve performance and reduce computational cost:

1.  **Configurable LLM Models:** The `OllamaInferenceService` was refactored to use an environment variable (`OLLAMA_MODEL`) to specify the model name. This allows for seamless switching between different models without code changes, which is essential for testing and deploying quantized models.

    - **File:** `apps/backend/src/llm/service.py`
    - **Action:** To use a quantized model, set the `OLLAMA_MODEL` variable in the `docker-compose.yml` file for the `backend` service (e.g., `OLLAMA_MODEL=llama3:8b-instruct-q4_K_M`).

2.  **Request Batching for Journal Analysis:** The `JournalAnalysisService`, which previously made three separate LLM calls per journal entry (for sentiment, keywords, and summary), has been refactored. It now makes a single, combined call using a structured Pydantic schema (`JournalAnalysis`) to retrieve all three pieces of information at once.
    - **File:** `apps/backend/src/analysis/service.py`
    - **Impact:** This reduces the number of network requests and LLM inferences by 66% for the journal analysis process, leading to significant performance gains and reduced load on the LLM service.

## 2. Recommendations & Next Steps

- **Test Quantized Models:** We should now proceed with testing various quantized versions of our chosen LLM. The goal is to find the best balance between performance (latency, resource usage) and response quality. Start with 4-bit quantized models (e.g., `q4_K_M`) as they offer a good starting point for significant cost savings.
- **Monitor Resource Usage:** While testing, closely monitor the CPU, memory, and VRAM (if applicable) usage of the `ollama` container to quantify the impact of different quantization levels.
- **Qualitative Analysis:** Perform qualitative analysis of the model's output for key tasks (journal analysis, query suggestions) to ensure that the smaller, quantized models still meet our quality standards.

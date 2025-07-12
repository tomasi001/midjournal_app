from typing import List, Tuple
from sqlalchemy.orm import Session
from uuid import UUID
from tenacity import retry, stop_after_attempt, wait_exponential

from src.interfaces.llm_inference_service import LLMInferenceService
from src.db.models import JournalEntry
from src.data_models.schemas import JournalAnalysis


COMBINED_ANALYSIS_PROMPT = """
Analyze the following journal entry and provide:
1.  A sentiment analysis (e.g., 'Positive', 'Neutral', 'Negative').
2.  A list of up to 5 main keywords or themes.
3.  A concise, one to two-sentence summary.

Return the response as a JSON object that conforms to the following schema:
{{
    "sentiment": "string",
    "keywords": ["string", "string", ...],
    "summary": "string"
}}

Journal Entry:
---
{content}
---
"""


class JournalAnalysisService:
    def __init__(self, llm_service: LLMInferenceService):
        self.llm_service = llm_service

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=60),
    )
    async def analyze_entry(self, entry_content: str) -> Tuple[str, List[str], str]:
        prompt = COMBINED_ANALYSIS_PROMPT.format(content=entry_content)

        response_json = await self.llm_service.generate_structured_response(
            prompt=prompt,
            model_config={"temperature": 0},
            json_schema=JournalAnalysis.model_json_schema(),
        )

        analysis = JournalAnalysis.model_validate_json(response_json)

        return analysis.sentiment, analysis.keywords, analysis.summary

    def update_journal_entry_with_analysis(
        self,
        db: Session,
        entry_id: UUID,
        sentiment: str,
        keywords: List[str],
        summary: str,
    ):
        db.query(JournalEntry).filter(JournalEntry.id == entry_id).update(
            {
                "sentiment": sentiment,
                "keywords": keywords,
                "summary": summary,
            }
        )
        db.commit()

import re
import json
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from uuid import UUID

from src.interfaces.llm_inference_service import LLMInferenceService
from src.db.models import JournalEntry

SENTIMENT_ANALYSIS_PROMPT = """
Analyze the sentiment of the following journal entry. Respond with a single word: 'Positive', 'Neutral', or 'Negative'.
Do not provide any explanation or other text.

Journal Entry:
---
{content}
---
"""

KEYWORD_EXTRACTION_PROMPT = """
Extract the main keywords or themes from the following journal entry.
Return a JSON array of up to 5 strings. Do not provide any explanation or other text.
Example: ["productivity", "learning", "project management"]

Journal Entry:
---
{content}
---
"""

SUMMARY_PROMPT = """
Provide a concise, one to two-sentence summary of the following journal entry.

Journal Entry:
---
{content}
---
"""


class JournalAnalysisService:
    def __init__(self, llm_service: LLMInferenceService):
        self.llm_service = llm_service

    async def analyze_entry(self, entry_content: str) -> Tuple[str, List[str], str]:
        sentiment = await self._get_sentiment(entry_content)
        keywords = await self._get_keywords(entry_content)
        summary = await self._get_summary(entry_content)
        return sentiment, keywords, summary

    async def _get_sentiment(self, content: str) -> str:
        prompt = SENTIMENT_ANALYSIS_PROMPT.format(content=content)
        response = await self.llm_service.generate_response(prompt, {})
        # Simple cleaning, assuming LLM follows instructions
        return response.strip().replace("'", "").replace('"', "")

    async def _get_keywords(self, content: str) -> List[str]:
        prompt = KEYWORD_EXTRACTION_PROMPT.format(content=content)
        response = await self.llm_service.generate_response(prompt, {})
        try:
            # Clean the response to find the JSON array
            match = re.search(r"\[.*?\]", response)
            if match:
                keywords = json.loads(match.group(0))
                return keywords
            return []
        except json.JSONDecodeError:
            return []

    async def _get_summary(self, content: str) -> str:
        prompt = SUMMARY_PROMPT.format(content=content)
        response = await self.llm_service.generate_response(prompt, {})
        return response.strip()

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

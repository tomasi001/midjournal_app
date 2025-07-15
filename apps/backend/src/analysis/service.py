from typing import List, Tuple
from sqlalchemy.orm import Session
from uuid import UUID
from tenacity import retry, stop_after_attempt, wait_exponential

from src.interfaces.llm_inference_service import LLMInferenceService
from src.db.models import JournalEntry
from src.data_models.schemas import (
    CoreEmotionalLandscapeSchema,
    JournalAnalysis,
    KeyThemesTopicsSchema,
    CognitivePatternsSchema,
    RelationalDynamicsSchema,
    PotentialTriggersContextualCluesSchema,
)


ADVANCED_ANALYSIS_PROMPT = """
Analyze the following journal entry and provide a detailed analysis for each of the following points.

1.  **Title**: A short, descriptive title (2-4 words).
2.  **Sentiment**: The overall sentiment (e.g., 'Positive', 'Neutral', 'Negative').
3.  **Keywords**: A list of up to 5 main keywords.
4.  **Summary**: A concise, one to two-sentence summary.
5.  **Emotional Landscape**: Identify dominant emotions with their intensity, the overall emotional valence (positive, negative, neutral), and any noticeable shifts in emotion.
6.  **Key Themes & Topics**: Extract the top keywords and identify the core underlying themes.
7.  **Cognitive Patterns**: Detail any recurring thoughts, the author's self-perception, stated beliefs or values, and any mentioned problems or challenges.
8.  **Relational Dynamics**: List any individuals mentioned, their relationship to the author, and the sentiment associated with them. Describe the overall tone of the relationships discussed.
9.  **Contextual Clues**: Pinpoint any specific events, situations, or time-bound indicators that provide context to the entry.

Return the response as a single, valid JSON object that strictly adheres to the schema below. Do not include any explanatory text or markdown formatting outside of the JSON object itself.

**JSON Schema:**
{{
    "title": "A short, descriptive title for the journal entry (2-4 words).",
    "sentiment": "The overall sentiment of the entry (e.g., 'Positive', 'Neutral', 'Negative').",
    "keywords": ["A list of up to 5 main keywords or themes."],
    "summary": "A concise, one to two-sentence summary of the entry.",
    "emotional_landscape": {{
        "dominant_emotions": [{{
            "emotion": "string",
            "intensity": "float (0.0 to 1.0)"
        }}],
        "emotional_valence": "e.g., 'Positive', 'Negative', 'Neutral'",
        "emotional_shifts": ["Description of any emotional shifts."]
    }},
    "themes_topics": {{
        "top_keywords": ["List of top keywords."],
        "identified_themes": ["List of identified themes."]
    }},
    "cognitive_patterns": {{
        "recurring_thoughts": ["List of recurring thoughts."],
        "self_perception": "Description of self-perception.",
        "beliefs_values": ["List of stated beliefs or values."],
        "problems_challenges": ["List of mentioned problems or challenges."]
    }},
    "relational_dynamics": {{
        "mentioned_individuals": [{{
            "name": "Name of the individual.",
            "relationship": "Relationship to the author.",
            "sentiment": "Associated sentiment."
        }}],
        "relationship_tone": ["Description of the relationship tone."]
    }},
    "contextual_clues": {{
        "events_situations": ["List of specific events or situations."],
        "time_bound_indicators": ["List of time-bound indicators."]
    }}
}}

**Journal Entry:**
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
    async def analyze_entry(self, entry_content: str) -> Tuple[
        str,
        str,
        List[str],
        str,
        CoreEmotionalLandscapeSchema,
        KeyThemesTopicsSchema,
        CognitivePatternsSchema,
        RelationalDynamicsSchema,
        PotentialTriggersContextualCluesSchema,
    ]:
        prompt = ADVANCED_ANALYSIS_PROMPT.format(content=entry_content)

        response_json = await self.llm_service.generate_structured_response(
            prompt=prompt,
            model_config={"temperature": 0},
            json_schema=JournalAnalysis.model_json_schema(),
        )

        analysis = JournalAnalysis.model_validate_json(response_json)

        return (
            analysis.title,
            analysis.sentiment,
            analysis.keywords,
            analysis.summary,
            analysis.emotional_landscape,
            analysis.themes_topics,
            analysis.cognitive_patterns,
            analysis.relational_dynamics,
            analysis.contextual_clues,
        )

    def update_journal_entry_with_analysis(
        self,
        db: Session,
        entry_id: UUID,
        title: str,
        sentiment: str,
        keywords: List[str],
        summary: str,
        emotional_landscape: CoreEmotionalLandscapeSchema,
        themes_topics: KeyThemesTopicsSchema,
        cognitive_patterns: CognitivePatternsSchema,
        relational_dynamics: RelationalDynamicsSchema,
        contextual_clues: PotentialTriggersContextualCluesSchema,
    ):
        db.query(JournalEntry).filter(JournalEntry.id == entry_id).update(
            {
                "title": title,
                "sentiment": sentiment,
                "keywords": keywords,
                "summary": summary,
                "emotional_landscape": emotional_landscape.model_dump(),
                "themes_topics": themes_topics.model_dump(),
                "cognitive_patterns": cognitive_patterns.model_dump(),
                "relational_dynamics": relational_dynamics.model_dump(),
                "contextual_clues": contextual_clues.model_dump(),
            }
        )
        db.commit()

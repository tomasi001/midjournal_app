import sys
import os
import json
import logging
import asyncio
from sqlalchemy.orm import Session
from uuid import UUID
import structlog

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.message_queue.client import RabbitMQClient
from src.db.database import SessionLocal
from src.analysis.service import JournalAnalysisService
from src.llm.service import OllamaInferenceService
from src.image_gen.prompt_generator import PromptGenerator

log = structlog.get_logger()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


def get_dependencies():
    """Initializes and returns dependencies for the consumer."""
    llm_service = OllamaInferenceService()
    analysis_service = JournalAnalysisService(llm_service)
    prompt_generator = PromptGenerator(llm_service)
    db_session = SessionLocal()
    # A separate client for publishing
    mq_client = RabbitMQClient()
    return {
        "analysis_service": analysis_service,
        "prompt_generator": prompt_generator,
        "db_session": db_session,
        "mq_client": mq_client,
    }


def callback(ch, method, properties, body, deps):
    """Callback function to process messages from the journal-analysis-queue."""
    message = {}
    entry_id = "N/A"
    try:
        message = json.loads(body)
        entry_id_str = message.get("journal_entry_id")
        if not entry_id_str:
            raise ValueError("journal_entry_id missing from message")
        entry_id = UUID(entry_id_str)
        user_id = message.get("user_id")
        content = message.get("content")

        log.info("Received analysis request", entry_id=str(entry_id))

        analysis_service: JournalAnalysisService = deps["analysis_service"]
        prompt_generator: PromptGenerator = deps["prompt_generator"]
        db: Session = deps["db_session"]
        mq_client: RabbitMQClient = deps["mq_client"]

        # Run the async analysis function
        (
            title,
            sentiment,
            keywords,
            summary,
            emotional_landscape,
            themes_topics,
            cognitive_patterns,
            relational_dynamics,
            contextual_clues,
        ) = asyncio.run(analysis_service.analyze_entry(content))
        log.info("Analysis completed", entry_id=str(entry_id))

        # Update the database
        analysis_service.update_journal_entry_with_analysis(
            db,
            entry_id,
            title,
            sentiment,
            keywords,
            summary,
            emotional_landscape,
            themes_topics,
            cognitive_patterns,
            relational_dynamics,
            contextual_clues,
        )
        log.info("Database updated with analysis", entry_id=str(entry_id))

        # Generate the image prompt
        image_prompt = asyncio.run(
            prompt_generator.generate_prompt(sentiment, keywords, content)
        )

        # Publish to the image generation queue
        mq_client.publish(
            "image-gen-queue",
            {
                "prompt": image_prompt,
                "user_id": user_id,
                "journal_entry_id": entry_id_str,
            },
        )
        log.info("Published request to image-gen-queue", entry_id=str(entry_id))

    except json.JSONDecodeError as e:
        log.error("Failed to decode JSON body", body=body, error=e)
        raise
    except (ValueError, KeyError) as e:
        log.error("Message missing required fields", body=body, error=e)
        raise
    except Exception as e:
        log.error("Failed to process message", entry_id=entry_id, error=e)
        raise


def main():
    """
    Main function to start the journal analysis consumer.
    """
    log.info("Starting journal analysis consumer...")
    mq_client = RabbitMQClient()

    try:
        queue_name = "journal-analysis-queue"
        # Pass the dependency-injection function to the subscribe method
        mq_client.subscribe(queue_name, callback, get_dependencies)
    except KeyboardInterrupt:
        log.info("Consumer stopped by user.")
    finally:
        log.info("Consumer shut down gracefully.")


if __name__ == "__main__":
    main()

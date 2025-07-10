import sys
import os
import json
import logging
import time
import asyncio
from sqlalchemy.orm import Session
from uuid import UUID

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.message_queue.client import RabbitMQClient
from src.db.database import SessionLocal
from src.analysis.service import JournalAnalysisService
from src.llm.service import OllamaInferenceService

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
    db_session = SessionLocal()
    return {
        "analysis_service": analysis_service,
        "db_session": db_session,
    }


def callback(connection, ch, method, properties, body, deps):
    """Callback function to process messages from the journal-analysis-queue."""
    message = {}
    entry_id = "N/A"
    try:
        message = json.loads(body)
        entry_id_str = message.get("journal_entry_id")
        if not entry_id_str:
            raise ValueError("journal_entry_id missing from message")
        entry_id = UUID(entry_id_str)
        content = message.get("content")

        logging.info(f"Received analysis request for entry_id: {entry_id}")
        start_time = time.time()

        analysis_service: JournalAnalysisService = deps["analysis_service"]
        db: Session = deps["db_session"]

        # Run the async analysis function
        sentiment, keywords, summary = asyncio.run(
            analysis_service.analyze_entry(content)
        )

        analysis_time = time.time() - start_time
        logging.info(
            f"Analysis completed for entry_id: {entry_id} in {analysis_time:.2f}s."
        )

        # Update the database
        analysis_service.update_journal_entry_with_analysis(
            db, entry_id, sentiment, keywords, summary
        )
        update_time = time.time() - start_time - analysis_time
        logging.info(
            f"Database updated for entry_id: {entry_id} in {update_time:.2f}s."
        )

        connection.add_callback_threadsafe(
            lambda: ch.basic_ack(delivery_tag=method.delivery_tag)
        )

        total_time = time.time() - start_time
        logging.info(
            f"Successfully processed and ACKed entry_id: {entry_id}. Total time: {total_time:.2f}s."
        )

    except json.JSONDecodeError as e:
        logging.error(f"Failed to decode JSON body: {body}. Error: {e}", exc_info=True)
        connection.add_callback_threadsafe(
            lambda: ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        )
    except (ValueError, KeyError) as e:
        logging.error(
            f"Message missing required fields: {body}. Error: {e}", exc_info=True
        )
        connection.add_callback_threadsafe(
            lambda: ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        )
    except Exception as e:
        logging.error(
            f"Failed to process message for entry_id: {entry_id}. Error: {e}",
            exc_info=True,
        )
        connection.add_callback_threadsafe(
            lambda: ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        )


def main():
    """
    Main function to start the journal analysis consumer.
    """
    print("2025-07-09 10:42:15 - INFO - Starting journal analysis consumer...")
    mq_client = RabbitMQClient()

    try:
        queue_name = "journal-analysis-queue"
        # Pass the dependency-injection function to the subscribe method
        mq_client.subscribe(queue_name, callback, get_dependencies)
    except KeyboardInterrupt:
        print("Consumer stopped by user.")
    finally:
        # The close method on the client is less critical now, but good practice.
        mq_client.close()
        print("Consumer shut down gracefully.")


if __name__ == "__main__":
    main()

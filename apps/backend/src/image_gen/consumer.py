import sys
import os
import json
from uuid import UUID
from sqlalchemy.orm import Session
import structlog


# Add the project root to the Python path to allow for absolute imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.db.database import get_db
from src.image_gen.stable_diffusion_service import StableDiffusionImageGenerationService
from src.message_queue.client import RabbitMQClient
from src.db.models import JournalEntry
from src.storage.minio_client import MinIOFileStorageService
from src.interfaces.file_storage_service import FileStorageService
from src.interfaces.image_generation_service import ImageGenerationService

log = structlog.get_logger()


def get_dependencies():
    """Provides dependencies for the image generation consumer."""
    log.info("Creating new dependencies for image-gen consumer thread.")
    db_session = next(get_db())
    image_gen_service = StableDiffusionImageGenerationService()
    storage_service = MinIOFileStorageService()

    return {
        "db_session": db_session,
        "image_gen_service": image_gen_service,
        "storage_service": storage_service,
    }


def image_generation_callback(ch, method, properties, body, deps):
    """
    Callback function to process messages from the image generation queue.
    """
    db_session: Session = deps["db_session"]
    image_gen_service: ImageGenerationService = deps["image_gen_service"]
    storage_service: FileStorageService = deps["storage_service"]

    try:
        message = json.loads(body)
        prompt = message.get("prompt")
        user_id = message.get("user_id")
        journal_entry_id_str = message.get("journal_entry_id")

        if not all([prompt, user_id, journal_entry_id_str]):
            print("Message missing required fields (prompt, user_id, journal_entry_id)")
            return

        journal_entry_id = UUID(journal_entry_id_str)
        log.info(
            "Processing image generation request",
            journal_entry_id=journal_entry_id,
            user_id=user_id,
        )

        # 1. Generate the image bytes
        image_bytes = image_gen_service.generate_image(prompt, user_id, {})

        # 2. Upload the image to MinIO and get the URL
        file_name = f"{user_id}/{journal_entry_id}.png"
        image_url = storage_service.upload_file(
            file_bytes=image_bytes, file_name=file_name, content_type="image/png"
        )

        if not image_url:
            log.error("Failed to upload image to storage. Aborting update.")
            return

        # 3. Update the journal entry with the new image URL
        (
            db_session.query(JournalEntry)
            .filter(JournalEntry.id == journal_entry_id)
            .update({"image_url": image_url})
        )
        db_session.commit()

        log.info(
            "Updated journal entry with image URL",
            journal_entry_id=journal_entry_id,
            image_url=image_url,
        )

    except json.JSONDecodeError:
        log.error("Failed to decode message body", body=body)
    except Exception as e:
        log.error("An unexpected error occurred in image-gen callback", error=e)
        # Re-raise the exception to trigger nack and DLQ processing
        raise


def main():
    rabbitmq_client = RabbitMQClient()
    queue_name = "image-gen-queue"

    log.info(f"Starting to consume from '{queue_name}'...")

    rabbitmq_client.subscribe(
        queue_name=queue_name,
        callback=image_generation_callback,
        get_dependencies_func=get_dependencies,
    )


if __name__ == "__main__":
    main()

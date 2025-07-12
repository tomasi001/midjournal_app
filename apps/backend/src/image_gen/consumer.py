import sys
import os
import json
from uuid import UUID
from sqlalchemy.orm import Session

# Add the project root to the Python path to allow for absolute imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.db.database import get_db
from src.image_gen.stable_diffusion_service import StableDiffusionImageGenerationService
from src.message_queue.client import RabbitMQClient
from src.db.models import JournalEntry
from src.storage.minio_client import MinIOFileStorageService
from src.interfaces.file_storage_service import FileStorageService
from src.interfaces.image_generation_service import ImageGenerationService


def get_dependencies(
    image_gen_service: ImageGenerationService, storage_service: FileStorageService
):
    """Provides dependencies for the image generation consumer."""
    db_session = next(get_db())
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
        print(f"Processing image generation for journal entry {journal_entry_id}")

        # 1. Generate the image bytes
        image_bytes = image_gen_service.generate_image(prompt, user_id, {})

        # 2. Upload the image to MinIO and get the URL
        file_name = f"{user_id}/{journal_entry_id}.png"
        image_url = storage_service.upload_file(
            file_bytes=image_bytes, file_name=file_name, content_type="image/png"
        )

        if not image_url:
            print("Failed to upload image to storage. Aborting update.")
            return

        # 3. Update the journal entry with the new image URL
        (
            db_session.query(JournalEntry)
            .filter(JournalEntry.id == journal_entry_id)
            .update({"image_url": image_url})
        )
        db_session.commit()

        print(f"Updated journal entry {journal_entry_id} with image URL: {image_url}")

    except json.JSONDecodeError:
        print("Failed to decode message body")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        # Re-raise the exception to trigger nack and DLQ processing
        raise


def main():
    print("Loading image generation model...")
    image_gen_service = StableDiffusionImageGenerationService()
    print("Model loaded. Initializing services...")

    storage_service = MinIOFileStorageService()

    rabbitmq_client = RabbitMQClient()
    queue_name = "image-gen-queue"

    print(f"Starting to consume from '{queue_name}'...")

    # Use a nested function (closure) to pass the pre-loaded services
    def get_deps_func():
        return get_dependencies(image_gen_service, storage_service)

    rabbitmq_client.subscribe(
        queue_name=queue_name,
        callback=image_generation_callback,
        get_dependencies_func=get_deps_func,
    )


if __name__ == "__main__":
    main()

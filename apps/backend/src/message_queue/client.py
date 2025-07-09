import pika
import json
import os
from typing import Callable, Dict
from contextlib import contextmanager

from src.interfaces.message_queue_client import MessageQueueClient


class RabbitMQClient(MessageQueueClient):
    def __init__(self, rabbitmq_url="amqp://guest:guest@rabbitmq/"):
        self.rabbitmq_url = rabbitmq_url

    @contextmanager
    def _get_connection(self):
        connection = None
        try:
            connection = pika.BlockingConnection(pika.URLParameters(self.rabbitmq_url))
            yield connection
        finally:
            if connection and connection.is_open:
                connection.close()

    def publish(self, queue_name: str, message: dict):
        try:
            with self._get_connection() as connection:
                channel = connection.channel()
                channel.queue_declare(queue=queue_name, durable=True)
                channel.basic_publish(
                    exchange="",
                    routing_key=queue_name,
                    body=json.dumps(message),
                    properties=pika.BasicProperties(
                        delivery_mode=2,  # make message persistent
                    ),
                )
        except Exception as e:
            # In a real app, you'd have more robust error handling.
            print(f"Failed to publish message: {e}")
            # Depending on requirements, you might want to re-raise the exception
            # or handle it in a specific way (e.g., retry logic).

    def subscribe(self, queue_name: str, callback, get_dependencies_func=None):
        # This method is for long-running consumers, so it manages its own connection.
        connection = pika.BlockingConnection(pika.URLParameters(self.rabbitmq_url))
        channel = connection.channel()
        channel.queue_declare(queue=queue_name, durable=True)

        print(
            f" [*] Waiting for messages in queue '{queue_name}'. To exit press CTRL+C"
        )

        # Pass a wrapper callback that includes dependencies
        deps = get_dependencies_func() if get_dependencies_func else {}

        def callback_with_deps(ch, method, properties, body):
            callback(ch, method, properties, body, deps)

        channel.basic_consume(queue=queue_name, on_message_callback=callback_with_deps)

        try:
            channel.start_consuming()
        except KeyboardInterrupt:
            print("Consumer stopped.")
        finally:
            connection.close()
            # Clean up dependencies if they have close methods
            if "db_session" in deps and hasattr(deps.get("db_session"), "close"):
                deps["db_session"].close()

    def close(self):
        # Since connections are now short-lived, this might not be needed
        # for the publisher, but it's good practice to have.
        pass

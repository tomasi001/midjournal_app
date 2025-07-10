import pika
import json
import os
import threading
from typing import Callable, Dict
from contextlib import contextmanager

from src.interfaces.message_queue_client import MessageQueueClient


class RabbitMQClient(MessageQueueClient):
    def __init__(self, rabbitmq_url="amqp://guest:guest@rabbitmq/"):
        self.rabbitmq_url = rabbitmq_url
        self._connection = None
        self._channel = None

    def _connect(self):
        """Establishes connection and channel."""
        if not self._connection or self._connection.is_closed:
            self._connection = pika.BlockingConnection(
                pika.URLParameters(self.rabbitmq_url)
            )
            self._channel = self._connection.channel()
            print("Successfully connected to RabbitMQ.")

    @contextmanager
    def _get_channel(self):
        """Provides a channel, ensuring connection is active."""
        self._connect()
        yield self._channel

    def publish(self, queue_name: str, message: dict):
        try:
            with self._get_channel() as channel:
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
            print(f"Failed to publish message: {e}")
            self.close()  # Close connection on failure

    def _process_message(self, ch, method, properties, body, callback, deps):
        """The actual message processing logic to be run in a thread."""
        try:
            callback(self._connection, ch, method, properties, body, deps)
        except Exception as e:
            print(f"Error processing message: {e}")

    def subscribe(self, queue_name: str, callback, get_dependencies_func=None):
        self._connect()
        self._channel.queue_declare(queue=queue_name, durable=True)
        print(
            f" [*] Waiting for messages in queue '{queue_name}'. To exit press CTRL+C"
        )

        deps = get_dependencies_func() if get_dependencies_func else {}

        def on_message(ch, method, properties, body):
            thread = threading.Thread(
                target=self._process_message,
                args=(ch, method, properties, body, callback, deps),
            )
            thread.start()

        self._channel.basic_consume(
            queue=queue_name, on_message_callback=on_message, auto_ack=False
        )

        try:
            self._channel.start_consuming()
        except KeyboardInterrupt:
            print("Consumer stopped.")
        finally:
            self.close()
            if "db_session" in deps and hasattr(deps.get("db_session"), "close"):
                deps["db_session"].close()

    def close(self):
        if self._connection and self._connection.is_open:
            self._connection.close()
            print("RabbitMQ connection closed.")

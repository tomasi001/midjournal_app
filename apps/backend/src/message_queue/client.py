import pika
import json
import os
from typing import Callable, Dict

from src.interfaces.message_queue_client import MessageQueueClient


class RabbitMQClient(MessageQueueClient):
    def __init__(self):
        self.rabbitmq_url = os.getenv(
            "RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"
        )
        self.connection = None
        self.channel = None
        self._connect()

    def _connect(self):
        """Establishes a connection and a channel."""
        try:
            self.connection = pika.BlockingConnection(
                pika.URLParameters(self.rabbitmq_url)
            )
            self.channel = self.connection.channel()
            print("Successfully connected to RabbitMQ")
        except pika.exceptions.AMQPConnectionError as e:
            print(f"Failed to connect to RabbitMQ: {e}")
            # In a real app, you'd have a reconnection strategy here
            self.connection = None
            self.channel = None

    def _ensure_connected(self):
        """Ensures there is an active connection."""
        if (
            not self.connection
            or self.connection.is_closed
            or not self.channel
            or self.channel.is_closed
        ):
            print("Connection lost. Reconnecting to RabbitMQ...")
            self._connect()

    def publish(self, queue_name: str, message: Dict):
        """
        Publishes a JSON message to the specified queue.
        The queue is declared to ensure it exists.
        """
        self._ensure_connected()
        if not self.channel:
            print("Cannot publish message, channel is not available.")
            return

        try:
            self.channel.queue_declare(queue=queue_name, durable=True)
            self.channel.basic_publish(
                exchange="",
                routing_key=queue_name,
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # make message persistent
                ),
            )
            print(f" [x] Sent message to queue '{queue_name}'")
        except Exception as e:
            print(f"Failed to publish message: {e}")

    def subscribe(self, queue_name: str, callback_function: Callable):
        """
        Subscribes to a queue and starts consuming messages.
        This method will block and wait for messages.
        """
        self._ensure_connected()
        if not self.channel:
            print("Cannot subscribe to queue, channel is not available.")
            return

        self.channel.queue_declare(queue=queue_name, durable=True)
        print(
            f" [*] Waiting for messages in queue '{queue_name}'. To exit press CTRL+C"
        )

        def callback(ch, method, properties, body):
            print(f" [x] Received message from queue '{queue_name}'")
            message_data = json.loads(body)
            try:
                callback_function(message_data)
                ch.basic_ack(delivery_tag=method.delivery_tag)
                print(f" [x] Acknowledged message from queue '{queue_name}'")
            except Exception as e:
                print(f"Error processing message: {e}")
                ch.basic_nack(
                    delivery_tag=method.delivery_tag, requeue=False
                )  # Don't requeue on failure
                print(f" [x] Rejected message from queue '{queue_name}'")

        self.channel.basic_qos(prefetch_count=1)
        self.channel.basic_consume(queue=queue_name, on_message_callback=callback)

        try:
            self.channel.start_consuming()
        except KeyboardInterrupt:
            self.channel.stop_consuming()
        except Exception as e:
            print(f"Consumer error: {e}")
            self.channel.stop_consuming()

    def close(self):
        """Closes the connection to RabbitMQ."""
        if self.connection and self.connection.is_open:
            self.connection.close()
            print("RabbitMQ connection closed.")

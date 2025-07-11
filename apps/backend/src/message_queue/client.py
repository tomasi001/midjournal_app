import pika
import json
import threading

from src.interfaces.message_queue_client import MessageQueueClient


class RabbitMQClient(MessageQueueClient):
    def __init__(self, rabbitmq_url="amqp://guest:guest@rabbitmq/"):
        self.rabbitmq_url = rabbitmq_url

    def publish(self, queue_name: str, message: dict):
        connection = None
        try:
            connection = pika.BlockingConnection(pika.URLParameters(self.rabbitmq_url))
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
            print(f"Successfully published message to queue '{queue_name}'")
        except pika.exceptions.AMQPConnectionError as e:
            print(f"Failed to connect to RabbitMQ: {e}")
            # Depending on the use case, you might want to raise the exception
            # or implement a retry mechanism.
        except Exception as e:
            print(f"Failed to publish message: {e}")
        finally:
            if connection and connection.is_open:
                connection.close()
                print("RabbitMQ connection for publishing closed.")

    def _process_message(self, ch, method, properties, body, callback, deps):
        """The actual message processing logic to be run in a thread."""
        try:
            callback(ch, method, properties, body, deps)
        except Exception as e:
            print(f"Error processing message: {e}")
        # The main consumer loop will handle ACK/NACK based on this
        # It's important that the callback function implements the ACK/NACK logic

    def subscribe(self, queue_name: str, callback, get_dependencies_func=None):
        connection = None
        try:
            connection = pika.BlockingConnection(pika.URLParameters(self.rabbitmq_url))
            channel = connection.channel()
            channel.queue_declare(queue=queue_name, durable=True)
            print(
                f" [*] Waiting for messages in queue '{queue_name}'. To exit press CTRL+C"
            )

            deps = get_dependencies_func() if get_dependencies_func else {}

            def on_message(ch, method, properties, body):
                # Using a thread to process messages to avoid blocking the I/O loop
                # This is a simple approach. For more complex scenarios, a pool of workers
                # might be more appropriate.
                thread = threading.Thread(
                    target=self._process_message,
                    args=(ch, method, properties, body, callback, deps),
                )
                thread.start()

            channel.basic_consume(
                queue=queue_name, on_message_callback=on_message, auto_ack=False
            )

            channel.start_consuming()

        except KeyboardInterrupt:
            print("Consumer stopped by user.")
        except pika.exceptions.AMQPConnectionError as e:
            print(f"Failed to connect to RabbitMQ: {e}")
            # Implement reconnection logic if necessary
        finally:
            if connection and connection.is_open:
                connection.close()
                print("RabbitMQ connection for subscribing closed.")
            if "db_session" in deps and hasattr(deps.get("db_session"), "close"):
                deps["db_session"].close()

    def close(self):
        # This method is kept for interface compliance but the logic is now handled
        # within publish and subscribe methods.
        pass

from abc import ABC, abstractmethod
from typing import Callable, Dict


class MessageQueueClient(ABC):
    @abstractmethod
    def publish(self, queue_name: str, message: Dict):
        """
        Publishes a message to the specified queue.
        """
        pass

    @abstractmethod
    def subscribe(self, queue_name: str, callback_function: Callable):
        """
        Subscribes to a queue and processes messages with a callback.
        """
        pass

    @abstractmethod
    def close(self):
        """
        Closes the connection to the message queue.
        """
        pass

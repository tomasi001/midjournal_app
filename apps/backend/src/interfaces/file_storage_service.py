from abc import ABC, abstractmethod


class FileStorageService(ABC):
    """
    An abstract base class for file storage services.
    """

    @abstractmethod
    def upload_file(
        self,
        file_bytes: bytes,
        file_name: str,
        content_type: str = "application/octet-stream",
    ) -> str:
        """
        Uploads a file to the storage and returns its public URL.

        :param file_bytes: The file content as bytes.
        :param file_name: The desired name for the file in the storage.
        :param content_type: The MIME type of the file.
        :return: The public URL of the uploaded file.
        """
        pass

    @abstractmethod
    def get_file(self, file_name: str) -> tuple[bytes, str] | None:
        """
        Retrieves a file from the storage.

        :param file_name: The name of the file to retrieve.
        :return: A tuple containing the file content as bytes and its content type, or None if not found.
        """
        pass

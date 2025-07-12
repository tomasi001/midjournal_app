import boto3
import os
from botocore.client import Config
from botocore.exceptions import NoCredentialsError, PartialCredentialsError, ClientError
import structlog
import io
import json

from src.interfaces.file_storage_service import FileStorageService

log = structlog.get_logger()


class MinIOFileStorageService(FileStorageService):
    def __init__(self):
        self.minio_url = os.getenv("MINIO_URL", "http://localhost:9000")
        self.minio_public_url = os.getenv("MINIO_PUBLIC_URL", self.minio_url)
        self.access_key = os.getenv("MINIO_ACCESS_KEY", "youruser")
        self.secret_key = os.getenv("MINIO_SECRET_KEY", "yourpassword")
        self.bucket_name = os.getenv("MINIO_BUCKET", "images")

        log.info(
            "Initializing MinIO client",
            minio_url=self.minio_url,
            minio_public_url=self.minio_public_url,
            bucket_name=self.bucket_name,
        )

        try:
            self.s3_client = boto3.client(
                "s3",
                endpoint_url=self.minio_url,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                config=Config(signature_version="s3v4"),
            )
            self._create_bucket_if_not_exists()
            self._set_public_read_policy()
        except (NoCredentialsError, PartialCredentialsError) as e:
            log.error("Credentials not available for MinIO client.", error=e)
            self.s3_client = None
        except Exception as e:
            log.error("Failed to initialize MinIO client.", error=e)
            self.s3_client = None

    def _create_bucket_if_not_exists(self):
        if not self.s3_client:
            return
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            log.info(f"Bucket '{self.bucket_name}' already exists.")
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                log.info(f"Bucket '{self.bucket_name}' not found. Creating it.")
                self.s3_client.create_bucket(Bucket=self.bucket_name)
                log.info(f"Bucket '{self.bucket_name}' created.")
            else:
                log.error("Error checking for bucket", error=e)
                raise

    def _set_public_read_policy(self):
        if not self.s3_client:
            return
        try:
            policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "PublicReadGetObject",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": ["s3:GetObject"],
                        "Resource": [f"arn:aws:s3:::{self.bucket_name}/*"],
                    }
                ],
            }
            self.s3_client.put_bucket_policy(
                Bucket=self.bucket_name, Policy=json.dumps(policy)
            )
            log.info(f"Public read policy set for bucket '{self.bucket_name}'.")
        except ClientError as e:
            log.error(
                "Failed to set public read policy for bucket",
                bucket=self.bucket_name,
                error=e,
            )
            raise

    def upload_file(
        self, file_bytes: bytes, file_name: str, content_type: str = "image/png"
    ) -> str:
        if not self.s3_client:
            log.error("Cannot upload file, S3 client not initialized.")
            return ""

        try:
            file_stream = io.BytesIO(file_bytes)
            self.s3_client.upload_fileobj(
                Fileobj=file_stream,
                Bucket=self.bucket_name,
                Key=file_name,
                ExtraArgs={"ContentType": content_type},
            )

            # Construct the public URL
            public_url = f"{self.minio_public_url}/{self.bucket_name}/{file_name}"

            log.info(
                "File uploaded successfully to MinIO",
                file_name=file_name,
                public_url=public_url,
            )
            return public_url
        except ClientError as e:
            log.error("Failed to upload file to MinIO", file_name=file_name, error=e)
            return ""
        except Exception as e:
            log.error("An unexpected error occurred during file upload", error=e)
            return ""

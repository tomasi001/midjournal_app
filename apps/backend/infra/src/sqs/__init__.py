import pulumi_aws as aws


def create_ingestion_queue():
    """Creates the SQS ingestion queue."""
    ingestion_queue = aws.sqs.Queue(
        "ingestion-queue",
        name="midjournal-ingestion-queue",
        tags={
            "Name": "midjournal-ingestion-queue",
        },
    )
    return ingestion_queue

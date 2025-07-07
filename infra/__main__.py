import pulumi
from config import aws_region
from src.networking import create_networking_resources
from src.iam import create_lambda_role
from src.sqs import create_ingestion_queue
from src.lambda_function import create_hello_world_lambda

# Create the networking resources
vpc, public_subnet, private_subnet = create_networking_resources(aws_region)

# Create the IAM role for the Lambda
lambda_role = create_lambda_role()

# Create the SQS queue
ingestion_queue = create_ingestion_queue()

# Create the Lambda function, passing the role's ARN
hello_world_lambda = create_hello_world_lambda(lambda_role.arn)

# Export the names and URLs of the created resources
pulumi.export("vpc_id", vpc.id)
pulumi.export("ingestion_queue_url", ingestion_queue.id)
pulumi.export("lambda_function_name", hello_world_lambda.name)

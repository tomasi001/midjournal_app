"""A Python Pulumi program"""

import pulumi
import pulumi_aws as aws

# Get the AWS provider configuration
config = pulumi.Config()
aws_region = config.get("aws:region") or "ap-southeast-2"

# Create a new VPC (Virtual Private Cloud)
vpc = aws.ec2.Vpc(
    "main-vpc",
    cidr_block="10.0.0.0/16",
    enable_dns_support=True,
    enable_dns_hostnames=True,
    tags={
        "Name": "midjournal-vpc",
    },
)

# Create a public subnet
public_subnet = aws.ec2.Subnet(
    "public-subnet",
    vpc_id=vpc.id,
    cidr_block="10.0.1.0/24",
    availability_zone=f"{aws_region}a",
    map_public_ip_on_launch=True,
    tags={
        "Name": "midjournal-public-subnet",
    },
)

# Create a private subnet
private_subnet = aws.ec2.Subnet(
    "private-subnet",
    vpc_id=vpc.id,
    cidr_block="10.0.2.0/24",
    availability_zone=f"{aws_region}a",
    tags={
        "Name": "midjournal-private-subnet",
    },
)

# Create an SQS queue for ingestion
ingestion_queue = aws.sqs.Queue(
    "ingestion-queue",
    name="midjournal-ingestion-queue",
    tags={
        "Name": "midjournal-ingestion-queue",
    },
)

# Create an IAM role for the Lambda function
lambda_role = aws.iam.Role(
    "lambda-exec-role",
    assume_role_policy="""{
        "Version": "2012-10-17",
        "Statement": [{
            "Action": "sts:AssumeRole",
            "Effect": "Allow",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            }
        }]
    }""",
)

# Attach the basic execution policy to the role
aws.iam.RolePolicyAttachment(
    "lambda-basic-execution",
    role=lambda_role.name,
    policy_arn="arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
)

# Create a dummy Lambda function
# In a real setup, the code would be packaged by a CI/CD pipeline
hello_world_lambda = aws.lambda_.Function(
    "hello-world-lambda",
    role=lambda_role.arn,
    runtime="python3.9",
    handler="lambda_function.lambda_handler",
    code=pulumi.FileArchive("./lambda_function.zip"),
)

# To create the dummy zip file, we can use a small helper script or do it manually.
# For this example, we assume `lambda_function.zip` exists in the `infra` directory.
# You can create it with:
# echo 'def lambda_handler(event, context): return {"statusCode": 200, "body": "Hello from Lambda!"}' > infra/lambda_function.py
# zip infra/lambda_function.zip infra/lambda_function.py

# Export the names and URLs of the created resources
pulumi.export("vpc_id", vpc.id)
pulumi.export("ingestion_queue_url", ingestion_queue.id)
pulumi.export("lambda_function_name", hello_world_lambda.name)

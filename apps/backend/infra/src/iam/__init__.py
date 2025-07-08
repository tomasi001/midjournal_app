import pulumi_aws as aws


def create_lambda_role():
    """Creates the IAM role and policy attachment for the Lambda function."""
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

    aws.iam.RolePolicyAttachment(
        "lambda-basic-execution",
        role=lambda_role.name,
        policy_arn="arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    )

    return lambda_role

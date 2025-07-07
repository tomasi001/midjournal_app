import pulumi
import pulumi_aws as aws


def create_hello_world_lambda(lambda_role_arn: pulumi.Output):
    """Creates the hello world Lambda function."""
    hello_world_lambda = aws.lambda_.Function(
        "hello-world-lambda",
        role=lambda_role_arn,
        runtime="python3.9",
        handler="lambda_function.lambda_handler",
        code=pulumi.FileArchive("src/lambda_function/assets/lambda_function.zip"),
    )
    return hello_world_lambda

import pulumi

# Create a new configuration object
config = pulumi.Config()

# Get the AWS region from the Pulumi config, or default to ap-southeast-2
aws_region = config.get("aws:region") or "ap-southeast-2"

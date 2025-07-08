import pulumi_aws as aws


def create_networking_resources(aws_region: str):
    """Creates the VPC and subnets."""
    vpc = aws.ec2.Vpc(
        "main-vpc",
        cidr_block="10.0.0.0/16",
        enable_dns_support=True,
        enable_dns_hostnames=True,
        tags={
            "Name": "midjournal-vpc",
        },
    )

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

    private_subnet = aws.ec2.Subnet(
        "private-subnet",
        vpc_id=vpc.id,
        cidr_block="10.0.2.0/24",
        availability_zone=f"{aws_region}a",
        tags={
            "Name": "midjournal-private-subnet",
        },
    )

    return vpc, public_subnet, private_subnet

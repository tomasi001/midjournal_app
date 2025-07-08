# Infrastructure as Code (IaC) Guide with Pulumi

This document provides instructions for setting up and managing our AWS infrastructure using Pulumi.

## Prerequisites

- [Pulumi CLI](https://www.pulumi.com/docs/install/) installed and configured.
- [AWS CLI](https://aws.amazon.com/cli/) installed and configured with credentials that have permissions to create the required resources.
- Python and Poetry installed.

## Project Structure

- The Pulumi project is located in the `/infra` directory.
- All infrastructure is defined in Python in `infra/__main__.py`.
- Python dependencies for the IaC code are managed by `infra/requirements.txt`.

## Setup Instructions

1.  **Navigate to the infrastructure directory:**

    ```bash
    cd infra
    ```

2.  **Install Python dependencies:**
    The Pulumi project has its own virtual environment. To install the required packages (`pulumi`, `pulumi-aws`), run:
    ```bash
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```
    _Note: The `pulumi new` command should have already created the virtual environment and installed these._

## Managing Infrastructure

All commands should be run from within the `infra/` directory.

1.  **Select the Stack:**
    A stack is an isolated instance of your infrastructure. We have a `dev` stack by default.

    ```bash
    pulumi stack select dev
    ```

2.  **Preview Changes:**
    To see what changes Pulumi will make before actually performing an update, run:

    ```bash
    pulumi preview
    ```

    This is equivalent to `terraform plan` and is safe to run anytime.

3.  **Deploy or Update Infrastructure:**
    To create or update the resources as defined in `__main__.py`, run:

    ```bash
    pulumi up
    ```

    Pulumi will show you a preview and ask for confirmation before making any changes.

4.  **View Outputs:**
    To see the exported outputs of your stack (like the VPC ID or Lambda function name), run:

    ```bash
    pulumi stack output
    ```

5.  **Destroy Infrastructure:**
    To tear down all resources managed by the stack, run:
    ```bash
    pulumi destroy
    ```
    Pulumi will ask for confirmation before deleting the resources. This is irreversible.

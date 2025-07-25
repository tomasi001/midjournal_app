"""Add image_url to journal_entries

Revision ID: 2d1979aafcaf
Revises:
Create Date: 2025-07-12 10:43:31.430648

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "2d1979aafcaf"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("journal_entries", sa.Column("image_url", sa.String(), nullable=True))

    # Create a temporary column to hold the converted array data
    op.add_column(
        "journal_entries",
        sa.Column("keywords_temp", sa.ARRAY(sa.String()), nullable=True),
    )

    # Use a raw SQL statement to populate the temporary column by converting JSON to a proper SQL array
    op.execute(
        """
        UPDATE journal_entries
        SET keywords_temp = (
            SELECT array_agg(value)
            FROM json_array_elements_text(keywords::json)
        )
        WHERE keywords IS NOT NULL
    """
    )

    # Drop the old JSON column
    op.drop_column("journal_entries", "keywords")

    # Rename the temporary column to the final name
    op.alter_column("journal_entries", "keywords_temp", new_column_name="keywords")

    op.drop_column("journal_entries", "generated_image_url")
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "journal_entries",
        sa.Column("generated_image_url", sa.TEXT(), autoincrement=False, nullable=True),
    )

    # To downgrade, we perform the reverse operation
    op.add_column(
        "journal_entries",
        sa.Column(
            "keywords_temp", postgresql.JSON(astext_type=sa.Text()), nullable=True
        ),
    )

    # Convert array back to JSON
    op.execute(
        """
        UPDATE journal_entries
        SET keywords_temp = (
            SELECT json_agg(value)
            FROM unnest(keywords) as value
        )
        WHERE keywords IS NOT NULL
    """
    )

    op.drop_column("journal_entries", "keywords")
    op.alter_column("journal_entries", "keywords_temp", new_column_name="keywords")

    op.drop_column("journal_entries", "image_url")
    # ### end Alembic commands ###

from logging.config import fileConfig

import os
import sys

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Allow Alembic to import the app package.
sys.path.append(
    os.path.dirname(
        os.path.dirname(__file__)
    )
)

from app.core.database import Base

# Import all models and tables so that they are registered
# in Base.metadata before Alembic compares the database schema.
from app.models import (
    User,
    Incident,
    Event,
    Finding,
    InvestigationStep,
    ResponseAction,
)

from app.models.finding_evidence import finding_evidence
from app.core.config import settings


# Alembic Config object.
config = context.config


# Configure Python logging from alembic.ini.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# Metadata used by Alembic for autogeneration.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations in offline mode.

    Offline mode generates SQL without establishing
    a database connection.
    """

    config.set_main_option(
        "sqlalchemy.url",
        settings.database_url,
    )

    url = config.get_main_option(
        "sqlalchemy.url"
    )

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={
            "paramstyle": "named"
        },
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in online mode.

    Online mode connects directly to PostgreSQL
    and applies migrations.
    """

    config.set_main_option(
        "sqlalchemy.url",
        settings.database_url,
    )

    connectable = engine_from_config(
        config.get_section(
            config.config_ini_section,
            {},
        ),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

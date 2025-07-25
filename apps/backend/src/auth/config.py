from pydantic_settings import BaseSettings


class AuthSettings(BaseSettings):
    SECRET_KEY: str = (
        "a_very_secret_key"  # Should be loaded from .env file in production
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = AuthSettings()

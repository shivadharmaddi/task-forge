from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./taskforge.db"
    environment: str = "development"
    cors_origins: str = "http://localhost:3000"
    retry_delay_seconds: int = 2
    heartbeat_timeout_seconds: int = 30
    default_max_attempts: int = 3
    max_payload_size: int = 10240

    class Config:
        env_file = ".env"


settings = Settings()

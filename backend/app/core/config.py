from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenAI
    OPENAI_API_KEY: str
    
    # IPFS - Correct MultiAddr format
    IPFS_API_URL: str = "/ip4/127.0.0.1/tcp/5001/http"
    IPFS_GATEWAY_URL: str = "http://localhost:8080"
    
    # Blockchain
    WEB3_PROVIDER_URL: str
    PRIVATE_KEY: str
    CONTRACT_ADDRESS: str
    
    class Config:
        env_file = ".env"

settings = Settings()

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Base de données
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenAI
    OPENAI_API_KEY: str
    
    # IPFS
    IPFS_API_URL: str = "http://localhost:5001"
    IPFS_GATEWAY_URL: str = "http://localhost:8080"
    
    # Blockchain
    WEB3_PROVIDER_URL: str
    PRIVATE_KEY: str
    CONTRACT_ADDRESS: str
    
    class Config:
        env_file = ".env"

settings = Settings()
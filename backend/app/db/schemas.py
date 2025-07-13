from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ContentType(str, Enum):
    image = "image"
    text = "text"
    audio = "audio"

class ContentDescription(str, Enum):
    logo = "logo"
    slogan = "slogan"
    tiffo = "tiffo"
    vetement = "vetement"
    lyrics = "lyrics"
    musique = "musique"

class UserBase(BaseModel):
    wallet_address: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    country: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    country: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ContentBase(BaseModel):
    type: ContentType
    description: ContentDescription
    prompt: str

class ContentCreate(ContentBase):
    pass

class ContentUpdate(BaseModel):
    type: Optional[ContentType] = None
    description: Optional[ContentDescription] = None
    prompt: Optional[str] = None

class ContentResponse(ContentBase):
    id: int
    user_id: int
    ipfs_url: Optional[str] = None
    votes: int = 0
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ContentWithUser(ContentResponse):
    user: UserResponse

class VoteBase(BaseModel):
    content_id: int
    amount: float = Field(..., gt=0, description="Amount in $FAN token")

class VoteCreate(VoteBase):
    pass

class VoteResponse(VoteBase):
    id: int
    voter_id: int
    tx_hash: Optional[str] = None

    class Config:
        from_attributes = True

class VoteWithDetails(VoteResponse):
    voter: UserResponse
    content: ContentResponse

class BadgeNFTBase(BaseModel):
    nft_token_id: str
    metadata_ipfs: str

class BadgeNFTCreate(BadgeNFTBase):
    pass

class BadgeNFTResponse(BadgeNFTBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class BadgeNFTWithUser(BadgeNFTResponse):
    user: UserResponse

class LeaderboardEntry(BaseModel):
    user: UserResponse
    total_votes: int
    total_fan_tokens: float
    content_count: int
    rank: int

class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]
    total_users: int
    page: int
    per_page: int

class MessageResponse(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None

class WalletSignature(BaseModel):
    message: str
    signature: str
    wallet_address: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class AIGenerationRequest(BaseModel):
    prompt: str
    type: ContentType
    description: ContentDescription

class AIGenerationResponse(BaseModel):
    content_id: int
    ipfs_url: str
    prompt: str
    message: str = "Content generated successfully"

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class ContentType(enum.Enum):
    image = "image"
    text = "text"
    audio = "audio"

class ContentDescription(enum.Enum):
    logo = "logo"
    slogan = "slogan"
    tiffo = "tiffo"
    vetement = "vetement"
    lyrics = "lyrics"
    musique = "musique"

class User(Base):
    __tablename__ = "user"
    
    id = Column(Integer, primary_key=True)
    wallet_address = Column(String, unique=True)
    first_name = Column(String)
    last_name = Column(String)
    country = Column(String)
    avatar_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    
    # Relationships
    contents = relationship("Content", back_populates="user")
    votes = relationship("Vote", back_populates="voter")
    badges = relationship("BadgeNFT", back_populates="user")

class Content(Base):
    __tablename__ = "content"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    type = Column(Enum(ContentType))
    description = Column(Enum(ContentDescription))
    prompt = Column(String)
    ipfs_url = Column(String)
    votes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="contents")
    vote_records = relationship("Vote", back_populates="content")

class Vote(Base):
    __tablename__ = "vote"
    
    id = Column(Integer, primary_key=True)
    voter_id = Column(Integer, ForeignKey("user.id"))
    content_id = Column(Integer, ForeignKey("content.id"))
    amount = Column(Float)  # in $FAN token
    tx_hash = Column(String)
    
    # Relationships
    voter = relationship("User", back_populates="votes")
    content = relationship("Content", back_populates="vote_records")

class BadgeNFT(Base):
    __tablename__ = "badge_nft"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    nft_token_id = Column(String)
    metadata_ipfs = Column(String)
    
    # Relationships
    user = relationship("User", back_populates="badges")

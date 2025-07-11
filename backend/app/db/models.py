from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    wallet_address = Column(String, unique=True, nullable=True)
    fan_tokens = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relations
    contents = relationship("Content", back_populates="creator")
    votes = relationship("Vote", back_populates="voter")
    badges = relationship("BadgeNFT", back_populates="owner")

class Content(Base):
    __tablename__ = "contents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    content_type = Column(String)  # "image", "text", "video"
    ipfs_hash = Column(String)
    creator_id = Column(Integer, ForeignKey("users.id"))
    total_votes = Column(Integer, default=0)
    total_tokens_earned = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    creator = relationship("User", back_populates="contents")
    votes = relationship("Vote", back_populates="content")

class Vote(Base):
    __tablename__ = "votes"
    
    id = Column(Integer, primary_key=True, index=True)
    voter_id = Column(Integer, ForeignKey("users.id"))
    content_id = Column(Integer, ForeignKey("contents.id"))
    tokens_spent = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    voter = relationship("User", back_populates="votes")
    content = relationship("Content", back_populates="votes")

class BadgeNFT(Base):
    __tablename__ = "badge_nfts"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    nft_id = Column(String, unique=True)
    badge_type = Column(String)  # "creator", "voter", "achievement"
    metadata_uri = Column(String)
    blockchain_tx = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    owner = relationship("User", back_populates="badges")

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.db.models import User
from app.db.schemas import UserResponse, UserCreate, UserUpdate, WalletSignature, AuthResponse
from app.api.deps import get_current_user
from app.core.security import create_access_token, verify_wallet_signature
from datetime import datetime

router = APIRouter()

@router.post("/auth/wallet", response_model=AuthResponse)
async def authenticate_wallet(
    wallet_data: WalletSignature,
    db: Session = Depends(get_db)
):
    """Wallet signature authentication"""
    # Verify signature (to be implemented according to your method)
    if not verify_wallet_signature(wallet_data.message, wallet_data.signature, wallet_data.wallet_address):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signature"
        )
    
    # Find or create user
    user = db.query(User).filter(User.wallet_address == wallet_data.wallet_address).first()
    if not user:
        user = User(wallet_address=wallet_data.wallet_address)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create JWT token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        access_token=access_token,
        user=UserResponse.from_orm(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user profile"""
    return UserResponse.from_orm(current_user)

@router.put("/me", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    return UserResponse.from_orm(current_user)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return UserResponse.from_orm(user)

@router.get("/{wallet_address}/balances")
async def get_user_balances(wallet_address: str, db: Session = Depends(get_db)):
    """Return user balances (CHZ + team tokens)"""
    user = db.query(User).filter(User.wallet_address == wallet_address).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Mock data here – replace with actual balance fetching logic
    return {
        "chzBalance": 1000.5,
        "teamBalances": {
            "psg": 150,
            "juve": 80,
            "barca": 300
        }
    }

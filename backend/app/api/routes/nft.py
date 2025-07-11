from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db.models import User, BadgeNFT
from app.db.schemas import BadgeNFTResponse, BadgeNFTWithUser
from app.api.deps import get_current_user
from app.services.nft_service import nft_service

router = APIRouter()

@router.get("/badges/me", response_model=List[BadgeNFTResponse])
async def get_my_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupérer mes badges NFT"""
    badges = db.query(BadgeNFT).filter(BadgeNFT.user_id == current_user.id).all()
    return [BadgeNFTResponse.from_orm(badge) for badge in badges]

@router.get("/badges/user/{user_id}", response_model=List[BadgeNFTResponse])
async def get_user_badges(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Récupérer les badges d'un utilisateur"""
    badges = db.query(BadgeNFT).filter(BadgeNFT.user_id == user_id).all()
    return [BadgeNFTResponse.from_orm(badge) for badge in badges]

@router.post("/badges/check")
async def check_badge_eligibility(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Vérifier et attribuer automatiquement les badges"""
    try:
        await nft_service.check_and_award_badges(current_user, db)
        return {"message": "Badges vérifiés et attribués"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la vérification des badges: {str(e)}"
        )

@router.get("/badges/{badge_id}", response_model=BadgeNFTWithUser)
async def get_badge_details(
    badge_id: int,
    db: Session = Depends(get_db)
):
    """Récupérer les détails d'un badge"""
    badge = db.query(BadgeNFT).filter(BadgeNFT.id == badge_id).first()
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Badge non trouvé"
        )
    return BadgeNFTWithUser.from_orm(badge)

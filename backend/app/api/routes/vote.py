from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.db.session import get_db
from app.db.models import User, Content, Vote
from app.db.schemas import VoteCreate, VoteResponse, VoteWithDetails
from app.api.deps import get_current_user
from app.services.smart_contract import execute_vote_transaction

router = APIRouter()

@router.post("/", response_model=VoteResponse)
async def vote_for_content(
    vote_data: VoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Voter pour un contenu avec des $FAN tokens"""
    # Vérifier que le contenu existe
    content = db.query(Content).filter(
        Content.id == vote_data.content_id,
        Content.deleted_at.is_(None)
    ).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contenu non trouvé"
        )
    
    # Vérifier qu'on ne vote pas pour son propre contenu
    if content.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas voter pour votre propre contenu"
        )
    
    try:
        # Exécuter la transaction blockchain
        tx_hash = await execute_vote_transaction(
            voter_address=current_user.wallet_address,
            content_id=vote_data.content_id,
            amount=vote_data.amount
        )
        
        # Enregistrer le vote
        vote = Vote(
            voter_id=current_user.id,
            content_id=vote_data.content_id,
            amount=vote_data.amount,
            tx_hash=tx_hash
        )
        db.add(vote)
        
        # Mettre à jour le compteur de votes du contenu
        content.votes += 1
        
        db.commit()
        db.refresh(vote)
        
        return VoteResponse.from_orm(vote)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du vote: {str(e)}"
        )

@router.get("/content/{content_id}", response_model=List[VoteWithDetails])
async def get_content_votes(
    content_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Récupérer les votes d'un contenu"""
    votes = db.query(Vote).filter(
        Vote.content_id == content_id
    ).offset(skip).limit(limit).all()
    
    return [VoteWithDetails.from_orm(vote) for vote in votes]

@router.get("/user/{user_id}", response_model=List[VoteResponse])
async def get_user_votes(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Récupérer les votes d'un utilisateur"""
    votes = db.query(Vote).filter(
        Vote.voter_id == user_id
    ).offset(skip).limit(limit).all()
    
    return [VoteResponse.from_orm(vote) for vote in votes]
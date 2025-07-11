from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from app.db.session import get_db
from app.db.models import User, Content, Vote
from app.db.schemas import LeaderboardResponse, LeaderboardEntry, UserResponse

router = APIRouter()

@router.get("/creators", response_model=LeaderboardResponse)
async def get_creators_leaderboard(
    page: int = 1,
    per_page: int = 20,
    db: Session = Depends(get_db)
):
    """Classement des créateurs par nombre de votes et tokens reçus"""
    skip = (page - 1) * per_page
    
    # Requête pour le classement
    query = db.query(
        User,
        func.count(Content.id).label('content_count'),
        func.sum(Content.votes).label('total_votes'),
        func.sum(Vote.amount).label('total_fan_tokens')
    ).join(
        Content, User.id == Content.user_id
    ).outerjoin(
        Vote, Content.id == Vote.content_id
    ).filter(
        Content.deleted_at.is_(None),
        User.deleted_at.is_(None)
    ).group_by(User.id).order_by(
        desc('total_votes'),
        desc('total_fan_tokens')
    )
    
    # Pagination
    total_users = query.count()
    results = query.offset(skip).limit(per_page).all()
    
    # Construire les entrées du classement
    entries = []
    for idx, (user, content_count, total_votes, total_fan_tokens) in enumerate(results):
        entries.append(LeaderboardEntry(
            user=UserResponse.from_orm(user),
            total_votes=total_votes or 0,
            total_fan_tokens=total_fan_tokens or 0.0,
            content_count=content_count or 0,
            rank=skip + idx + 1
        ))
    
    return LeaderboardResponse(
        entries=entries,
        total_users=total_users,
        page=page,
        per_page=per_page
    )

@router.get("/voters", response_model=LeaderboardResponse)
async def get_voters_leaderboard(
    page: int = 1,
    per_page: int = 20,
    db: Session = Depends(get_db)
):
    """Classement des votants par tokens dépensés"""
    skip = (page - 1) * per_page
    
    query = db.query(
        User,
        func.count(Vote.id).label('vote_count'),
        func.sum(Vote.amount).label('total_spent')
    ).join(
        Vote, User.id == Vote.voter_id
    ).filter(
        User.deleted_at.is_(None)
    ).group_by(User.id).order_by(
        desc('total_spent')
    )
    
    total_users = query.count()
    results = query.offset(skip).limit(per_page).all()
    
    entries = []
    for idx, (user, vote_count, total_spent) in enumerate(results):
        entries.append(LeaderboardEntry(
            user=UserResponse.from_orm(user),
            total_votes=vote_count or 0,
            total_fan_tokens=total_spent or 0.0,
            content_count=0,  # Pas pertinent pour les votants
            rank=skip + idx + 1
        ))
    
    return LeaderboardResponse(
        entries=entries,
        total_users=total_users,
        page=page,
        per_page=per_page
    )
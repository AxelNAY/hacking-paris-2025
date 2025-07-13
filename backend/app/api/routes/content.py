from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.db.models import User, Content
from app.db.schemas import (
    ContentResponse, ContentCreate, ContentWithUser,
    AIGenerationRequest, AIGenerationResponse
)
from app.api.deps import get_current_user
from app.services.ai_generator import generate_content
from app.services.ipfs import upload_to_ipfs
from datetime import datetime

router = APIRouter()

@router.post("/generate", response_model=AIGenerationResponse)
async def generate_ai_content(
    request: AIGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate content with AI"""
    try:
        # Generate content with AI
        generated_content = await generate_content(
            prompt=request.prompt,
            content_type=request.type,
            description=request.description
        )
        
        # Upload to IPFS
        ipfs_url = await upload_to_ipfs(generated_content)
        
        # Save to database
        content = Content(
            user_id=current_user.id,
            type=request.type,
            description=request.description,
            prompt=request.prompt,
            ipfs_url=ipfs_url
        )
        db.add(content)
        db.commit()
        db.refresh(content)
        
        return AIGenerationResponse(
            content_id=content.id,
            ipfs_url=ipfs_url,
            prompt=request.prompt
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during generation: {str(e)}"
        )

@router.get("/all", response_model=List[ContentWithUser])
async def get_all_content(
    skip: int = 0,
    limit: int = 20,
    content_type: Optional[str] = None,
    description: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all content with pagination and filters"""
    query = db.query(Content).filter(Content.deleted_at.is_(None))
    
    if content_type:
        query = query.filter(Content.type == content_type)
    if description:
        query = query.filter(Content.description == description)
    
    contents = query.offset(skip).limit(limit).all()
    return [ContentWithUser.from_orm(content) for content in contents]

@router.get("/{content_id}", response_model=ContentWithUser)
async def get_content_by_id(
    content_id: int,
    db: Session = Depends(get_db)
):
    """Get content by ID"""
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.deleted_at.is_(None)
    ).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    return ContentWithUser.from_orm(content)

@router.get("/user/{user_id}", response_model=List[ContentResponse])
async def get_user_content(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get user's content"""
    contents = db.query(Content).filter(
        Content.user_id == user_id,
        Content.deleted_at.is_(None)
    ).offset(skip).limit(limit).all()
    
    return [ContentResponse.from_orm(content) for content in contents]

@router.delete("/{content_id}")
async def delete_content(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete content (soft delete)"""
    content = db.query(Content).filter(Content.id == content_id).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    if content.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own content"
        )
    
    content.deleted_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Content successfully deleted"}

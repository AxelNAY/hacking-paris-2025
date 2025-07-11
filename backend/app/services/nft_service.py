import json
import time
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.db.models import User, BadgeNFT
from app.services.ipfs import upload_to_ipfs
from app.services.smart_contract import mint_badge_nft

class NFTService:
    
    async def create_badge_metadata(self, user: User, badge_type: str, achievements: Dict[str, Any]) -> Dict[str, Any]:
        """Créer les métadonnées du badge NFT"""
        metadata = {
            "name": f"Fan Platform Badge - {badge_type}",
            "description": f"Badge {badge_type} pour {user.first_name} {user.last_name}",
            "image": f"https://your-cdn.com/badges/{badge_type}.png",  # À adapter
            "attributes": [
                {
                    "trait_type": "Badge Type",
                    "value": badge_type
                },
                {
                    "trait_type": "User",
                    "value": f"{user.first_name} {user.last_name}"
                },
                {
                    "trait_type": "Wallet",
                    "value": user.wallet_address
                },
                {
                    "trait_type": "Earned At",
                    "value": str(time.time())
                }
            ],
            "properties": {
                "user_id": user.id,
                "achievements": achievements,
                "platform": "Fan Platform"
            }
        }
        
        return metadata
    
    async def mint_achievement_badge(self, user: User, badge_type: str, achievements: Dict[str, Any], db: Session) -> BadgeNFT:
        """Mint un badge d'achievement pour un utilisateur"""
        try:
            # Créer les métadonnées
            metadata = await self.create_badge_metadata(user, badge_type, achievements)
            
            # Uploader les métadonnées sur IPFS
            metadata_ipfs = await upload_to_ipfs(json.dumps(metadata), "text")
            
            # Mint le NFT sur la blockchain
            token_id, tx_hash = await mint_badge_nft(user.wallet_address, metadata_ipfs)
            
            # Sauvegarder en base
            badge = BadgeNFT(
                user_id=user.id,
                nft_token_id=token_id,
                metadata_ipfs=metadata_ipfs
            )
            db.add(badge)
            db.commit()
            db.refresh(badge)
            
            return badge
            
        except Exception as e:
            raise Exception(f"Erreur mint badge: {str(e)}")
    
    async def check_and_award_badges(self, user: User, db: Session):
        """Vérifier et attribuer automatiquement les badges"""
        # Calculer les statistiques de l'utilisateur
        user_stats = await self.get_user_stats(user.id, db)
        
        # Définir les critères des badges
        badge_criteria = {
            "First Creator": user_stats["content_count"] >= 1,
            "Prolific Creator": user_stats["content_count"] >= 10,
            "Popular Creator": user_stats["total_votes"] >= 100,
            "Top Voter": user_stats["votes_given"] >= 50,
            "Generous Supporter": user_stats["tokens_spent"] >= 1000,
        }
        
        # Vérifier et attribuer les badges
        for badge_type, criteria_met in badge_criteria.items():
            if criteria_met:
                # Vérifier si l'utilisateur a déjà ce badge
                existing_badge = db.query(BadgeNFT).filter(
                    BadgeNFT.user_id == user.id,
                    BadgeNFT.nft_token_id.like(f"%{badge_type}%")
                ).first()
                
                if not existing_badge:
                    await self.mint_achievement_badge(
                        user, badge_type, user_stats, db
                    )
    
    async def get_user_stats(self, user_id: int, db: Session) -> Dict[str, Any]:
        """Calculer les statistiques d'un utilisateur"""
        from sqlalchemy import func
        from app.db.models import Content, Vote
        
        # Nombre de contenus créés
        content_count = db.query(func.count(Content.id)).filter(
            Content.user_id == user_id,
            Content.deleted_at.is_(None)
        ).scalar() or 0
        
        # Total des votes reçus
        total_votes = db.query(func.sum(Content.votes)).filter(
            Content.user_id == user_id,
            Content.deleted_at.is_(None)
        ).scalar() or 0
        
        # Nombre de votes donnés
        votes_given = db.query(func.count(Vote.id)).filter(
            Vote.voter_id == user_id
        ).scalar() or 0
        
        # Tokens dépensés en votes
        tokens_spent = db.query(func.sum(Vote.amount)).filter(
            Vote.voter_id == user_id
        ).scalar() or 0.0
        
        # Tokens reçus
        tokens_received = db.query(func.sum(Vote.amount)).join(
            Content, Vote.content_id == Content.id
        ).filter(
            Content.user_id == user_id,
            Content.deleted_at.is_(None)
        ).scalar() or 0.0
        
        return {
            "content_count": content_count,
            "total_votes": total_votes,
            "votes_given": votes_given,
            "tokens_spent": tokens_spent,
            "tokens_received": tokens_received
        }

# Instance globale
nft_service = NFTService()

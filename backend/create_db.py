#!/usr/bin/env python3
"""
Script simple pour créer la base de données
Usage: python create_db.py
"""

from app.db.models import Base
from app.db.session import engine
from app.core.config import settings

def create_database():
    """Créer toutes les tables de la base de données"""
    print("🔄 Création de la base de données PostgreSQL...")
    print(f"📍 URL: {settings.DATABASE_URL}")
    
    try:
        # Créer toutes les tables définies dans models.py
        Base.metadata.create_all(bind=engine)
        
        print("✅ Base de données créée avec succès!")
        print("📋 Tables créées:")
        print("   - user")
        print("   - content") 
        print("   - vote")
        print("   - badge_nft")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création: {e}")
        print("💡 Vérifiez que PostgreSQL est démarré et que la base existe")
        raise

if __name__ == "__main__":
    create_database()
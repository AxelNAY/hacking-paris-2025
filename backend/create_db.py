#!/usr/bin/env python3
"""
Simple script to create the database
Usage: python create_db.py
"""

from app.db.models import Base
from app.db.session import engine
from app.core.config import settings

def create_database():
    """Create all database tables"""
    print("🔄 Creating PostgreSQL database...")
    print(f"📍 URL: {settings.DATABASE_URL}")
    
    try:
        # Create all tables defined in models.py
        Base.metadata.create_all(bind=engine)
        
        print("✅ Database created successfully!")
        print("📋 Tables created:")
        print("   - user")
        print("   - content") 
        print("   - vote")
        print("   - badge_nft")
        
    except Exception as e:
        print(f"❌ Error during creation: {e}")
        print("💡 Check that PostgreSQL is started and the database exists")
        raise

if __name__ == "__main__":
    create_database()

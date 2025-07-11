from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import users, content, vote, nft, leaderboard

app = FastAPI(
    title="Fan Platform API",
    description="API pour plateforme de fans avec IA et NFT",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À ajuster en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(content.router, prefix="/api/v1/content", tags=["content"])
app.include_router(vote.router, prefix="/api/v1/vote", tags=["vote"])
app.include_router(nft.router, prefix="/api/v1/nft", tags=["nft"])
app.include_router(leaderboard.router, prefix="/api/v1/leaderboard", tags=["leaderboard"])

@app.get("/")
async def root():
    return {"message": "Fan Platform API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

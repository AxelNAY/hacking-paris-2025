# Fan Platform Backend

API backend pour plateforme de fans avec IA et NFT.

## Fonctionnalités

- 🔐 Authentification JWT
- 🎨 Génération de contenu IA (OpenAI)
- 🗳️ Système de vote avec Fan Tokens
- 🏆 NFT badges et classements
- 📱 API REST complète

## Installation

```bash
# Cloner le projet
git clone <repo-url>
cd backend

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Lancer l'application
uvicorn app.main:app --reload
```

## Structure

- `app/core/` - Configuration et sécurité
- `app/db/` - Base de données et modèles
- `app/api/` - Routes API
- `app/services/` - Services métiers
- `app/utils/` - Utilitaires
- `app/tests/` - Tests unitaires

## API Endpoints

- `/api/v1/users/` - Gestion utilisateurs
- `/api/v1/content/` - Création contenu
- `/api/v1/vote/` - Système de vote
- `/api/v1/nft/` - Badges NFT
- `/api/v1/leaderboard/` - Classements

## Tests

```bash
pytest app/tests/
```
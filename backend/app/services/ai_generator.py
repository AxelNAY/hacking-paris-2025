import openai
from typing import Union
from app.core.config import settings
from app.db.schemas import ContentType, ContentDescription

openai.api_key = settings.OPENAI_API_KEY

async def generate_content(prompt: str, content_type: ContentType, description: ContentDescription) -> Union[str, bytes]:
    """Génère du contenu avec l'IA selon le type et la description"""
    
    # Prompts spécialisés selon la description
    specialized_prompts = {
        ContentDescription.logo: f"Créer un logo moderne et professionnel pour: {prompt}",
        ContentDescription.slogan: f"Créer un slogan accrocheur et mémorable pour: {prompt}",
        ContentDescription.tiffo: f"Créer un design de tifo (bannière de supporters) pour: {prompt}",
        ContentDescription.vetement: f"Créer un design de vêtement/textile pour: {prompt}",
        ContentDescription.lyrics: f"Écrire des paroles inspirantes et rythmées pour: {prompt}",
        ContentDescription.musique: f"Créer une mélodie ou composition musicale pour: {prompt}",
    }
    
    enhanced_prompt = specialized_prompts.get(description, prompt)
    
    try:
        if content_type == ContentType.image:
            return await generate_image(enhanced_prompt)
        elif content_type == ContentType.text:
            return await generate_text(enhanced_prompt)
        elif content_type == ContentType.audio:
            return await generate_audio(enhanced_prompt)
        else:
            raise ValueError(f"Type de contenu non supporté: {content_type}")
            
    except Exception as e:
        raise Exception(f"Erreur lors de la génération IA: {str(e)}")

async def generate_image(prompt: str) -> str:
    """Génère une image avec DALL-E"""
    try:
        response = openai.Image.create(
            prompt=prompt,
            n=1,
            size="1024x1024",
            response_format="url"
        )
        return response['data'][0]['url']
    except Exception as e:
        raise Exception(f"Erreur DALL-E: {str(e)}")

async def generate_text(prompt: str) -> str:
    """Génère du texte avec GPT"""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Tu es un créateur de contenu créatif et inspirant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"Erreur GPT: {str(e)}")

async def generate_audio(prompt: str) -> str:
    """Génère de l'audio (placeholder - à adapter selon votre service audio)"""
    # Ici vous pourriez utiliser des services comme:
    # - ElevenLabs pour la synthèse vocale
    # - Mubert pour la génération musicale
    # - Ou d'autres APIs audio
    
    # Pour l'instant, on retourne un placeholder
    return f"Audio généré pour: {prompt}"
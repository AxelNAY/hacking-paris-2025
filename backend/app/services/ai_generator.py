import openai
from typing import Union
from app.core.config import settings
from app.db.schemas import ContentType, ContentDescription

openai.api_key = settings.OPENAI_API_KEY

async def generate_content(prompt: str, content_type: ContentType, description: ContentDescription) -> Union[str, bytes]:
    """Generate content with AI according to type and description"""
    
    # Specialized prompts according to description
    specialized_prompts = {
        ContentDescription.logo: f"Create a modern and professional logo for: {prompt}",
        ContentDescription.slogan: f"Create a catchy and memorable slogan for: {prompt}",
        ContentDescription.tiffo: f"Create a tifo design (supporters banner) for: {prompt}",
        ContentDescription.vetement: f"Create a clothing/textile design for: {prompt}",
        ContentDescription.lyrics: f"Write inspiring and rhythmic lyrics for: {prompt}",
        ContentDescription.musique: f"Create a melody or musical composition for: {prompt}",
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
            raise ValueError(f"Unsupported content type: {content_type}")
            
    except Exception as e:
        raise Exception(f"Error during AI generation: {str(e)}")

async def generate_image(prompt: str) -> str:
    """Generate an image with DALL-E"""
    try:
        response = openai.Image.create(
            prompt=prompt,
            n=1,
            size="1024x1024",
            response_format="url"
        )
        return response['data'][0]['url']
    except Exception as e:
        raise Exception(f"DALL-E error: {str(e)}")

async def generate_text(prompt: str) -> str:
    """Generate text with GPT"""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a creative and inspiring content creator."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"GPT error: {str(e)}")

async def generate_audio(prompt: str) -> str:
    """Generate audio (placeholder - adapt according to your audio service)"""
    # Here you could use services like:
    # - ElevenLabs for speech synthesis
    # - Mubert for musical generation
    # - Or other audio APIs
    
    # For now, we return a placeholder
    return f"Audio generated for: {prompt}"

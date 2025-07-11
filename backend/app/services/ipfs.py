import ipfshttpclient
import json
import tempfile
import os
from typing import Union
from app.core.config import settings

class IPFSService:
    def __init__(self):
        self.client = ipfshttpclient.connect(settings.IPFS_API_URL)
    
    async def upload_to_ipfs(self, content: Union[str, bytes], content_type: str = "text") -> str:
        """Upload du contenu sur IPFS et retourne l'URL"""
        try:
            if content_type == "text":
                # Pour le texte, on crée un fichier JSON
                content_data = {
                    "content": content,
                    "type": "text",
                    "timestamp": str(datetime.utcnow())
                }
                
                with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                    json.dump(content_data, f)
                    temp_file = f.name
                
                result = self.client.add(temp_file)
                os.unlink(temp_file)
                
            elif content_type == "image":
                # Pour les images, on télécharge d'abord depuis l'URL
                import requests
                response = requests.get(content)
                
                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
                    f.write(response.content)
                    temp_file = f.name
                
                result = self.client.add(temp_file)
                os.unlink(temp_file)
                
            elif content_type == "audio":
                # Pour l'audio, traitement similaire aux images
                # À adapter selon votre format audio
                content_data = {
                    "content": content,
                    "type": "audio",
                    "timestamp": str(datetime.utcnow())
                }
                
                with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                    json.dump(content_data, f)
                    temp_file = f.name
                
                result = self.client.add(temp_file)
                os.unlink(temp_file)
            
            # Retourner l'URL IPFS
            ipfs_hash = result['Hash']
            return f"{settings.IPFS_GATEWAY_URL}/ipfs/{ipfs_hash}"
            
        except Exception as e:
            raise Exception(f"Erreur upload IPFS: {str(e)}")
    
    async def get_from_ipfs(self, ipfs_hash: str) -> bytes:
        """Récupérer du contenu depuis IPFS"""
        try:
            return self.client.cat(ipfs_hash)
        except Exception as e:
            raise Exception(f"Erreur récupération IPFS: {str(e)}")

# Instance globale
ipfs_service = IPFSService()

async def upload_to_ipfs(content: Union[str, bytes], content_type: str = "text") -> str:
    """Fonction helper pour l'upload IPFS"""
    return await ipfs_service.upload_to_ipfs(content, content_type)
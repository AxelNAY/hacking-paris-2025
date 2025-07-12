from datetime import datetime
import ipfshttpclient
import json
import tempfile
import os
from typing import Union
from app.core.config import settings

class IPFSService:
    def __init__(self):
        try:
            # Try to connect with the settings URL
            self.client = ipfshttpclient.connect(settings.IPFS_API_URL)
        except Exception as e:
            print(f"IPFS connection error with {settings.IPFS_API_URL}: {e}")
            try:
                # Fallback to default connection
                self.client = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001/http')
                print("Successful IPFS connection with default address")
            except Exception as e2:
                print(f"Default IPFS connection error: {e2}")
                # Fallback to connection without parameters
                self.client = ipfshttpclient.connect()
                print("Successful IPFS connection without parameters")
    
    async def upload_to_ipfs(self, content: Union[str, bytes], content_type: str = "text") -> str:
        """Upload content to IPFS and return the URL"""
        try:
            if content_type == "text":
                # For text, create a JSON file
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
                # For images, first download from the URL
                import requests
                response = requests.get(content)
                
                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
                    f.write(response.content)
                    temp_file = f.name
                
                result = self.client.add(temp_file)
                os.unlink(temp_file)
                
            elif content_type == "audio":
                # For audio, similar processing to images
                # Adapt according to your audio format
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
            
            # Return the IPFS URL
            ipfs_hash = result['Hash']
            return f"{settings.IPFS_GATEWAY_URL}/ipfs/{ipfs_hash}"
            
        except Exception as e:
            raise Exception(f"IPFS upload error: {str(e)}")
    
    async def get_from_ipfs(self, ipfs_hash: str) -> bytes:
        """Retrieve content from IPFS"""
        try:
            return self.client.cat(ipfs_hash)
        except Exception as e:
            raise Exception(f"IPFS retrieval error: {str(e)}")

# Global instance
ipfs_service = IPFSService()

async def upload_to_ipfs(content: Union[str, bytes], content_type: str = "text") -> str:
    """Helper function for IPFS upload"""
    return await ipfs_service.upload_to_ipfs(content, content_type)

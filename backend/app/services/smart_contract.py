import time
from web3 import Web3
from typing import Optional
from app.core.config import settings
import json

class SmartContractService:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER_URL))
        self.account = self.w3.eth.account.from_key(settings.PRIVATE_KEY)
        
        # ABI du contrat (à adapter selon votre smart contract)
        self.contract_abi = [
            {
                "inputs": [
                    {"name": "contentId", "type": "uint256"},
                    {"name": "amount", "type": "uint256"},
                    {"name": "creator", "type": "address"}
                ],
                "name": "vote",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"name": "to", "type": "address"},
                    {"name": "tokenId", "type": "uint256"},
                    {"name": "metadataUri", "type": "string"}
                ],
                "name": "mintBadge",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
        
        self.contract = self.w3.eth.contract(
            address=settings.CONTRACT_ADDRESS,
            abi=self.contract_abi
        )
    
    async def execute_vote_transaction(self, voter_address: str, content_id: int, amount: float) -> str:
        """Exécuter une transaction de vote sur la blockchain"""
        try:
            # Convertir le montant en wei (si nécessaire)
            amount_wei = self.w3.to_wei(amount, 'ether')
            
            # Construire la transaction
            transaction = self.contract.functions.vote(
                content_id,
                amount_wei,
                voter_address
            ).build_transaction({
                'from': self.account.address,
                'gas': 200000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
            })
            
            # Signer la transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, settings.PRIVATE_KEY)
            
            # Envoyer la transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Attendre la confirmation
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return receipt.transactionHash.hex()
            
        except Exception as e:
            raise Exception(f"Erreur transaction blockchain: {str(e)}")
    
    async def mint_badge_nft(self, user_address: str, metadata_uri: str) -> tuple[str, str]:
        """Mint un badge NFT pour un utilisateur"""
        try:
            # Générer un token ID unique
            token_id = int(time.time() * 1000)  # Timestamp en millisecondes
            
            # Construire la transaction de mint
            transaction = self.contract.functions.mintBadge(
                user_address,
                token_id,
                metadata_uri
            ).build_transaction({
                'from': self.account.address,
                'gas': 300000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
            })
            
            # Signer et envoyer
            signed_txn = self.w3.eth.account.sign_transaction(transaction, settings.PRIVATE_KEY)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return str(token_id), receipt.transactionHash.hex()
            
        except Exception as e:
            raise Exception(f"Erreur mint NFT: {str(e)}")

# Instance globale
smart_contract_service = SmartContractService()

async def execute_vote_transaction(voter_address: str, content_id: int, amount: float) -> str:
    """Fonction helper pour le vote"""
    return await smart_contract_service.execute_vote_transaction(voter_address, content_id, amount)

async def mint_badge_nft(user_address: str, metadata_uri: str) -> tuple[str, str]:
    """Fonction helper pour le mint NFT"""
    return await smart_contract_service.mint_badge_nft(user_address, metadata_uri)
import time
from web3 import Web3
from typing import Optional
from app.core.config import settings
import json

class SmartContractService:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER_URL))
        self.account = self.w3.eth.account.from_key(settings.PRIVATE_KEY)
        
        # Contract ABI (adapt according to your smart contract)
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
        """Execute a vote transaction on the blockchain"""
        try:
            # Convert amount to wei (if necessary)
            amount_wei = self.w3.to_wei(amount, 'ether')
            
            # Build the transaction
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
            
            # Sign the transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, settings.PRIVATE_KEY)
            
            # Send the transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for confirmation
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return receipt.transactionHash.hex()
            
        except Exception as e:
            raise Exception(f"Blockchain transaction error: {str(e)}")
    
    async def mint_badge_nft(self, user_address: str, metadata_uri: str) -> tuple[str, str]:
        """Mint a badge NFT for a user"""
        try:
            # Generate a unique token ID
            token_id = int(time.time() * 1000)  # Timestamp in milliseconds
            
            # Build the mint transaction
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
            
            # Sign and send
            signed_txn = self.w3.eth.account.sign_transaction(transaction, settings.PRIVATE_KEY)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return str(token_id), receipt.transactionHash.hex()
            
        except Exception as e:
            raise Exception(f"NFT mint error: {str(e)}")

# Global instance
smart_contract_service = SmartContractService()

async def execute_vote_transaction(voter_address: str, content_id: int, amount: float) -> str:
    """Helper function for voting"""
    return await smart_contract_service.execute_vote_transaction(voter_address, content_id, amount)

async def mint_badge_nft(user_address: str, metadata_uri: str) -> tuple[str, str]:
    """Helper function for NFT minting"""
    return await smart_contract_service.mint_badge_nft(user_address, metadata_uri)

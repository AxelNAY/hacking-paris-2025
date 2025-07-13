import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Wallet, Shield, Zap, Gift, AlertCircle, CheckCircle } from "lucide-react";

export function WalletConnectionModal({
  open,
  onOpenChange,
  onConnect,
  title = "Connect Your Wallet",
  description = "Connect your wallet to unlock all ChillFan features and start earning rewards.",
}) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const detectMetaMask = () => {
    return typeof window !== "undefined" && window.ethereum && window.ethereum.isMetaMask;
  };

  const handleMetaMaskConnect = async () => {
    if (!detectMetaMask()) {
      setError("MetaMask is not installed. Please install MetaMask extension.");
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      // Demander l'autorisation de se connecter
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        
        // Vérifier qu'on est sur le bon réseau (Chiliz Chain)
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const chilizChainId = '0x15B32'; // 88882 en hexadécimal (Chiliz Chain)
        
        if (chainId !== chilizChainId) {
          try {
            // Essayer de changer vers Chiliz Chain
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: chilizChainId }],
            });
          } catch (switchError) {
            // Si le réseau n'existe pas, l'ajouter
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: chilizChainId,
                  chainName: 'Chiliz Chain',
                  nativeCurrency: {
                    name: 'CHZ',
                    symbol: 'CHZ',
                    decimals: 18
                  },
                  rpcUrls: ['https://rpc.chiliz.com'],
                  blockExplorerUrls: ['https://scan.chiliz.com']
                }]
              });
            } else {
              throw switchError;
            }
          }
        }

        // Appeler la fonction de connexion du parent
        onConnect(address);
        onOpenChange(false);
        
        // Écouter les changements de compte
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            // L'utilisateur a déconnecté son wallet
            onConnect(null);
          } else {
            // L'utilisateur a changé de compte
            onConnect(accounts[0]);
          }
        });

        // Écouter les changements de réseau
        window.ethereum.on('chainChanged', (chainId) => {
          // Recharger la page si le réseau change
          window.location.reload();
        });

      }
    } catch (err) {
      console.error('Erreur de connexion MetaMask:', err);
      setError(err.message || "Failed to connect to MetaMask");
    } finally {
      setConnecting(false);
    }
  };

  const benefits = [
    {
      icon: <Gift className="w-5 h-5 text-chiliz-red" />,
      title: "Earn $CHZ Rewards",
      description: "Get rewarded for popular content",
    },
    {
      icon: <Wallet className="w-5 h-5 text-chiliz-red" />,
      title: "Vote with Fan Tokens",
      description: "Use $PSG, $BAR and other fan tokens",
    },
    {
      icon: <Shield className="w-5 h-5 text-chiliz-red" />,
      title: "Secure & Safe",
      description: "Protected by blockchain technology",
    },
    {
      icon: <Zap className="w-5 h-5 text-chiliz-red" />,
      title: "Instant Access",
      description: "Start creating and voting immediately",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-chiliz-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-chiliz-red" />
          </div>
          <DialogTitle className="text-2xl font-bold text-chiliz-black">
            {title}
          </DialogTitle>
          <DialogDescription className="text-chiliz-gray-600 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-chiliz-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0 mt-0.5">{benefit.icon}</div>
              <div>
                <h4 className="font-medium text-chiliz-black text-sm">
                  {benefit.title}
                </h4>
                <p className="text-xs text-chiliz-gray-600 mt-1">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {detectMetaMask() ? (
            <Button
              onClick={handleMetaMaskConnect}
              disabled={connecting}
              className="w-full bg-chiliz-red hover:bg-chiliz-red-hover text-white py-3 shadow-lg hover:shadow-xl transition-all"
            >
              {connecting ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <img 
                    src="https://cdn.iconscout.com/icon/free/png-256/metamask-2728406-2261817.png" 
                    alt="MetaMask" 
                    className="w-4 h-4 mr-2"
                  />
                  Connect with MetaMask
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={() => window.open('https://metamask.io/download/', '_blank')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 shadow-lg hover:shadow-xl transition-all"
              >
                <img 
                  src="https://cdn.iconscout.com/icon/free/png-256/metamask-2728406-2261817.png" 
                  alt="MetaMask" 
                  className="w-4 h-4 mr-2"
                />
                Install MetaMask
              </Button>
              <p className="text-xs text-chiliz-gray-500 text-center">
                MetaMask extension is required to connect your wallet
              </p>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full border-chiliz-gray-300 text-chiliz-gray-700 hover:bg-chiliz-gray-50"
          >
            Maybe Later
          </Button>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-chiliz-gray-200">
          <div className="flex items-center gap-1 text-xs text-chiliz-gray-500">
            <CheckCircle className="w-3 h-3" />
            <span>No fees to connect</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-chiliz-gray-500">
            <CheckCircle className="w-3 h-3" />
            <span>Instant setup</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-chiliz-gray-500">
            <CheckCircle className="w-3 h-3" />
            <span>Powered by Chiliz</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
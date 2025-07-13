import { useState, useEffect, useCallback } from "react";

// Exemple d'URL backend, adapte à la tienne
const API_BASE = "https://localhost:8000/";

export function useWallet() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [selectedClub, setSelectedClub] = useState("psg");
  const [teamBalances, setTeamBalances] = useState({});
  const [chzBalance, setChzBalance] = useState(0);

  // Connexion wallet + appel backend pour récupérer les données utilisateur
  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      setWalletAddress(address);

      // Appel backend pour login/auth avec wallet
      const resLogin = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (!resLogin.ok) throw new Error("Login failed");

      // Récupérer balances depuis backend
      const resBalances = await fetch(`${API_BASE}/users/${address}/balances`);
      if (!resBalances.ok) throw new Error("Failed to get balances");
      const data = await resBalances.json();

      setTeamBalances(data.teamBalances || {});
      setChzBalance(data.chzBalance || 0);
      setIsWalletConnected(true);
    } catch (err) {
      console.error(err);
      alert("Wallet connection failed");
      setIsWalletConnected(false);
      setWalletAddress(null);
      setTeamBalances({});
      setChzBalance(0);
    }
  }, []);

  // Déconnexion simple
  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setIsWalletConnected(false);
    setTeamBalances({});
    setChzBalance(0);
  }, []);

  // Gérer changement de compte MetaMask
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // Déconnexion si aucun compte
        disconnectWallet();
      } else {
        // Se reconnecter avec nouveau compte
        connectWallet();
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [connectWallet, disconnectWallet]);

  return {
    walletAddress,
    isWalletConnected,
    connectWallet,
    disconnectWallet,
    selectedClub,
    setSelectedClub,
    teamBalances,
    chzBalance,
  };
}

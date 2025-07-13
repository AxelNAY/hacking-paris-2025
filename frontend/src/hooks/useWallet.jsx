import { useState, useEffect, useCallback } from "react";

// Backend base URL (HTTP, not HTTPS)
const API_BASE = "http://localhost:8000"; 

export function useWallet() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [selectedClub, setSelectedClub] = useState("psg");
  const [teamBalances, setTeamBalances] = useState({});
  const [chzBalance, setChzBalance] = useState(0);

  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      // Request wallet connection
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      console.log(accounts);
      const address = accounts[0];
      setWalletAddress(address);
      console.log("Hello");

      // 🔐 Login via backend
      const resLogin = await fetch(`${API_BASE}/api/auth/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });
      console.log("World");

      if (!resLogin.ok) {
        const errText = await resLogin.text();
        throw new Error(`Login failed: ${errText}`);
      }

      // 📊 Fetch balances
      const resBalances = await fetch(`${API_BASE}/users/${address}/balances`);
      if (!resBalances.ok) {
        const errText = await resBalances.text();
        throw new Error(`Failed to fetch balances: ${errText}`);
      }

      const data = await resBalances.json();
      setTeamBalances(data.teamBalances || {});
      setChzBalance(data.chzBalance || 0);
      setIsWalletConnected(true);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      alert("Wallet connection failed: " + err.message);
      setIsWalletConnected(false);
      setWalletAddress(null);
      setTeamBalances({});
      setChzBalance(0);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setIsWalletConnected(false);
    setTeamBalances({});
    setChzBalance(0);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
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

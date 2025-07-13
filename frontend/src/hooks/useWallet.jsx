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

      // Generate signature for authentication
      const message = "Sign this message to authenticate";
      let signature;
      
      try {
        signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, address],
        });
      } catch (signError) {
        console.error("Signature failed:", signError);
        throw new Error("User rejected signature request");
      }

      // 🔐 Login via backend - CORRECT URL for Solution 1
      const resLogin = await fetch(`${API_BASE}/api/v1/users/auth/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          wallet_address: address,
          message: message,
          signature: signature
        }),
      });
      console.log("World");

      if (!resLogin.ok) {
        const errText = await resLogin.text();
        throw new Error(`Login failed: ${errText}`);
      }

      const loginData = await resLogin.json();
      console.log("Login successful:", loginData);

      // Store the access token if needed
      if (loginData.access_token) {
        localStorage.setItem('access_token', loginData.access_token);
        console.log(access_token);
      }

      // 📊 Fetch balances - CORRECT URL for Solution 1
      const resBalances = await fetch(`${API_BASE}/api/v1/users/${address}/balances`);
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
    localStorage.removeItem('access_token');
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
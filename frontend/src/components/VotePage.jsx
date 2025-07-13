import React, { useEffect, useState } from "react";
import { Heart, Wallet } from "lucide-react";

export default function VotePage({ isWalletConnected, selectedClub, onConnectWallet }) {
  const [creations, setCreations] = useState([]);
  const [teamBalances, setTeamBalances] = useState({});
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const teams = [
    { id: 'psg', name: 'PSG', token: '$PSG', color: 'blue', country: '🇫🇷' },
    { id: 'bar', name: 'Barcelona', token: '$BAR', color: 'red', country: '🇪🇸' },
    { id: 'juv', name: 'Juventus', token: '$JUV', color: 'black', country: '🇮🇹' },
    { id: 'city', name: 'Man City', token: '$CITY', color: 'skyblue', country: '🏴' },
    { id: 'real', name: 'Real Madrid', token: '$REAL', color: 'white', country: '🇪🇸' },
    { id: 'afc', name: 'Arsenal', token: '$AFC', color: 'darkred', country: '🏴' },
    { id: 'atm', name: 'Atletico Madrid', token: '$ATM', color: 'darkblue', country: '🇪🇸' }
  ];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const creationsRes = await fetch("/api/creations");
        const balancesRes = await fetch("/api/balances");

        if (!creationsRes.ok || !balancesRes.ok) {
          throw new Error("API error");
        }

        const creationsData = await creationsRes.json();
        const balancesData = await balancesRes.json();

        setCreations(creationsData);
        setTeamBalances(balancesData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedClub]);

  const handleVote = async (creationId, club) => {
    if (!isWalletConnected) {
      onConnectWallet();
      return;
    }

    if (!teamBalances[club] || teamBalances[club] <= 0) {
      alert(`You don't have enough tokens to vote for ${club}`);
      return;
    }

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ creationId, club })
      });

      if (!res.ok) throw new Error("Vote failed");

      setCreations(prev =>
        prev.map(c =>
          c.id === creationId ? { ...c, votes: c.votes + 1, hasVoted: true } : c
        )
      );

      setTeamBalances(prev => ({
        ...prev,
        [club]: prev[club] - 1
      }));

      alert("Vote recorded!");
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredCreations = creations.filter(c => {
    if (filter === "all") return true;
    if (filter === "club") return c.club === selectedClub;
    return c.category === filter;
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="vote-page">
      <h1>Vote for the Best Creations</h1>

      {!isWalletConnected ? (
        <div className="connect-wallet">
          <p>You need to connect your wallet to vote.</p>
          <button onClick={onConnectWallet}>
            <Wallet size={16} /> Connect Wallet
          </button>
        </div>
      ) : (
        <div className="balances">
          <h3>Your Token Balances</h3>
          <div className="badges">
            {teams.map(team => (
              <span key={team.id} style={{ backgroundColor: team.color, color: "#fff", margin: "4px", padding: "4px 8px", borderRadius: "4px" }}>
                {team.token}: {teamBalances[team.id] || 0}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="filters">
        <label>Filter: </label>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="club">Only {selectedClub}</option>
          <option value="logo">Logo</option>
          <option value="slogan">Slogan</option>
          <option value="tiffo">Tifo</option>
          <option value="vetement">Apparel</option>
          <option value="lyrics">Lyrics</option>
          <option value="musique">Music</option>
        </select>
      </div>

      <div className="creations-list">
        {filteredCreations.map(creation => (
          <div key={creation.id} className="creation-card">
            <p><strong>{creation.category.toUpperCase()}</strong>: {creation.content}</p>
            <p>By: {creation.author.first_name} {creation.author.last_name}</p>
            <p>Votes: {creation.votes}</p>
            <button
              onClick={() => handleVote(creation.id, creation.club)}
              disabled={!isWalletConnected || creation.hasVoted}
            >
              <Heart size={14} /> {creation.hasVoted ? "Voted" : "Vote"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

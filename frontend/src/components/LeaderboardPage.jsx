import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Trophy, Crown, Award, Medal } from "lucide-react";

const API_BASE = "https://localhost:8000/";

export function LeaderboardPage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Static teams info (tu peux adapter / récupérer côté backend si tu veux)
  const teams = [
    { id: 'psg', name: 'PSG', color: 'bg-blue-600', country: '🇫🇷' },
    { id: 'bar', name: 'Barcelona', color: 'bg-red-600', country: '🇪🇸' },
    { id: 'juv', name: 'Juventus', color: 'bg-black', country: '🇮🇹' },
    { id: 'city', name: 'Man City', color: 'bg-sky-500', country: '🏴' },
    { id: 'real', name: 'Real Madrid', color: 'bg-white border border-gray-300', country: '🇪🇸' },
    { id: 'afc', name: 'Arsenal', color: 'bg-red-500', country: '🏴' },
    { id: 'atm', name: 'Atletico Madrid', color: 'bg-red-700', country: '🇪🇸' }
  ];

  useEffect(() => {
    async function fetchCreators() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/v1/creators?page=1&per_page=10`); // adapte l'URL selon ta config
        if (!response.ok) throw new Error("Erreur lors du chargement des données");
        const data = await response.json();

        // Transforme les données backend vers la structure utilisée dans UI
        // Exemple minimaliste (ajuste selon les champs backend)
        const formattedCreators = data.entries.map(entry => ({
          rank: entry.rank,
          user: {
            id: entry.user.id,
            wallet_address: entry.user.wallet_address,
            first_name: entry.user.first_name,
            last_name: entry.user.last_name,
            country: entry.user.country || "Unknown",
            avatar_url: entry.user.avatar_url || "https://via.placeholder.com/100"
          },
          totalCreations: entry.content_count,
          totalVotes: entry.total_votes,
          chzEarned: entry.total_fan_tokens,
          nftBadges: entry.user.nft_badges || [],  // Si tu as ce champ, sinon vide
          club: entry.user.club || "psg", // Si tu as un club côté user sinon valeur par défaut
          level: entry.user.level || "Beginner"  // Pareil
        }));

        setCreators(formattedCreators);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchCreators();
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Award className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center font-bold text-chiliz-gray-600">{rank}</span>;
    }
  };

  const getTeamInfo = (clubId) => {
    return teams.find(team => team.id === clubId) || teams[0];
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "Legend": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Expert": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Advanced": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Intermediate": return "bg-green-100 text-green-800 border-green-200";
      case "Beginner": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-chiliz-gray-100 text-chiliz-gray-800 border-chiliz-gray-200";
    }
  };

  const getCountryFlag = (country) => {
    const flags = {
      "France": "🇫🇷",
      "Spain": "🇪🇸", 
      "Italy": "🇮🇹",
      "UK": "🇬🇧",
      "Brazil": "🇧🇷",
      "Egypt": "🇪🇬"
    };
    return flags[country] || "🌍";
  };

  if (loading) return <p>Chargement du classement...</p>;
  if (error) return <p>Erreur: {error}</p>;

  return (
    <div className="min-h-screen bg-chiliz-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-chiliz-black mb-4">
            Creator Leaderboard
          </h1>
          <p className="text-lg text-chiliz-gray-600">
            Discover the most creative fans across all clubs and their rewards
          </p>
        </div>

        {/* Podium des 3 premiers */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {creators.slice(0, 3).map((creator, index) => {
            const teamInfo = getTeamInfo(creator.club);
            return (
              <Card key={creator.user.id} className={`relative overflow-hidden border-chiliz-gray-200 ${index === 0 ? 'md:order-2 border-chiliz-red bg-gradient-to-br from-chiliz-red/5 to-orange-50' : index === 1 ? 'md:order-1' : 'md:order-3'}`}>
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {getRankIcon(creator.rank)}
                  </div>

                  <Avatar className="w-20 h-20 mx-auto mb-4 border-2 border-chiliz-gray-200">
                    <AvatarImage src={creator.user.avatar_url} alt={`${creator.user.first_name} ${creator.user.last_name}`} />
                    <AvatarFallback className="text-lg bg-chiliz-gray-100 text-chiliz-gray-700">
                      {creator.user.first_name[0]}{creator.user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="mb-4">
                    <h3 className="font-bold text-chiliz-black mb-1">
                      {creator.user.first_name} {creator.user.last_name}
                    </h3>
                    <p className="text-sm text-chiliz-gray-500 mb-2">
                      {getCountryFlag(creator.user.country)} {creator.user.country}
                    </p>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-lg">{teamInfo.country}</span>
                      <div className={`w-3 h-3 rounded-full ${teamInfo.color}`}></div>
                      <span className="text-sm text-chiliz-gray-600">{teamInfo.name}</span>
                    </div>
                    <Badge className={getLevelColor(creator.level)}>
                      {creator.level}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-2xl font-bold text-chiliz-red">{creator.totalVotes.toLocaleString()}</p>
                      <p className="text-sm text-chiliz-gray-600">Votes received</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-chiliz-red">{creator.chzEarned}</p>
                      <p className="text-sm text-chiliz-gray-600">$CHZ earned</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-chiliz-gray-700">NFT Badges ({creator.nftBadges.length})</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {creator.nftBadges.slice(0, 2).map((badge, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-chiliz-gray-300 text-chiliz-gray-600">
                          {badge}
                        </Badge>
                      ))}
                      {creator.nftBadges.length > 2 && (
                        <Badge variant="outline" className="text-xs border-chiliz-gray-300 text-chiliz-gray-600">
                          +{creator.nftBadges.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tableau complet */}
        <Card className="border-chiliz-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-chiliz-red" />
              Complete Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-chiliz-gray-200">
                  <TableHead className="w-20">Rank</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Club</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-center">Creations</TableHead>
                  <TableHead className="text-center">Total Votes</TableHead>
                  <TableHead className="text-center">$CHZ Earned</TableHead>
                  <TableHead>NFT Badges</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creators.map((creator) => {
                  const teamInfo = getTeamInfo(creator.club);
                  return (
                    <TableRow key={creator.user.id}>
                      <TableCell>{getRankIcon(creator.rank)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8 border border-chiliz-gray-300">
                            <AvatarImage src={creator.user.avatar_url} alt={`${creator.user.first_name} ${creator.user.last_name}`} />
                            <AvatarFallback>
                              {creator.user.first_name[0]}{creator.user.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>{creator.user.first_name} {creator.user.last_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getCountryFlag(creator.user.country)} {creator.user.country}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{teamInfo.country}</span>
                          <div className={`w-3 h-3 rounded-full ${teamInfo.color}`}></div>
                          <span>{teamInfo.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLevelColor(creator.level)}>{creator.level}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{creator.totalCreations}</TableCell>
                      <TableCell className="text-center">{creator.totalVotes.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{creator.chzEarned}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {creator.nftBadges.map((badge, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-chiliz-gray-300 text-chiliz-gray-600">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

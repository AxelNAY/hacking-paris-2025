import React from "react";
import { Button }from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { Badge } from "./ui/badge";
import { Wallet, Snowflake, ChevronDown } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

import psgLogo from "@/assets/logos/psg.png";
import barLogo from "@/assets/logos/bar.png";
import juvLogo from "@/assets/logos/juv.png";
import cityLogo from "@/assets/logos/city.png";
import realLogo from "@/assets/logos/real.png";
import afcLogo from "@/assets/logos/afc.png";
import atmLogo from "@/assets/logos/atm.png";

export function Header({ 
  onConnectWallet, 
  isWalletConnected, 
  walletAddress, 
  selectedClub, 
  onClubChange,
  teamBalances,
  chzBalance 
}) {
  
  const teams = [
    { id: 'psg', name: 'PSG', token: '$PSG', logo: psgLogo, fallbackColor: 'bg-blue-600', country: '🇫🇷' },
    { id: 'bar', name: 'Barcelona', token: '$BAR', logo: barLogo, fallbackColor: 'bg-red-600', country: '🇪🇸' },
    { id: 'juv', name: 'Juventus', token: '$JUV', logo: juvLogo, fallbackColor: 'bg-black', country: '🇮🇹' },
    { id: 'city', name: 'Man City', token: '$CITY', logo: cityLogo, fallbackColor: 'bg-sky-500', country: 'EN' },
    { id: 'real', name: 'Real Madrid', token: '$REAL', logo: realLogo, fallbackColor: 'bg-white border border-gray-300', country: '🇪🇸' },
    { id: 'afc', name: 'Arsenal', token: '$AFC', logo: afcLogo, fallbackColor: 'bg-red-500', country: 'EN' },
    { id: 'atm', name: 'Atletico Madrid', token: '$ATM', logo: atmLogo, fallbackColor: 'bg-red-700', country: '🇪🇸' },
  ];

  const currentTeam = teams.find(team => team.id === selectedClub);
  const currentBalance = teamBalances[selectedClub];

  return (
    <header className="w-full border-b bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-chiliz-red rounded-lg flex items-center justify-center shadow-md">
            <Snowflake className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-chiliz-black">ChillFan</h1>
            <p className="text-xs text-chiliz-gray-500">Powered by Chiliz</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Select value={selectedClub} onValueChange={onClubChange}>
              <SelectTrigger className="w-36 h-8 border-none bg-chiliz-gray-50 hover:bg-chiliz-gray-100 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs">{currentTeam?.country}</span>
                  <div className="w-4 h-4 rounded-full overflow-hidden bg-white shadow-sm">
                    <ImageWithFallback 
                      src={currentTeam?.logo || ''}
                      alt={`${currentTeam?.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium truncate">{currentTeam?.name}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-chiliz-gray-500" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{team.country}</span>
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-white shadow-sm">
                        <ImageWithFallback 
                          src={team.logo}
                          alt={`${team.name} logo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium">{team.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isWalletConnected && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-chiliz-gray-100 text-chiliz-gray-700 border-chiliz-gray-200 text-xs">
                {currentTeam?.token}: {currentBalance}
              </Badge>
              <Badge variant="secondary" className="bg-chiliz-red/10 text-chiliz-red border-chiliz-red/20 text-xs">
                $CHZ: {chzBalance}
              </Badge>
            </div>
          )}
          
          <Button
            onClick={onConnectWallet}
            variant={isWalletConnected ? "outline" : "default"}
            size="sm"
            className={
              isWalletConnected
                ? "border-chiliz-gray-300 text-chiliz-gray-700 hover:bg-chiliz-gray-50 hover:border-chiliz-red hover:text-chiliz-red"
                : "bg-chiliz-red hover:bg-chiliz-red-hover text-white shadow-md hover:shadow-lg transition-all"
            }
          >
            <Wallet className="w-4 h-4 mr-2" />
            {isWalletConnected 
              ? `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`
              : "Connect Wallet"
            }
          </Button>
        </div>
      </div>
    </header>
  );
}

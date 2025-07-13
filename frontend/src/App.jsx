import { useState } from "react";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { SubmitPage } from "./components/SubmitPage";
import  VotePage  from "./components/VotePage";
import { LeaderboardPage } from "./components/LeaderboardPage";
import { WalletConnectionModal } from "./components/WalletConnectionModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Home, PlusCircle, Vote, Trophy } from "lucide-react";

import { useWallet } from "./hooks/useWallet";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletModalContext, setWalletModalContext] = useState({});

  // Utilisation du hook wallet
  const {
    walletAddress,
    isWalletConnected,
    connectWallet,
    disconnectWallet,
    selectedClub,
    setSelectedClub,
    teamBalances,
    chzBalance,
  } = useWallet();

  const handleConnectWallet = () => {
    if (!isWalletConnected) {
      connectWallet();
      // Si besoin, exécuter onSuccess dans modal
      if (walletModalContext.onSuccess) {
        walletModalContext.onSuccess();
      }
    } else {
      disconnectWallet();
      // Si on était sur la page submit et on se déconnecte, revenir à home
      if (currentPage === "submit") {
        setCurrentPage("home");
      }
    }
  };

  const handleNavigate = (page) => {
    // Empêche la navigation vers submit si pas connecté
    if (page === "submit" && !isWalletConnected) {
      return;
    }
    setCurrentPage(page);
  };

  const handleClubChange = (club) => {
    setSelectedClub(club);
  };

  const openWalletModal = (context = {}) => {
    setWalletModalContext(context);
    setIsWalletModalOpen(true);
  };

  const handleSubmitContentClick = () => {
    if (!isWalletConnected) {
      openWalletModal({
        title: "Connect Wallet to Create Content",
        description: "You need to connect your wallet to submit and earn rewards from your creative content.",
        onSuccess: () => {
          setTimeout(() => {
            setCurrentPage("submit");
          }, 100);
        },
      });
      return;
    }
    setCurrentPage("submit");
  };

  const tabsCount = isWalletConnected ? 4 : 3;
  const gridCols = isWalletConnected ? "grid-cols-4" : "grid-cols-3";

  return (
    <div className="min-h-screen bg-chiliz-gray-50">
      <Header
        onConnectWallet={handleConnectWallet}
        isWalletConnected={isWalletConnected}
        walletAddress={walletAddress}
        selectedClub={selectedClub}
        onClubChange={handleClubChange}
        teamBalances={teamBalances}
        chzBalance={chzBalance}
      />

      <div className="w-full">
        <Tabs value={currentPage} onValueChange={handleNavigate} className="w-full">
          <div className="bg-white border-b border-chiliz-gray-200 px-6 shadow-sm">
            <div className="max-w-7xl mx-auto">
              <TabsList className={`grid w-full max-w-md ${gridCols} bg-chiliz-gray-100 p-1 rounded-lg`}>
                <TabsTrigger
                  value="home"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-chiliz-red data-[state=active]:shadow-sm transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </TabsTrigger>

                {isWalletConnected && (
                  <TabsTrigger
                    value="submit"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-chiliz-red data-[state=active]:shadow-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Create</span>
                  </TabsTrigger>
                )}

                <TabsTrigger
                  value="vote"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-chiliz-red data-[state=active]:shadow-sm transition-all"
                >
                  <Vote className="w-4 h-4" />
                  <span className="hidden sm:inline">Vote</span>
                </TabsTrigger>
                <TabsTrigger
                  value="leaderboard"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-chiliz-red data-[state=active]:shadow-sm transition-all"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Leaderboard</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="home" className="mt-0">
            <HomePage
              onNavigate={handleNavigate}
              isWalletConnected={isWalletConnected}
              onConnectWallet={handleConnectWallet}
              onSubmitContent={handleSubmitContentClick}
              onOpenWalletModal={openWalletModal}
            />
          </TabsContent>

          {isWalletConnected && (
            <TabsContent value="submit" className="mt-0">
              <SubmitPage isWalletConnected={isWalletConnected} selectedClub={selectedClub} />
            </TabsContent>
          )}

          <TabsContent value="vote" className="mt-0">
            <VotePage
              isWalletConnected={isWalletConnected}
              selectedClub={selectedClub}
              teamBalances={teamBalances}
              onConnectWallet={handleConnectWallet}
            />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-0">
            <LeaderboardPage />
          </TabsContent>
        </Tabs>
      </div>

      <WalletConnectionModal
        open={isWalletModalOpen}
        onOpenChange={setIsWalletModalOpen}
        onConnect={handleConnectWallet}
        title={walletModalContext.title}
        description={walletModalContext.description}
      />
    </div>
  );
}

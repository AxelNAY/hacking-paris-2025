import React from "react";
import Button from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Sparkles, Vote, Trophy, ArrowRight, Wand2, Image, Type,
  Flag, Shirt, Mic2, Music, Wallet, Shield, Zap
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function HomePage({
  onNavigate,
  isWalletConnected,
  onConnectWallet,
  onSubmitContent,
  onOpenWalletModal
}) {
  const handleGeneralWalletConnection = () => {
    if (!isWalletConnected) {
      onOpenWalletModal();
    }
  };

  const steps = [
    {
      icon: <Wand2 className="w-8 h-8 text-chiliz-red" />,
      title: "Create with AI",
      description: "Generate logos, slogans, tifos, apparel, lyrics, and music for your club",
      details: "Use our AI to create unique content across 6 categories or upload your own files"
    },
    {
      icon: <Vote className="w-8 h-8 text-chiliz-red" />,
      title: "Vote with Fan Tokens",
      description: "Use your $PSG or $BAR tokens to vote on community creations",
      details: "Every vote counts and determines the best creations from the community"
    },
    {
      icon: <Trophy className="w-8 h-8 text-chiliz-red" />,
      title: "Earn $CHZ + NFTs + Visibility",
      description: "Top-voted creators receive rewards",
      details: "$CHZ tokens, exclusive NFT badges, and platform spotlight"
    }
  ];

  const contentTypes = [
    {
      icon: <Image className="w-6 h-6 text-chiliz-red" />,
      title: "Logos",
      description: "Club emblems and symbols",
      example: "Modern PSG crest redesign"
    },
    {
      icon: <Type className="w-6 h-6 text-chiliz-red" />,
      title: "Slogans",
      description: "Motivational phrases",
      example: "\"This is Paris, the future belongs to us!\""
    },
    {
      icon: <Flag className="w-6 h-6 text-chiliz-red" />,
      title: "Tifos",
      description: "Stadium displays",
      example: "Giant Barcelona mosaic designs"
    },
    {
      icon: <Shirt className="w-6 h-6 text-chiliz-red" />,
      title: "Apparel",
      description: "Jerseys and fan clothing",
      example: "Futuristic jersey concepts"
    },
    {
      icon: <Mic2 className="w-6 h-6 text-chiliz-red" />,
      title: "Lyrics",
      description: "Fan songs and chants",
      example: "Victory anthem verses"
    },
    {
      icon: <Music className="w-6 h-6 text-chiliz-red" />,
      title: "Music",
      description: "Audio content",
      example: "AI-generated match entrance music"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-chiliz-gray-50 to-white">
      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-extrabold text-chiliz-black mb-6 leading-tight">
              Create with AI. <br />
              <span className="text-chiliz-red">Vote with Fan Tokens.</span>
            </h1>
            <p className="text-xl text-chiliz-gray-600 mb-8 max-w-2xl mx-auto">
              The first platform that rewards your fan creativity with tokens and NFTs. 
              Generate or upload unique content for your favorite club across 6 categories.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onSubmitContent}
                size="lg" 
                className="bg-chiliz-red hover:bg-chiliz-red-hover text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Submit Content
              </Button>

              {isWalletConnected ? (
                <Button 
                  onClick={() => onNavigate('vote')}
                  variant="outline" 
                  size="lg"
                  className="px-8 py-3 border-chiliz-red text-chiliz-red hover:bg-chiliz-red hover:text-white transition-all"
                >
                  Discover Creations
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleGeneralWalletConnection}
                  variant="outline" 
                  size="lg"
                  className="px-8 py-3 border-chiliz-red text-chiliz-red hover:bg-chiliz-red hover:text-white transition-all"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Categories */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-chiliz-black mb-4">
              6 Content Categories
            </h2>
            <p className="text-lg text-chiliz-gray-600 max-w-2xl mx-auto">
              Express your creativity across multiple formats - from visual designs to audio content
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentTypes.map((type, index) => (
              <Card 
                key={index} 
                className="border-2 border-chiliz-gray-200 hover:border-chiliz-red transition-all duration-300 hover:shadow-lg"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-chiliz-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {type.icon}
                  </div>

                  <h3 className="text-lg font-bold text-chiliz-black mb-2">
                    {type.title}
                  </h3>
                  <p className="text-chiliz-gray-600 mb-3">
                    {type.description}
                  </p>
                  <p className="text-sm text-chiliz-gray-500 italic">
                    Ex: {type.example}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isWalletConnected && (
            <Card className="mt-12 bg-gradient-to-r from-chiliz-red/5 to-chiliz-red/10 border-chiliz-red/20">
              <CardContent className="p-8 text-center">
                <div className="max-w-2xl mx-auto">
                  <Wallet className="w-12 h-12 text-chiliz-red mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-chiliz-black mb-4">
                    Ready to Start Creating?
                  </h3>
                  <p className="text-lg text-chiliz-gray-600 mb-6">
                    Connect your wallet to unlock all features and start earning $CHZ tokens for your creativity.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => onOpenWalletModal({
                        title: "Ready to Start Creating?",
                        description: "Connect your wallet to unlock content creation and start earning $CHZ tokens for your creativity."
                      })}
                      size="lg" 
                      className="bg-chiliz-red hover:bg-chiliz-red-hover text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all"
                    >
                      <Wallet className="w-5 h-5 mr-2" />
                      Connect Wallet
                    </Button>
                    <div className="flex items-center gap-4 text-sm text-chiliz-gray-500 mt-4 sm:mt-0">
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        <span>Secure</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        <span>Instant</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Process Timeline */}
      <section className="px-6 py-16 bg-chiliz-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-chiliz-black mb-4">
              How It Works
            </h2>
            <p className="text-lg text-chiliz-gray-600 max-w-2xl mx-auto">
              A simple 3-step process to turn your passion into rewards
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full border-2 border-chiliz-gray-200 hover:border-chiliz-red transition-all duration-300 hover:shadow-lg bg-white">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-chiliz-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      {step.icon}
                    </div>

                    <div className="mb-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-chiliz-red text-white rounded-full font-bold mb-4">
                        {index + 1}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-chiliz-black mb-4">
                      {step.title}
                    </h3>
                    <p className="text-chiliz-gray-600 mb-4">
                      {step.description}
                    </p>
                    <p className="text-sm text-chiliz-gray-500">
                      {step.details}
                    </p>
                  </CardContent>
                </Card>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-chiliz-red" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {!isWalletConnected && (
            <Card className="mt-12 bg-white border-chiliz-red/20 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-chiliz-red/10 rounded-full flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-chiliz-red" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-chiliz-gray-400" />
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-chiliz-black mb-4">
                    Start Your Creative Journey
                  </h3>
                  <p className="text-lg text-chiliz-gray-600 mb-6">
                    Join thousands of fans already earning rewards. Connect your wallet now!
                  </p>
                  <Button
                    onClick={() => onOpenWalletModal({
                      title: "Start Your Creative Journey",
                      description: "Join thousands of fans already earning rewards. Connect your wallet now!"
                    })}
                    size="lg"
                    className="bg-chiliz-red hover:bg-chiliz-red-hover text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}

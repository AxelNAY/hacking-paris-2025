import React from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Wallet, Shield, Zap, Gift } from "lucide-react";

export function WalletConnectionModal({
  open,
  onOpenChange,
  onConnect,
  title = "Connect Your Wallet",
  description = "Connect your wallet to unlock all ChillFan features and start earning rewards.",
}) {
  const handleConnect = () => {
    onConnect();
    onOpenChange(false);
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

        <div className="space-y-3">
          <Button
            onClick={handleConnect}
            className="w-full bg-chiliz-red hover:bg-chiliz-red-hover text-white py-3 shadow-lg hover:shadow-xl transition-all"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full border-chiliz-gray-300 text-chiliz-gray-700 hover:bg-chiliz-gray-50"
          >
            Maybe Later
          </Button>
        </div>

        <p className="text-xs text-chiliz-gray-500 text-center mt-4">
          No fees to connect • Instant setup • Powered by Chiliz
        </p>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from "react";
import axios from "axios";
import psgLogo from "@/assets/logos/psg.png";
import barLogo from "@/assets/logos/barcelona.png";
import juvLogo from "@/assets/logos/juventus.png";
import cityLogo from "@/assets/logos/manchester-city.png";
import realLogo from "@/assets/logos/real-madrid.png";
import afcLogo from "@/assets/logos/arsenal.png";
import atmLogo from "@/assets/logos/atletico-madrid.png";

import { 
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "./ui"; // adapte selon ton import

import {
  Wand2,
  Upload,
  Loader2,
  Image,
  Type,
  Music,
  FileImage,
  Shirt,
  Flag,
  Mic2
} from "lucide-react";

import { ImageWithFallback } from "./figma/ImageWithFallback";

import { create } from "ipfs-http-client";

const ipfsClient = create("https://ipfs.infura.io:5001/api/v0");

export function SubmitPage({ isWalletConnected, selectedClub }) {
  const [prompt, setPrompt] = useState("");
  const [contentCategory, setContentCategory] = useState("logo");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [customizations, setCustomizations] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadMethod, setUploadMethod] = useState("ai");

  // Liste clubs avec import logos
  const teams = [
    { id: "psg", name: "PSG", colors: "blue and red", logo: psgLogo },
    { id: "bar", name: "Barcelona", colors: "blue and red", logo: barLogo },
    { id: "juv", name: "Juventus", colors: "black and white", logo: juvLogo },
    { id: "city", name: "Manchester City", colors: "sky blue", logo: cityLogo },
    { id: "real", name: "Real Madrid", colors: "white and gold", logo: realLogo },
    { id: "afc", name: "Arsenal", colors: "red and white", logo: afcLogo },
    { id: "atm", name: "Atletico Madrid", colors: "red and white", logo: atmLogo }
  ];

  const currentTeam = teams.find((team) => team.id === selectedClub) || teams[0];

  const contentCategories = [
    { value: "logo", label: "Logo", icon: <Image className="w-4 h-4" />, description: "Club logos and emblems" },
    { value: "slogan", label: "Slogan", icon: <Type className="w-4 h-4" />, description: "Motivational phrases and chants" },
    { value: "tiffo", label: "Tifo", icon: <Flag className="w-4 h-4" />, description: "Stadium displays and banners" },
    { value: "vetement", label: "Apparel", icon: <Shirt className="w-4 h-4" />, description: "Jerseys and fan clothing" },
    { value: "lyrics", label: "Lyrics", icon: <Mic2 className="w-4 h-4" />, description: "Fan songs and chants" },
    { value: "musique", label: "Music", icon: <Music className="w-4 h-4" />, description: "Anthems and audio content" }
  ];

  // Get accepted file types for upload input
  const getAcceptedFileTypes = () => {
    switch (contentCategory) {
      case "logo":
      case "tiffo":
      case "vetement":
        return "image/*";
      case "musique":
        return "audio/*";
      case "slogan":
      case "lyrics":
        return ".txt,.doc,.docx";
      default:
        return "*/*";
    }
  };

  // Exemple de prompt selon catégorie et équipe
  const getPromptExample = () => {
    const examples = {
      logo: `A modern logo for ${currentTeam.name} with ${currentTeam.colors} colors`,
      slogan: `A victory chant for ${currentTeam.name} fans`,
      tiffo: `A spectacular tifo design for ${currentTeam.name} supporters`,
      vetement: `A futuristic jersey design for ${currentTeam.name} with ${currentTeam.colors} theme`,
      lyrics: `Victory song lyrics for ${currentTeam.name} with emotional verses`,
      musique: `An epic entrance anthem for ${currentTeam.name} matches`
    };
    return examples[contentCategory] || `A ${contentCategory} for ${currentTeam.name}`;
  };

  // Upload fichier sur IPFS
  async function uploadFileToIPFS(file) {
    try {
      const added = await ipfsClient.add(file);
      return `https://ipfs.infura.io/ipfs/${added.path}`;
    } catch (error) {
      console.error("Erreur upload IPFS:", error);
      return null;
    }
  }

  // Génération simple de contenu (mock) (optionnel)
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    setTimeout(() => {
      if (["logo", "tiffo", "vetement"].includes(contentCategory)) {
        setGeneratedContent(`https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&h=500&fit=crop&auto=format&q=80`);
      } else if (["slogan", "lyrics"].includes(contentCategory)) {
        setGeneratedContent(`"${prompt}" - A unique ${contentCategory} for ${currentTeam.name}!`);
      } else if (contentCategory === "musique") {
        setGeneratedContent("🎵 Audio generation in progress... Preview available after submission");
      }
      setIsGenerating(false);
    }, 3000);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (file.type.startsWith("image/")) {
        setGeneratedContent(URL.createObjectURL(file));
      } else if (file.type.startsWith("audio/")) {
        setGeneratedContent(`🎵 ${file.name} - Audio file uploaded`);
      } else {
        setGeneratedContent(`📄 ${file.name} - File uploaded`);
      }
    }
  };

  // Soumission du contenu (upload IPFS + POST avec token)
  const handleSubmit = async () => {
    if ((!generatedContent && !uploadedFile) || !isWalletConnected) return;

    const userToken = localStorage.getItem("token"); // adapte selon ta gestion auth
    if (!userToken) {
      alert("Veuillez vous connecter.");
      return;
    }

    setIsGenerating(true);

    try {
      let ipfsUrl = null;

      if (uploadedFile) {
        ipfsUrl = await uploadFileToIPFS(uploadedFile);
        if (!ipfsUrl) {
          alert("Erreur lors de l'upload du fichier.");
          setIsGenerating(false);
          return;
        }
      }

      const payload = {
        prompt: prompt || customizations || "No prompt provided",
        type: contentCategory,
        description: ipfsUrl || customizations || ""
      };

      const response = await axios.post("/generate", payload, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });

      if (response.status === 200) {
        alert("Contenu soumis avec succès !");
        setPrompt("");
        setGeneratedContent(null);
        setCustomizations("");
        setUploadedFile(null);
      } else {
        alert("Erreur lors de la soumission.");
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      alert("Erreur lors de la soumission.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-chiliz-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-md">
              <ImageWithFallback
                src={currentTeam.logo}
                alt={`${currentTeam.name} logo`}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-chiliz-black">
                Create Content for {currentTeam.name}
              </h1>
              <p className="text-lg text-chiliz-gray-600">
                Generate or upload unique content and submit it to the community
              </p>
            </div>
          </div>
        </div>

        {!isWalletConnected && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 text-center">
              <p className="text-yellow-800">Connect your wallet to submit content</p>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Content Category Selection */}
          <Card className="border-chiliz-gray-200 shadow-md">
            <CardHeader>
              <CardTitle>Content Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={contentCategory}
                onValueChange={setContentCategory}
                aria-label="Select content category"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {contentCategories.map(({ value, label, icon }) => (
                    <SelectItem key={value} value={value}>
                      <span className="flex items-center gap-2">
                        {icon} {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Content Input & Upload */}
          <Card className="border-chiliz-gray-200 shadow-md">
            <CardHeader>
              <CardTitle>Describe Your Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={uploadMethod} onValueChange={setUploadMethod}>
                <TabsList>
                  <TabsTrigger value="ai" icon={<Wand2 size={16} />}>Generate AI</TabsTrigger>
                  <TabsTrigger value="upload" icon={<Upload size={16} />}>Upload File</TabsTrigger>
                </TabsList>

                <TabsContent value="ai">
                  <Textarea
                    placeholder={getPromptExample()}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                    className="mb-3"
                  />
                  <Input
                    placeholder="Additional customizations"
                    value={customizations}
                    onChange={(e) => setCustomizations(e.target.value)}
                    className="mb-3"
                  />
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full mb-2"
                  >
                    {isGenerating ? <Loader2 className="animate-spin mr-2" size={16} /> : <Wand2 size={16} />}
                    Generate Content
                  </Button>
                </TabsContent>

                <TabsContent value="upload">
                  <input
                    type="file"
                    accept={getAcceptedFileTypes()}
                    onChange={handleFileUpload}
                    className="mb-3"
                  />
                  {uploadedFile && (
                    <p className="text-sm text-chiliz-gray-700 mb-2">File ready: {uploadedFile.name}</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Preview & Submit */}
          <Card className="border-chiliz-gray-200 shadow-md">
            <CardHeader>
              <CardTitle>Preview & Submit</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {generatedContent ? (
                contentCategory === "logo" || contentCategory === "tiffo" || contentCategory === "vetement" ? (
                  <img src={generatedContent} alt="Generated content preview" className="max-w-full rounded-md" />
                ) : (
                  <p className="whitespace-pre-wrap">{generatedContent}</p>
                )
              ) : (
                <p>No content generated or uploaded yet.</p>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isGenerating || (!generatedContent && !uploadedFile) || !isWalletConnected}
                className="w-full"
              >
                {isGenerating ? <Loader2 className="animate-spin mr-2" size={16} /> : <Upload size={16} />}
                Submit Content
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

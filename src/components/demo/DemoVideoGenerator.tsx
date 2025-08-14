import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, Download, Share, Wand2, Loader, Video } from "lucide-react";
import { toast } from "sonner";

const demoVideos = [
  {
    id: "demo-1",
    title: "Screen Registration Process",
    description: "See how easy it is to register your screen with Red Square",
    prompt: "A person setting up a digital screen with Red Square dongle, showing the QR code generation and registration process",
    status: "ready",
    thumbnail: "/api/placeholder/400/225",
    duration: "45s"
  },
  {
    id: "demo-2", 
    title: "Content Broadcasting Live",
    description: "Watch content being broadcast to a busy digital billboard",
    prompt: "A large digital billboard in Times Square displaying colorful advertisements and promotions, with crowds watching",
    status: "ready",
    thumbnail: "/api/placeholder/400/225", 
    duration: "30s"
  },
  {
    id: "demo-3",
    title: "Mobile App Usage",
    description: "Discover screens and upload content from your phone",
    prompt: "Someone using a smartphone app to find nearby digital screens on a map and uploading a video advertisement",
    status: "generating",
    thumbnail: "/api/placeholder/400/225",
    duration: "60s"
  }
];

export const DemoVideoGenerator = () => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videos, setVideos] = useState(demoVideos);

  const generateCustomVideo = async () => {
    if (!customPrompt.trim()) {
      toast.error("Please enter a prompt for video generation");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI video generation
      const newVideo = {
        id: `custom-${Date.now()}`,
        title: "Custom Demo Video",
        description: customPrompt,
        prompt: customPrompt,
        status: "generating" as const,
        thumbnail: "/api/placeholder/400/225",
        duration: "Generating..."
      };

      setVideos(prev => [newVideo, ...prev]);
      
      // Simulate generation time
      setTimeout(() => {
        setVideos(prev => prev.map(video => 
          video.id === newVideo.id 
            ? { ...video, status: "ready" as const, duration: "42s" }
            : video
        ));
        toast.success("Video generated successfully!");
      }, 8000);

      setCustomPrompt("");
    } catch (error) {
      toast.error("Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  const playVideo = (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (video?.status === "ready") {
      toast.success(`Playing: ${video.title}`);
    }
  };

  const downloadVideo = (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (video?.status === "ready") {
      toast.success(`Downloading: ${video.title}`);
    }
  };

  const shareVideo = (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (video?.status === "ready") {
      toast.success(`Sharing: ${video.title}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Custom Video Generation */}
      <Card className="border-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="w-5 h-5 mr-2" />
            Generate Custom Demo Video
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe the demo you want to see</label>
            <Input
              placeholder="e.g., A restaurant owner uploading a lunch special promotion to a local screen..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={isGenerating}
            />
          </div>
          
          <Button 
            onClick={generateCustomVideo} 
            disabled={isGenerating || !customPrompt.trim()}
            className="bg-gradient-primary"
          >
            {isGenerating ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Demo Video
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground">
            Videos are generated using AI and may take 30-60 seconds to create
          </div>
        </CardContent>
      </Card>

      {/* Demo Video Gallery */}
      <div className="grid lg:grid-cols-2 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="border-muted/20">
            <CardContent className="p-0">
              {/* Video Thumbnail */}
              <div className="relative group">
                <div className="aspect-video bg-muted/30 rounded-t-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    {video.status === "generating" ? (
                      <div className="text-center">
                        <Loader className="w-8 h-8 animate-spin text-primary mb-2" />
                        <div className="text-sm text-muted-foreground">Generating...</div>
                      </div>
                    ) : (
                      <div className="text-center group-hover:scale-110 transition-transform">
                        <Video className="w-12 h-12 text-primary mb-2" />
                        <div className="text-sm font-medium">{video.duration}</div>
                      </div>
                    )}
                  </div>
                  
                  {video.status === "ready" && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        size="sm" 
                        onClick={() => playVideo(video.id)}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play Demo
                      </Button>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  {video.status === "generating" ? (
                    <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      <Loader className="w-3 h-3 mr-1 animate-spin" />
                      Generating
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      Ready
                    </Badge>
                  )}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    disabled={video.status !== "ready"}
                    onClick={() => playVideo(video.id)}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={video.status !== "ready"}
                    onClick={() => downloadVideo(video.id)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={video.status !== "ready"}
                    onClick={() => shareVideo(video.id)}
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generation Info */}
      <Card className="border-muted/20">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold">AI-Powered Demo Generation</h3>
            <p className="text-sm text-muted-foreground">
              These demos are generated using advanced AI to show realistic Red Square usage scenarios. 
              Create custom videos to demonstrate specific features or use cases.
            </p>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-4">
              <span>• Realistic scenarios</span>
              <span>• High-quality output</span>
              <span>• Custom prompts supported</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
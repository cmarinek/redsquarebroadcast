import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, Image, Video, FileText, X, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";

interface UploadedFile {
  file: File;
  preview: string;
  type: 'image' | 'video' | 'gif';
}

export default function ContentUpload() {
  const { screenId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload JPG, PNG, GIF, or MP4 files only.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 50MB.",
        variant: "destructive"
      });
      return;
    }

    const preview = URL.createObjectURL(file);
    const type = file.type.startsWith('image/') ? 
      (file.type === 'image/gif' ? 'gif' : 'image') : 'video';

    setUploadedFile({ file, preview, type });
  };

  const removeFile = () => {
    if (uploadedFile) {
      URL.revokeObjectURL(uploadedFile.preview);
      setUploadedFile(null);
    }
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  const uploadToSupabase = async () => {
    if (!uploadedFile || !screenId) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to upload content.",
          variant: "destructive"
        });
        return;
      }

      const fileExt = uploadedFile.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content')
        .upload(fileName, uploadedFile.file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      // Save content metadata to database
      const { data: contentData, error: contentError } = await supabase
        .from('content_uploads')
        .insert({
          user_id: user.id,
          file_name: uploadedFile.file.name,
          file_url: uploadData.path,
          file_type: uploadedFile.type,
          file_size: uploadedFile.file.size
        })
        .select()
        .single();

      if (contentError) throw contentError;

      toast({
        title: "Content uploaded successfully!",
        description: "Proceeding to scheduling..."
      });

      // Navigate to scheduling with content ID
      setTimeout(() => {
        navigate(`/book/${screenId}/schedule?contentId=${contentData.id}`);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/screen/${screenId}`)}
              className="mb-4"
            >
              ← Back to Screen Details
            </Button>
            
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Upload Your Content
            </h1>
            <p className="text-muted-foreground">
              Upload images, videos, or GIFs to broadcast on the selected screen
            </p>
          </div>

          {!uploadedFile ? (
            <Card>
              <CardHeader>
                <CardTitle>Select Content</CardTitle>
                <CardDescription>
                  Supported formats: JPG, PNG, GIF, MP4 (max 50MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Drag & Drop or Click to Upload</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose from your device or drag files here
                  </p>
                  
                  <div className="flex justify-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Image className="h-4 w-4" />
                      Images
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Video className="h-4 w-4" />
                      Videos
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      GIFs
                    </div>
                  </div>
                  
                  <Button>
                    Choose File
                  </Button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,video/mp4"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* File Preview */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Content Preview</CardTitle>
                      <CardDescription>{uploadedFile.file.name}</CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {uploadedFile.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                    {uploadedFile.type === 'video' ? (
                      <div className="relative">
                        <video
                          ref={videoRef}
                          src={uploadedFile.preview}
                          className="w-full h-64 object-contain"
                          onPlay={() => setVideoPlaying(true)}
                          onPause={() => setVideoPlaying(false)}
                        />
                        <button
                          onClick={toggleVideo}
                          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
                        >
                          {videoPlaying ? (
                            <Pause className="h-12 w-12 text-white" />
                          ) : (
                            <Play className="h-12 w-12 text-white" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <img
                        src={uploadedFile.preview}
                        alt="Preview"
                        className="w-full h-64 object-contain"
                      />
                    )}
                    
                    <button
                      onClick={removeFile}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">File size:</span>
                      <p className="text-muted-foreground">
                        {(uploadedFile.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>
                      <p className="text-muted-foreground capitalize">
                        {uploadedFile.type}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Progress */}
              {uploading && (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={removeFile}
                  disabled={uploading}
                  className="flex-1"
                >
                  Choose Different File
                </Button>
                <Button 
                  onClick={uploadToSupabase}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? "Uploading..." : "Continue to Scheduling"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
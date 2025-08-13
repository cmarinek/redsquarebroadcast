import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, Image, Video, FileText, X, Play, Pause, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { LoadingOverlay } from "@/components/ui/loading-spinner";
import { useFormValidation } from "@/hooks/useFormValidation";
import { contentUploadSchema, moderationChecks } from "@/utils/validation";
import { z } from "zod";

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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { validateForm } = useFormValidation(contentUploadSchema);

  const validateFile = (file: File): string[] => {
    const errors: string[] = [];
    
    // File type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (!allowedTypes.includes(file.type)) {
      errors.push("Invalid file type. Please upload JPG, PNG, GIF, or MP4 files only.");
    }

    // File size validation
    if (file.size > 50 * 1024 * 1024) {
      errors.push("File too large. Maximum size is 50MB.");
    }

    // Content moderation checks
    const filenameIssues = moderationChecks.filename(file.name);
    const fileSizeIssues = moderationChecks.fileSize(file.size, file.type);
    
    errors.push(...filenameIssues, ...fileSizeIssues);

    // Additional validation using Zod schema
    try {
      contentUploadSchema.parse({ file });
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(err => err.message));
      }
    }

    return errors;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const errors = validateFile(file);
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "File validation failed",
        description: errors[0],
        variant: "destructive"
      });
      return;
    }

    setValidationErrors([]);
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
    
    let progressInterval: NodeJS.Timeout | null = null;

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

      // Using signed upload URLs; server will generate the final file path

      // Simulate upload progress
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { data: signed, error: fnError } = await supabase.functions.invoke('create-signed-upload', {
        body: {
          bucket: 'content',
          file_name: uploadedFile.file.name,
          content_type: uploadedFile.file.type,
          content_size: uploadedFile.file.size,
        },
      });

      if (fnError || !signed) throw (fnError || new Error('Failed to get signed upload URL'));

      await fetch((signed as any).signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': uploadedFile.file.type,
          'x-upsert': 'false',
        },
        body: uploadedFile.file,
      });

      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(100);

      // Save content metadata to database
      const { data: contentData, error: contentError } = await supabase
        .from('content_uploads')
        .insert({
          user_id: user.id,
          screen_id: screenId,
          file_name: uploadedFile.file.name,
          file_path: (signed as any).path,
          file_type: uploadedFile.type,
          file_size: uploadedFile.file.size
        })
        .select()
        .single();

      if (contentError) throw contentError;

      // Kick off post-upload processing (moderation, thumbnails/transcode)
      const { data: moderationResult, error: moderationError } = await supabase.functions.invoke('content-moderation', {
        body: {
          file_path: (signed as any).path,
          content_type: uploadedFile.file.type,
          file_name: uploadedFile.file.name,
        },
      });

      if (moderationError) {
        console.warn('Moderation check failed:', moderationError);
      }

      // Check moderation results
      if (moderationResult && !moderationResult.approved) {
        toast({
          title: "Content not approved",
          description: `Your content was rejected: ${moderationResult.issues?.join(', ') || 'Content policy violation'}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Content uploaded successfully!",
        description: moderationResult?.approved ? "Content approved and ready for scheduling" : "Proceeding to scheduling..."
      });

      // Navigate to scheduling with content ID
      setTimeout(() => {
        navigate(`/book/${screenId}/schedule?contentId=${contentData.id}`);
      }, 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      
      const errorMessage = error?.message || 'Unknown error occurred';
      const isNetworkError = error?.code === 'NETWORK_ERROR' || !navigator.onLine;
      
      toast({
        title: "Upload failed",
        description: isNetworkError 
          ? "Network error. Please check your connection and try again."
          : `Upload error: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Layout>
      <LoadingOverlay isLoading={uploading} loadingText="Uploading and processing content...">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/screen/${screenId}`)}
                className="mb-4"
                disabled={uploading}
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

            {/* Validation Errors Display */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <strong>Content Validation Issues:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

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
      </LoadingOverlay>
    </Layout>
  );
}
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Image, Video, FileImage, Check, X, Play } from "lucide-react";

const mockFiles = [
  {
    id: "file-1",
    name: "summer_sale_banner.jpg",
    type: "image",
    size: "2.4 MB",
    duration: null,
    status: "completed",
    preview: "/api/placeholder/300/200"
  },
  {
    id: "file-2", 
    name: "product_showcase.mp4",
    type: "video",
    size: "15.7 MB", 
    duration: "30s",
    status: "completed",
    preview: "/api/placeholder/300/200"
  },
  {
    id: "file-3",
    name: "holiday_promo.gif",
    type: "gif",
    size: "4.1 MB",
    duration: "5s",
    status: "processing",
    preview: "/api/placeholder/300/200"
  }
];

export const DemoContentUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState(mockFiles);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Add new file to list
          const newFile = {
            id: `file-${Date.now()}`,
            name: "new_campaign_video.mp4",
            type: "video",
            size: "8.2 MB",
            duration: "15s", 
            status: "completed",
            preview: "/api/placeholder/300/200"
          };
          setFiles(prev => [newFile, ...prev]);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'gif': return <FileImage className="w-5 h-5" />;
      default: return <Upload className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><Check className="w-3 h-3 mr-1" />Ready</Badge>;
      case 'processing':
        return <Badge variant="secondary"><div className="w-3 h-3 mr-1 animate-spin border border-primary border-t-transparent rounded-full"></div>Processing</Badge>;
      case 'error':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-muted/20 hover:border-primary/20 transition-colors">
        <CardContent className="p-8">
          <div className="text-center">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Your Content</h3>
            <p className="text-muted-foreground mb-6">
              Support for images (JPG, PNG), videos (MP4, MOV), and GIFs
            </p>
            
            {isUploading ? (
              <div className="space-y-4">
                <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
              </div>
            ) : (
              <Button onClick={simulateUpload} className="bg-gradient-primary">
                <Upload className="w-4 h-4 mr-2" />
                Choose Files or Drop Here
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      <Card className="border-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileImage className="w-5 h-5 mr-2" />
            Uploaded Content ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {files.map((file) => (
            <div 
              key={file.id}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                selectedFile === file.id ? 'border-primary bg-primary/5' : 'border-muted/20'
              }`}
              onClick={() => setSelectedFile(selectedFile === file.id ? null : file.id)}
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-muted/20 rounded-lg">
                  {getFileIcon(file.type)}
                </div>
                <div>
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center space-x-2">
                    <span>{file.size}</span>
                    {file.duration && (
                      <>
                        <span>•</span>
                        <span>{file.duration}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {getStatusBadge(file.status)}
                {file.type === 'video' && file.status === 'completed' && (
                  <Button size="sm" variant="outline">
                    <Play className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                )}
              </div>
            </div>
          ))}

          {selectedFile && (
            <div className="border-t border-muted/20 pt-4 mt-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium mb-2">Content Preview</h4>
                <div className="bg-background rounded border p-8 text-center">
                  <div className="w-full max-w-sm mx-auto bg-gradient-primary/20 rounded-lg h-32 flex items-center justify-center">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Content preview would appear here
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Guidelines */}  
      <Card className="border-muted/20">
        <CardHeader>
          <CardTitle className="text-sm">Content Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <div>• Maximum file size: 50MB</div>
          <div>• Recommended video duration: 15-60 seconds</div>
          <div>• Minimum resolution: 1920x1080</div>
          <div>• All content is automatically moderated</div>
        </CardContent>
      </Card>
    </div>
  );
};
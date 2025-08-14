import { useState, useEffect } from "react";
import { Upload, Download, Trash2, FileArchive, Users, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface APKRelease {
  id: string;
  version_name: string;
  version_code: number;
  file_path: string;
  file_size: number;
  uploaded_by: string;
  release_notes?: string;
  is_active: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error?: string;
}

export const APKManager = () => {
  const { toast } = useToast();
  const [releases, setReleases] = useState<APKRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
  });

  // Form state
  const [versionName, setVersionName] = useState("");
  const [versionCode, setVersionCode] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      const { data, error } = await supabase
        .from('apk_releases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReleases(data || []);
    } catch (error) {
      console.error("Error fetching APK releases:", error);
      toast({
        title: "Error fetching releases",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.apk')) {
        toast({
          title: "Invalid file type",
          description: "Please select an APK file.",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !versionName || !versionCode) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select an APK file.",
        variant: "destructive"
      });
      return;
    }

    setUploadState({ isUploading: true, progress: 0 });

    try {
      const fileName = `v${versionName}-${versionCode}.apk`;
      const filePath = `releases/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('apk-files')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Create database record
      const { error: dbError } = await supabase
        .from('apk_releases')
        .insert({
          version_name: versionName,
          version_code: parseInt(versionCode),
          file_path: uploadData.path,
          file_size: selectedFile.size,
          release_notes: releaseNotes || null,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      toast({
        title: "APK uploaded successfully",
        description: `Version ${versionName} is now available for download.`,
      });

      // Reset form
      setVersionName("");
      setVersionCode("");
      setReleaseNotes("");
      setSelectedFile(null);
      
      // Refresh releases
      fetchReleases();
    } catch (error) {
      console.error("Error uploading APK:", error);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadState({ isUploading: false, progress: 0 });
    }
  };

  const handleDownload = async (release: APKRelease) => {
    try {
      // Get signed URL for download
      const { data, error } = await supabase.storage
        .from('apk-files')
        .createSignedUrl(release.file_path, 3600); // 1 hour expiry

      if (error) throw error;

      // Increment download count
      await supabase.rpc('increment_apk_download_count', {
        release_id: release.id
      });

      // Trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = `RedSquare-v${release.version_name}.apk`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Refresh releases to show updated download count
      fetchReleases();

      toast({
        title: "Download started",
        description: `RedSquare v${release.version_name} is downloading.`,
      });
    } catch (error) {
      console.error("Error downloading APK:", error);
      toast({
        title: "Download failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleReleaseStatus = async (releaseId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('apk_releases')
        .update({ is_active: !currentStatus })
        .eq('id', releaseId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Release ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });

      fetchReleases();
    } catch (error) {
      console.error("Error updating release status:", error);
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteRelease = async (release: APKRelease) => {
    if (!confirm(`Are you sure you want to delete version ${release.version_name}?`)) {
      return;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('apk-files')
        .remove([release.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('apk_releases')
        .delete()
        .eq('id', release.id);

      if (dbError) throw dbError;

      toast({
        title: "Release deleted",
        description: `Version ${release.version_name} has been removed.`,
      });

      fetchReleases();
    } catch (error) {
      console.error("Error deleting release:", error);
      toast({
        title: "Delete failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading APK releases...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New APK
          </CardTitle>
          <CardDescription>
            Upload a new version of the Red Square mobile app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="version-name">Version Name *</Label>
              <Input
                id="version-name"
                placeholder="e.g., 1.0.0"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                disabled={uploadState.isUploading}
              />
            </div>
            <div>
              <Label htmlFor="version-code">Version Code *</Label>
              <Input
                id="version-code"
                type="number"
                placeholder="e.g., 1"
                value={versionCode}
                onChange={(e) => setVersionCode(e.target.value)}
                disabled={uploadState.isUploading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="release-notes">Release Notes</Label>
            <Textarea
              id="release-notes"
              placeholder="What's new in this version..."
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              disabled={uploadState.isUploading}
            />
          </div>

          <div>
            <Label htmlFor="apk-file">APK File *</Label>
            <Input
              id="apk-file"
              type="file"
              accept=".apk"
              onChange={handleFileSelect}
              disabled={uploadState.isUploading}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>

          {uploadState.isUploading && (
            <div className="space-y-2">
              <Progress value={uploadState.progress} />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={uploadState.isUploading || !selectedFile || !versionName || !versionCode}
            className="w-full"
          >
            {uploadState.isUploading ? 'Uploading...' : 'Upload APK'}
          </Button>
        </CardContent>
      </Card>

      {/* Build Instructions */}
      <Alert>
        <FileArchive className="h-4 w-4" />
        <AlertDescription className="space-y-2">
          <p><strong>To build the APK locally:</strong></p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Export project to GitHub and clone locally</li>
            <li>Run <code className="bg-muted px-1 rounded">npm install</code></li>
            <li>Run <code className="bg-muted px-1 rounded">npx cap add android</code></li>
            <li>Run <code className="bg-muted px-1 rounded">npm run build</code></li>
            <li>Run <code className="bg-muted px-1 rounded">npx cap sync</code></li>
            <li>Run <code className="bg-muted px-1 rounded">npx cap open android</code></li>
            <li>In Android Studio: Build → Generate Signed Bundle/APK</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Releases List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Available Releases
          </CardTitle>
          <CardDescription>
            Manage and download APK releases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {releases.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No APK releases found. Upload your first release above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {releases.map((release) => (
                  <TableRow key={release.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">v{release.version_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Build {release.version_code}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={release.is_active ? "default" : "secondary"}>
                        {release.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(release.file_size)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {release.download_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(release.created_at), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(release)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant={release.is_active ? "secondary" : "default"}
                          onClick={() => toggleReleaseStatus(release.id, release.is_active)}
                        >
                          {release.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteRelease(release)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
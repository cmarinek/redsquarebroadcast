import { useState, useEffect } from "react";
import { Upload, Download, Trash2, FileArchive, Users, Calendar, CheckCircle, Smartphone, Monitor, Tv } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AppRelease {
  id: string;
  version_name: string;
  version_code: number;
  platform: 'android' | 'ios' | 'tv';
  file_extension: 'apk' | 'ipa' | 'zip';
  file_path: string;
  file_size: number;
  uploaded_by: string;
  release_notes?: string;
  is_active: boolean;
  download_count: number;
  minimum_os_version?: string;
  bundle_id?: string;
  created_at: string;
  updated_at: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error?: string;
}

const PLATFORM_CONFIG = {
  android: {
    icon: Smartphone,
    name: 'Android',
    fileExtension: 'apk',
    bucket: 'apk-files',
    acceptedFiles: '.apk',
    buildInstructions: [
      'Export project to GitHub and clone locally',
      'Run npm install',
      'Run npx cap add android',
      'Run npm run build',
      'Run npx cap sync',
      'Run npx cap open android',
      'In Android Studio: Build → Generate Signed Bundle/APK'
    ]
  },
  ios: {
    icon: Smartphone,
    name: 'iOS',
    fileExtension: 'ipa',
    bucket: 'ios-files',
    acceptedFiles: '.ipa',
    buildInstructions: [
      'Export project to GitHub and clone locally',
      'Run npm install',
      'Run npx cap add ios',
      'Run npm run build',
      'Run npx cap sync',
      'Run npx cap open ios',
      'In Xcode: Product → Archive → Distribute App'
    ]
  },
  tv: {
    icon: Tv,
    name: 'TV App',
    fileExtension: 'zip',
    bucket: 'tv-files',
    acceptedFiles: '.zip',
    buildInstructions: [
      'Export project to GitHub and clone locally',
      'Run npm install',
      'Run npm run build',
      'Package the dist folder as a ZIP file',
      'Test on supported TV platforms',
      'Upload the ZIP package'
    ]
  }
} as const;

export const AppManager = () => {
  const { toast } = useToast();
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'tv'>('android');
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
  });

  // Form state
  const [versionName, setVersionName] = useState("");
  const [versionCode, setVersionCode] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [minimumOsVersion, setMinimumOsVersion] = useState("");
  const [bundleId, setBundleId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      const { data, error } = await supabase
        .from('app_releases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReleases(data || []);
    } catch (error) {
      console.error("Error fetching app releases:", error);
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

  const getCurrentPlatformConfig = () => PLATFORM_CONFIG[activePlatform];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const config = getCurrentPlatformConfig();
    
    if (file) {
      if (!file.name.endsWith(`.${config.fileExtension}`)) {
        toast({
          title: "Invalid file type",
          description: `Please select a ${config.fileExtension.toUpperCase()} file.`,
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    const config = getCurrentPlatformConfig();
    
    if (!selectedFile || !versionName || !versionCode) {
      toast({
        title: "Missing information",
        description: `Please fill in all required fields and select a ${config.fileExtension.toUpperCase()} file.`,
        variant: "destructive"
      });
      return;
    }

    setUploadState({ isUploading: true, progress: 0 });

    try {
      const fileName = `v${versionName}-${versionCode}.${config.fileExtension}`;
      const filePath = `releases/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(config.bucket)
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Create database record
      const { error: dbError } = await supabase
        .from('app_releases')
        .insert({
          version_name: versionName,
          version_code: parseInt(versionCode),
          platform: activePlatform,
          file_extension: config.fileExtension,
          file_path: uploadData.path,
          file_size: selectedFile.size,
          release_notes: releaseNotes || null,
          minimum_os_version: minimumOsVersion || null,
          bundle_id: bundleId || null,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      toast({
        title: `${config.name} app uploaded successfully`,
        description: `Version ${versionName} is now available for download.`,
      });

      // Reset form
      setVersionName("");
      setVersionCode("");
      setReleaseNotes("");
      setMinimumOsVersion("");
      setBundleId("");
      setSelectedFile(null);
      
      // Refresh releases
      fetchReleases();
    } catch (error) {
      console.error(`Error uploading ${config.name} app:`, error);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadState({ isUploading: false, progress: 0 });
    }
  };

  const handleDownload = async (release: AppRelease) => {
    const config = PLATFORM_CONFIG[release.platform];
    
    try {
      // Get signed URL for download
      const { data, error } = await supabase.storage
        .from(config.bucket)
        .createSignedUrl(release.file_path, 3600); // 1 hour expiry

      if (error) throw error;

      // Increment download count
      await supabase.rpc('increment_app_download_count', {
        release_id: release.id
      });

      // Trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = `RedSquare-${release.platform}-v${release.version_name}.${release.file_extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Refresh releases to show updated download count
      fetchReleases();

      toast({
        title: "Download started",
        description: `RedSquare ${config.name} v${release.version_name} is downloading.`,
      });
    } catch (error) {
      console.error("Error downloading app:", error);
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
        .from('app_releases')
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

  const deleteRelease = async (release: AppRelease) => {
    const config = PLATFORM_CONFIG[release.platform];
    
    if (!confirm(`Are you sure you want to delete ${config.name} version ${release.version_name}?`)) {
      return;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(config.bucket)
        .remove([release.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('app_releases')
        .delete()
        .eq('id', release.id);

      if (dbError) throw dbError;

      toast({
        title: "Release deleted",
        description: `${config.name} version ${release.version_name} has been removed.`,
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

  const getPlatformIcon = (platform: string) => {
    const IconComponent = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]?.icon || Smartphone;
    return <IconComponent className="h-4 w-4" />;
  };

  const getPlatformReleases = (platform: 'android' | 'ios' | 'tv') => {
    return releases.filter(release => release.platform === platform);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading app releases...</div>;
  }

  const currentConfig = getCurrentPlatformConfig();
  const IconComponent = currentConfig.icon;

  return (
    <div className="space-y-6">
      <Tabs value={activePlatform} onValueChange={(value) => setActivePlatform(value as 'android' | 'ios' | 'tv')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="android" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Android
          </TabsTrigger>
          <TabsTrigger value="ios" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            iOS
          </TabsTrigger>
          <TabsTrigger value="tv" className="flex items-center gap-2">
            <Tv className="h-4 w-4" />
            TV App
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activePlatform} className="space-y-6">
          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload New {currentConfig.name} App
              </CardTitle>
              <CardDescription>
                Upload a new version of the Red Square {currentConfig.name} app
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimum-os-version">Minimum OS Version</Label>
                  <Input
                    id="minimum-os-version"
                    placeholder={activePlatform === 'android' ? 'e.g., 7.0' : activePlatform === 'ios' ? 'e.g., 13.0' : 'e.g., Android TV 9.0'}
                    value={minimumOsVersion}
                    onChange={(e) => setMinimumOsVersion(e.target.value)}
                    disabled={uploadState.isUploading}
                  />
                </div>
                <div>
                  <Label htmlFor="bundle-id">Bundle/Package ID</Label>
                  <Input
                    id="bundle-id"
                    placeholder="e.g., com.redsquare.app"
                    value={bundleId}
                    onChange={(e) => setBundleId(e.target.value)}
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
                <Label htmlFor="app-file">{currentConfig.fileExtension.toUpperCase()} File *</Label>
                <Input
                  id="app-file"
                  type="file"
                  accept={currentConfig.acceptedFiles}
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
                {uploadState.isUploading ? 'Uploading...' : `Upload ${currentConfig.fileExtension.toUpperCase()}`}
              </Button>
            </CardContent>
          </Card>

          {/* Build Instructions */}
          <Alert>
            <FileArchive className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p><strong>To build the {currentConfig.name} app locally:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {currentConfig.buildInstructions.map((step, index) => (
                  <li key={index}>
                    {step.includes('npm') || step.includes('npx') ? (
                      <>
                        {step.split(' ').slice(0, -2).join(' ')} <code className="bg-muted px-1 rounded">{step.split(' ').slice(-2).join(' ')}</code>
                      </>
                    ) : (
                      step
                    )}
                  </li>
                ))}
              </ol>
            </AlertDescription>
          </Alert>

          {/* Releases List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Available {currentConfig.name} Releases
              </CardTitle>
              <CardDescription>
                Manage and download {currentConfig.name} app releases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getPlatformReleases(activePlatform).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No {currentConfig.name} releases found. Upload your first release above.
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
                    {getPlatformReleases(activePlatform).map((release) => (
                      <TableRow key={release.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(release.platform)}
                            <div>
                              <div className="font-semibold">v{release.version_name}</div>
                              <div className="text-sm text-muted-foreground">
                                Build {release.version_code}
                                {release.minimum_os_version && ` • Min OS: ${release.minimum_os_version}`}
                              </div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
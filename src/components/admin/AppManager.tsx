import { useState, useEffect } from "react";
import { Upload, Download, Trash2, FileArchive, Users, Calendar, CheckCircle, Smartphone, Monitor, Tv } from "lucide-react";
import { AppBuildHistory } from "./AppBuildHistory";
import { BuildSystemTest } from "./BuildSystemTest";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AppRelease {
  id: string;
  version_name: string;
  version_code: number;
  platform: Platform;
  file_extension: 'apk' | 'ipa' | 'zip' | 'exe' | 'dmg' | 'appimage';
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
  source: 'manual' | 'automated';
  build_id?: string;
}

type Platform = 'redsquare_android' | 'redsquare_ios' | 'redsquare_web' | 'screens_android_tv' | 'screens_android_mobile' | 'screens_ios' | 'screens_windows' | 'screens_macos' | 'screens_linux' | 'screens_amazon_fire' | 'screens_roku' | 'screens_samsung_tizen' | 'screens_lg_webos' | 'system_test';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error?: string;
}

const PLATFORM_CONFIG = {
  // RedSquare App (Main user management app)
  redsquare_android: {
    icon: Smartphone,
    name: 'RedSquare Android',
    description: 'Main mobile app for advertisers and screen owners',
    fileExtension: 'apk',
    bucket: 'apk-files',
    acceptedFiles: '.apk',
    buildInstructions: [
      'Build the main RedSquare mobile app for Android devices.',
      'Use the automated build system or upload manually.'
    ]
  },
  redsquare_ios: {
    icon: Smartphone,
    name: 'RedSquare iOS',
    description: 'Main mobile app for advertisers and screen owners',
    fileExtension: 'ipa',
    bucket: 'ios-files',
    acceptedFiles: '.ipa',
    buildInstructions: [
      'Build the main RedSquare mobile app for iOS devices.',
      'Use the automated build system or upload manually.'
    ]
  },
  redsquare_web: {
    icon: Monitor,
    name: 'RedSquare Web',
    description: 'Progressive web app accessible from any browser',
    fileExtension: 'zip',
    bucket: 'app_artifacts',
    acceptedFiles: '.zip',
    buildInstructions: [
      'The web app is automatically deployed.',
      'Manual builds are not typically required.'
    ]
  },
  // RedSquare Screens (Content display app for various screen types)
  screens_android_tv: {
    icon: Tv,
    name: 'RedSquare Screens (Android TV)',
    description: 'Content display app for Android TV devices',
    fileExtension: 'apk',
    bucket: 'tv-files',
    acceptedFiles: '.apk',
    buildInstructions: [
      'Build the content display app for Android TV.',
      'Use the automated build system for latest version.'
    ]
  },
  screens_android_mobile: {
    icon: Smartphone,
    name: 'RedSquare Screens (Android Mobile)',
    description: 'Content display app for Android mobile devices used as screens',
    fileExtension: 'apk',
    bucket: 'apk-files',
    acceptedFiles: '.apk',
    buildInstructions: [
      'Build the content display app for Android mobile devices.',
      'Use the automated build system or upload manually.'
    ]
  },
  screens_ios: {
    icon: Smartphone,
    name: 'RedSquare Screens (iOS)',
    description: 'Content display app for iOS devices used as screens',
    fileExtension: 'ipa',
    bucket: 'ios-files',
    acceptedFiles: '.ipa',
    buildInstructions: [
      'Build the content display app for iOS devices.',
      'Use the automated build system or upload manually.'
    ]
  },
  screens_windows: {
    icon: Monitor,
    name: 'RedSquare Screens (Windows)',
    description: 'Content display app for Windows-based screens',
    fileExtension: 'exe',
    bucket: 'app_artifacts',
    acceptedFiles: '.exe',
    buildInstructions: [
      'Build the content display app for Windows devices.',
      'Use the automated build system.'
    ]
  },
  screens_macos: {
    icon: Monitor,
    name: 'RedSquare Screens (macOS)',
    description: 'Content display app for macOS-based screens',
    fileExtension: 'dmg',
    bucket: 'app_artifacts',
    acceptedFiles: '.dmg',
    buildInstructions: [
      'Build the content display app for macOS devices.',
      'Use the automated build system.'
    ]
  },
  screens_linux: {
    icon: Monitor,
    name: 'RedSquare Screens (Linux)',
    description: 'Content display app for Linux-based screens',
    fileExtension: 'AppImage',
    bucket: 'app_artifacts',
    acceptedFiles: '.appimage',
    buildInstructions: [
      'Build the content display app for Linux devices.',
      'Use the automated build system.'
    ]
  },
  screens_amazon_fire: {
    icon: Tv,
    name: 'RedSquare Screens (Amazon Fire TV)',
    description: 'Content display app for Amazon Fire TV devices',
    fileExtension: 'apk',
    bucket: 'tv-files',
    acceptedFiles: '.apk',
    buildInstructions: [
      'Build the content display app for Amazon Fire TV.',
      'Use the automated build system.'
    ]
  },
  screens_roku: {
    icon: Tv,
    name: 'RedSquare Screens (Roku)',
    description: 'Content display app for Roku streaming devices',
    fileExtension: 'zip',
    bucket: 'tv-files',
    acceptedFiles: '.zip',
    buildInstructions: [
      'Build the content display app for Roku devices.',
      'Use the automated build system.'
    ]
  },
  screens_samsung_tizen: {
    icon: Tv,
    name: 'RedSquare Screens (Samsung Smart TV)',
    description: 'Content display app for Samsung Tizen smart TVs (future)',
    fileExtension: 'tpk',
    bucket: 'tv-files',
    acceptedFiles: '.tpk',
    buildInstructions: [
      'Build the content display app for Samsung Tizen TVs.',
      'Future platform - automated build system under development.'
    ]
  },
  screens_lg_webos: {
    icon: Tv,
    name: 'RedSquare Screens (LG Smart TV)',
    description: 'Content display app for LG webOS smart TVs (future)',
    fileExtension: 'ipk',
    bucket: 'tv-files',
    acceptedFiles: '.ipk',
    buildInstructions: [
      'Build the content display app for LG webOS TVs.',
      'Future platform - automated build system under development.'
    ]
  }
} as const;

export const AppManager = () => {
  const { toast } = useToast();
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState<Platform>('redsquare_android');
  const [isTriggeringBuild, setIsTriggeringBuild] = useState(false);
  const [buildSuccessfullyStarted, setBuildSuccessfullyStarted] = useState<string | null>(null);
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

    // Set up real-time subscription to refresh when builds complete
    const channel = supabase
      .channel('app-builds-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_builds' },
        (payload) => {
          // Refresh releases when any build changes (pending, in_progress, success, failed)
          fetchReleases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReleases = async () => {
    try {
      // Fetch manual releases
      const { data: manualReleases, error: manualError } = await supabase
        .from('app_releases')
        .select('*')
        .order('created_at', { ascending: false });

      if (manualError) throw manualError;

      // Fetch automated builds (both pending and successful)
      const { data: automatedBuilds, error: automatedError } = await supabase
        .from('app_builds')
        .select('*')
        .in('status', ['pending', 'in_progress', 'success'])
        .order('created_at', { ascending: false });

      if (automatedError) throw automatedError;

      // Convert manual releases to unified format with proper typing
      const manualReleasesFormatted = (manualReleases || []).map(release => ({
        ...release,
        source: 'manual' as const,
        platform: release.platform as any // Type cast to avoid enum conflict
      })) as AppRelease[];

      // Convert automated builds to unified format
      const automatedReleasesFormatted = automatedBuilds.map(async (build) => {
        console.log('Processing automated build:', { id: build.id, app_type: build.app_type, status: build.status, artifact_url: build.artifact_url });
        
        const platformMap: { [key: string]: Platform } = {
          // Legacy mappings for existing builds (for backward compatibility)
          'android_tv': 'screens_android_tv',
          'android_mobile': 'redsquare_android',
          'ios': 'redsquare_ios',
          'desktop_windows': 'screens_windows',
          'advertiser_android': 'redsquare_android',
          'advertiser_ios': 'redsquare_ios',
          'advertiser_desktop': 'screens_windows',
          // New mappings
          'redsquare_android': 'redsquare_android',
          'redsquare_ios': 'redsquare_ios',
          'redsquare_web': 'redsquare_web',
          'screens_android_tv': 'screens_android_tv',
          'screens_android_mobile': 'screens_android_mobile',
          'screens_ios': 'screens_ios',
          'screens_windows': 'screens_windows',
          'screens_macos': 'screens_macos',
          'screens_linux': 'screens_linux',
          'screens_amazon_fire': 'screens_amazon_fire',
          'screens_roku': 'screens_roku',
          'screens_samsung_tizen': 'screens_samsung_tizen',
          'screens_lg_webos': 'screens_lg_webos'
        };

        const platform = platformMap[build.app_type] || 'redsquare_android';
        const config = PLATFORM_CONFIG[platform];
        
        console.log('Mapped platform:', { app_type: build.app_type, platform, hasConfig: !!config });
        
        // Fetch actual file size for successful automated builds with artifacts
        const fileSize = (build.status === 'success' && build.artifact_url) ? 
          await fetchFileSizeFromUrl(build.artifact_url) : 0;
          
        console.log('File size fetched:', { artifact_url: build.artifact_url, fileSize });

        return {
          id: build.id,
          version_name: build.version || '1.0.0',
          version_code: parseInt(build.version?.split('.').pop() || '1'),
          platform,
          file_extension: config.fileExtension as any,
          file_path: build.artifact_url || '',
          file_size: fileSize,
          uploaded_by: build.triggered_by || 'system',
          release_notes: `Automated build from commit ${build.commit_hash?.slice(0, 7) || 'unknown'}`,
          is_active: build.is_active || true,
          download_count: 0,
          created_at: build.created_at,
          updated_at: build.updated_at || build.created_at,
          source: 'automated' as const,
          build_id: build.id
        };
      });

      // Wait for all automated releases to be processed
      const automatedReleasesFormattedResolved = await Promise.all(automatedReleasesFormatted);

      // Combine and sort by creation date
      const allReleases = [...manualReleasesFormatted, ...automatedReleasesFormattedResolved]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('All releases processed:', allReleases.length, 'releases');
      console.log('Platforms found:', [...new Set(allReleases.map(r => r.platform))]);
      setReleases(allReleases);
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

  const formatFileSize = (bytes: number, isAutomated = false) => {
    if (bytes === 0) {
      return isAutomated ? 'Calculating...' : '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchFileSizeFromUrl = async (url: string): Promise<number> => {
    try {
      // Add timeout and faster HEAD request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength, 10) : 0;
    } catch (error) {
      console.error('Error fetching file size (timeout/network):', error);
      return 0; // Return 0 instead of hanging
    }
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

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(config.bucket)
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { user } } = await supabase.auth.getUser();

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
          uploaded_by: user?.id
        });

      if (dbError) throw dbError;

      toast({
        title: `${config.name} app uploaded successfully`,
        description: `Version ${versionName} is now available for download.`,
      });

      setVersionName("");
      setVersionCode("");
      setReleaseNotes("");
      setMinimumOsVersion("");
      setBundleId("");
      setSelectedFile(null);
      
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
      let downloadUrl: string;
      
      if (release.source === 'automated') {
        // For automated builds, use the artifact_url directly
        downloadUrl = release.file_path;
      } else {
        // For manual releases, create signed URL
        const { data, error } = await supabase.storage
          .from(config.bucket)
          .createSignedUrl(release.file_path, 3600);

        if (error) throw error;
        downloadUrl = data.signedUrl;
      }

      // Only increment download count for manual releases
      if (release.source === 'manual') {
        await supabase.rpc('increment_app_download_count', {
          release_id: release.id
        });
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `RedSquare-${release.platform}-v${release.version_name}.${release.file_extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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
      const release = releases.find(r => r.id === releaseId);
      
      if (release?.source === 'automated') {
        // Update automated build status
        const { error } = await supabase
          .from('app_builds')
          .update({ is_active: !currentStatus })
          .eq('id', releaseId);
          
        if (error) throw error;
      } else {
        // Update manual release status
        const { error } = await supabase
          .from('app_releases')
          .update({ is_active: !currentStatus })
          .eq('id', releaseId);

        if (error) throw error;
      }

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
    // Only allow deleting manual releases
    if (release.source === 'automated') {
      toast({
        title: "Cannot delete automated builds",
        description: "Automated builds cannot be deleted from this interface.",
        variant: "destructive"
      });
      return;
    }

    const config = PLATFORM_CONFIG[release.platform];
    
    if (!confirm(`Are you sure you want to delete ${config.name} version ${release.version_name}?`)) {
      return;
    }

    try {
      const { error: storageError } = await supabase.storage
        .from(config.bucket)
        .remove([release.file_path]);

      if (storageError) throw storageError;

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

  const getPlatformReleases = (platform: Platform) => {
    return releases.filter(release => release.platform === platform);
  };

  const handleTriggerBuild = async (app_type: 'redsquare_android' | 'redsquare_ios' | 'redsquare_web' | 'screens_android_tv' | 'screens_android_mobile' | 'screens_ios' | 'screens_windows' | 'screens_macos' | 'screens_linux' | 'screens_amazon_fire' | 'screens_roku' | 'screens_samsung_tizen' | 'screens_lg_webos') => {
    setIsTriggeringBuild(true);
    setBuildSuccessfullyStarted(null); // Reset previous success state
    toast({
      title: `Triggering new ${app_type.replace(/_/g, ' ')} build...`,
      description: "You can monitor the progress in the build history table below."
    });
    try {
      const { error } = await supabase.functions.invoke('trigger-app-build', {
        body: { app_type },
      });
      if (error) {
        toast({
          title: "Failed to trigger build",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setBuildSuccessfullyStarted(app_type); // Mark this app type as successfully started
        toast({
          title: "New build successfully triggered!",
          description: "It will appear in the history table shortly."
        });
        
        // Auto-clear success state after 5 seconds
        setTimeout(() => {
          setBuildSuccessfullyStarted(null);
        }, 5000);
      }
    } catch (e) {
      console.error('Error triggering build:', e);
      toast({
        title: "An unexpected error occurred",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive"
      });
    } finally {
      setIsTriggeringBuild(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading app releases...</div>;
  }

  const currentConfig = activePlatform !== 'system_test' ? PLATFORM_CONFIG[activePlatform] : null;
  const IconComponent = currentConfig?.icon;

  const renderContent = () => {
    if (activePlatform === 'system_test') {
      return null; // Content is handled by TabsContent
    }
    
    // Desktop/Screen apps that are build-only (no manual upload)
    if (activePlatform === 'screens_windows' || activePlatform === 'screens_macos' || activePlatform === 'screens_linux' || activePlatform === 'redsquare_web') {
      return (
        <Card>
          <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle>Automated {currentConfig.name} Build</CardTitle>
                      <CardDescription>{currentConfig.description}. Use the automated build system to create the latest version.</CardDescription>
                  </div>
                  <Button 
                    onClick={() => handleTriggerBuild(activePlatform)} 
                    disabled={isTriggeringBuild}
                    variant={buildSuccessfullyStarted === activePlatform ? 'default' : 'outline'}
                    className={buildSuccessfullyStarted === activePlatform ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                  >
                      <Upload className="mr-2 h-4 w-4" />
                      {isTriggeringBuild ? 'Starting...' : 
                       buildSuccessfullyStarted === activePlatform ? '✓ Build Started Successfully!' : 
                       `Start Automated Build`}
                  </Button>
              </div>
          </CardHeader>
        </Card>
      );
    }

    // Common UI for mobile apps (Android, iOS, TV)
    return (
      <>
        {/* Available Releases Section - First */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Available {currentConfig.name} Releases
            </CardTitle>
            <CardDescription>{currentConfig.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {getPlatformReleases(activePlatform).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No {currentConfig.name} releases found. Upload your first release or trigger an automated build.
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
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">v{release.version_name}</span>
                              {release.source === 'automated' && (
                                <Badge variant="secondary" className="text-xs">Auto</Badge>
                              )}
                            </div>
                            {release.source === 'automated' && release.build_id && (
                              <div className="text-xs text-muted-foreground">
                                Build ID: {release.build_id?.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={release.is_active ? "default" : "secondary"}>
                          {release.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                       <TableCell>
                         {formatFileSize(release.file_size, release.source === 'automated')}
                       </TableCell>
                      <TableCell>
                        {release.download_count}
                      </TableCell>
                      <TableCell>
                         <div className="text-sm">
                           {format(new Date(release.created_at), 'MMM d, yyyy')}
                         </div>
                        {release.source === 'automated' && (
                          <div className="text-xs text-muted-foreground">
                            Commit: {release.release_notes?.split('commit ')[1]?.slice(0, 7) || 'unknown'}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleDownload(release)}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button size="sm" variant={release.is_active ? "secondary" : "default"} onClick={() => toggleReleaseStatus(release.id, release.is_active)}>
                            {release.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          {release.source === 'manual' ? (
                            <Button size="sm" variant="destructive" onClick={() => deleteRelease(release)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Auto
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Automated Build Section */}
        <Card>
          <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle>Automated {currentConfig.name} Build</CardTitle>
                      <CardDescription>{currentConfig.description}. Use the automated build system for the latest version.</CardDescription>
                  </div>
                  <Button 
                    onClick={() => handleTriggerBuild(activePlatform)} 
                    disabled={isTriggeringBuild}
                    variant={buildSuccessfullyStarted === activePlatform ? 'default' : 'outline'}
                    className={buildSuccessfullyStarted === activePlatform ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                  >
                      <Upload className="mr-2 h-4 w-4" />
                      {isTriggeringBuild ? 'Starting...' : 
                       buildSuccessfullyStarted === activePlatform ? '✓ Build Started Successfully!' : 
                       'Start Automated Build'}
                  </Button>
              </div>
          </CardHeader>
        </Card>

        {/* Manual Upload Section */}
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Manually Upload New {currentConfig.name} App
              </CardTitle>
              <CardDescription>
                {currentConfig.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="version-name">Version Name *</Label>
                  <Input id="version-name" placeholder="e.g., 1.0.0" value={versionName} onChange={(e) => setVersionName(e.target.value)} disabled={uploadState.isUploading}/>
                </div>
                <div>
                  <Label htmlFor="version-code">Version Code *</Label>
                  <Input id="version-code" type="number" placeholder="e.g., 1" value={versionCode} onChange={(e) => setVersionCode(e.target.value)} disabled={uploadState.isUploading}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimum-os-version">Minimum OS Version</Label>
                  <Input id="minimum-os-version" placeholder={
                    activePlatform.includes('android') ? 'e.g., 7.0' : 
                    activePlatform.includes('ios') ? 'e.g., 13.0' : 
                    'e.g., Version 10+'
                  } value={minimumOsVersion} onChange={(e) => setMinimumOsVersion(e.target.value)} disabled={uploadState.isUploading}/>
                </div>
                <div>
                  <Label htmlFor="bundle-id">Bundle/Package ID</Label>
                  <Input id="bundle-id" placeholder="e.g., com.redsquare.app" value={bundleId} onChange={(e) => setBundleId(e.target.value)} disabled={uploadState.isUploading}/>
                </div>
              </div>
              <div>
                <Label htmlFor="release-notes">Release Notes</Label>
                <Textarea id="release-notes" placeholder="What's new in this version..." value={releaseNotes} onChange={(e) => setReleaseNotes(e.target.value)} disabled={uploadState.isUploading}/>
              </div>
              <div>
                <Label htmlFor="app-file">{currentConfig.fileExtension.toUpperCase()} File *</Label>
                <Input id="app-file" type="file" accept={currentConfig.acceptedFiles} onChange={handleFileSelect} disabled={uploadState.isUploading}/>
                {selectedFile && (<p className="text-sm text-muted-foreground mt-1">Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})</p>)}
              </div>
              {uploadState.isUploading && (<div className="space-y-2"><Progress value={uploadState.progress} /><p className="text-sm text-muted-foreground">Uploading...</p></div>)}
              <Button onClick={handleUpload} disabled={uploadState.isUploading || !selectedFile || !versionName || !versionCode} className="w-full">
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
                          {step.split(' ').slice(0, -2).join(' ')}{' '}
                          <code className="bg-muted px-1 rounded">
                            {step.split(' ').slice(-2).join(' ')}
                          </code>
                        </>
                      ) : (
                        step
                      )}
                    </li>
                  ))}
                </ol>
            </AlertDescription>
           </Alert>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activePlatform} onValueChange={(value) => setActivePlatform(value as Platform)}>
        <TabsList className="grid w-full grid-cols-4">
          {/* RedSquare App Group */}
          <TabsTrigger value="redsquare_android" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            RedSquare Android
            {getPlatformReleases('redsquare_android').length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {getPlatformReleases('redsquare_android').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="redsquare_ios" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            RedSquare iOS
            {getPlatformReleases('redsquare_ios').length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {getPlatformReleases('redsquare_ios').length}
              </Badge>
            )}
          </TabsTrigger>
          {/* RedSquare Screens Group */}
          <TabsTrigger value="screens_android_tv" className="flex items-center gap-2">
            <Tv className="h-4 w-4" />
            Screens TV & Desktop
            {(() => {
              const screenReleases = releases.filter(r => r.platform.startsWith('screens_'));
              return screenReleases.length > 0 ? (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {screenReleases.length}
                </Badge>
              ) : null;
            })()}
          </TabsTrigger>
          <TabsTrigger value="system_test" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Build System
          </TabsTrigger>
        </TabsList>
        
        {/* Submenu for additional screen platforms */}
        {activePlatform.startsWith('screens_') && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={activePlatform === 'screens_android_tv' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActivePlatform('screens_android_tv')}
              >
                <Tv className="h-4 w-4 mr-1" />
                Android TV
              </Button>
              <Button 
                variant={activePlatform === 'screens_android_mobile' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActivePlatform('screens_android_mobile')}
              >
                <Smartphone className="h-4 w-4 mr-1" />
                Android Mobile
              </Button>
              <Button 
                variant={activePlatform === 'screens_ios' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActivePlatform('screens_ios')}
              >
                <Smartphone className="h-4 w-4 mr-1" />
                iOS
              </Button>
              <Button 
                variant={activePlatform === 'screens_windows' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActivePlatform('screens_windows')}
              >
                <Monitor className="h-4 w-4 mr-1" />
                Windows
              </Button>
              <Button 
                variant={activePlatform === 'screens_macos' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActivePlatform('screens_macos')}
              >
                <Monitor className="h-4 w-4 mr-1" />
                macOS
              </Button>
              <Button 
                variant={activePlatform === 'screens_linux' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActivePlatform('screens_linux')}
              >
                 <Monitor className="h-4 w-4 mr-1" />
                Linux
              </Button>
              <Button 
                variant={activePlatform === 'screens_amazon_fire' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActivePlatform('screens_amazon_fire')}
              >
                <Tv className="h-4 w-4 mr-1" />
                Amazon Fire TV
              </Button>
              <Button 
                variant={activePlatform === 'screens_roku' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActivePlatform('screens_roku')}
              >
                <Tv className="h-4 w-4 mr-1" />
                Roku
              </Button>
              <Button 
                variant={activePlatform === 'screens_samsung_tizen' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActivePlatform('screens_samsung_tizen')}
              >
                <Tv className="h-4 w-4 mr-1" />
                Samsung TV
              </Button>
              <Button 
                variant={activePlatform === 'screens_lg_webos' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActivePlatform('screens_lg_webos')}
              >
                <Tv className="h-4 w-4 mr-1" />
                LG TV
              </Button>
            </div>
          </div>
        )}
        <TabsContent value={activePlatform} className="space-y-6">
          {renderContent()}
        </TabsContent>
        <TabsContent value="system_test" className="space-y-6">
          <BuildSystemTest />
          <AppBuildHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};
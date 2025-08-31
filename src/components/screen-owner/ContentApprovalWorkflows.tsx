import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  FileText,
  Image,
  Video,
  AlertTriangle,
  Shield,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ModerationStatus } from "@/types";

interface ScreenData {
  id: string;
  screen_name?: string;
  location: string;
}

interface ContentUpload {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  user_id: string;
  screen_id?: string;
  moderation_status?: ModerationStatus;
  moderation_notes?: string;
  created_at: string;
  updated_at: string;
}

interface ModerationRule {
  id: string;
  rule_type: 'content_filter' | 'size_limit' | 'duration_limit' | 'format_restriction';
  parameters: Record<string, any>;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high';
}

interface ContentApprovalWorkflowsProps {
  screens: ScreenData[];
}

export const ContentApprovalWorkflows = ({ screens }: ContentApprovalWorkflowsProps) => {
  const { toast } = useToast();
  const [pendingContent, setPendingContent] = useState<ContentUpload[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentUpload | null>(null);
  const [moderationRules, setModerationRules] = useState<ModerationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoApprovalEnabled, setAutoApprovalEnabled] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("pending");

  useEffect(() => {
    fetchPendingContent();
    fetchModerationRules();
  }, [selectedScreen, filterStatus]);

  const fetchPendingContent = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('content_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq('moderation_status', filterStatus);
      }

      if (selectedScreen !== "all") {
        query = query.eq('screen_id', selectedScreen);
      }

      const { data, error } = await query;
      if (error) throw error;

      setPendingContent((data || []).map(content => ({
        ...content,
        moderation_status: content.moderation_status as ModerationStatus || 'pending'
      })));
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to load content for review",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchModerationRules = async () => {
    try {
      // Mock moderation rules - in real app, fetch from database
      const mockRules: ModerationRule[] = [
        {
          id: '1',
          rule_type: 'content_filter',
          parameters: { 
            blocked_keywords: ['spam', 'inappropriate', 'offensive'],
            ai_content_detection: true 
          },
          enabled: true,
          severity: 'high'
        },
        {
          id: '2',
          rule_type: 'size_limit',
          parameters: { max_size_mb: 100 },
          enabled: true,
          severity: 'medium'
        },
        {
          id: '3',
          rule_type: 'duration_limit',
          parameters: { max_duration_seconds: 300 },
          enabled: true,
          severity: 'low'
        },
        {
          id: '4',
          rule_type: 'format_restriction',
          parameters: { 
            allowed_formats: ['jpg', 'png', 'mp4', 'gif'],
            require_audio: false 
          },
          enabled: true,
          severity: 'medium'
        }
      ];

      setModerationRules(mockRules);
    } catch (error) {
      console.error('Error fetching moderation rules:', error);
    }
  };

  const handleContentReview = async (contentId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      
      const { error } = await supabase
        .from('content_uploads')
        .update({
          moderation_status: status,
          moderation_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Content Reviewed",
        description: `Content has been ${status} successfully`,
      });

      // Update local state
      setPendingContent(prev => 
        prev.map(content => 
          content.id === contentId 
            ? { ...content, moderation_status: status as ModerationStatus, moderation_notes: notes }
            : content
        )
      );

      setSelectedContent(null);
    } catch (error) {
      console.error('Error updating content status:', error);
      toast({
        title: "Error",
        description: "Failed to update content status",
        variant: "destructive"
      });
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    const pendingItems = pendingContent.filter(c => c.moderation_status === 'pending');
    
    try {
      for (const content of pendingItems) {
        await handleContentReview(content.id, action, 
          action === 'approve' ? 'Bulk approved' : 'Bulk rejected'
        );
      }
      
      toast({
        title: "Bulk Action Complete",
        description: `${pendingItems.length} items ${action}d`,
      });
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: "Error",
        description: "Failed to complete bulk action",
        variant: "destructive"
      });
    }
  };

  const toggleModerationRule = async (ruleId: string, enabled: boolean) => {
    try {
      setModerationRules(prev => 
        prev.map(rule => 
          rule.id === ruleId ? { ...rule, enabled } : rule
        )
      );

      // In real app, update database
      toast({
        title: "Rule Updated",
        description: `Moderation rule ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error updating rule:', error);
      toast({
        title: "Error",
        description: "Failed to update moderation rule",
        variant: "destructive"
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getStatusBadge = (status?: ModerationStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getRuleSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Content Approval</h2>
          <p className="text-muted-foreground">
            Review and moderate content uploaded to your screens
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedScreen} onValueChange={setSelectedScreen}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All screens" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Screens</SelectItem>
              {screens.map((screen) => (
                <SelectItem key={screen.id} value={screen.id}>
                  {screen.screen_name || `Screen ${screen.id.slice(-4)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Auto-Approval Setting */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Auto-Approval Settings
              </CardTitle>
              <CardDescription>
                Configure automatic content moderation and approval rules
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="auto-approval">Enable Auto-Approval</Label>
              <Switch
                id="auto-approval"
                checked={autoApprovalEnabled}
                onCheckedChange={setAutoApprovalEnabled}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Moderation Rules
            </h4>
            {moderationRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(enabled) => toggleModerationRule(rule.id, enabled)}
                  />
                  <div>
                    <p className="font-medium capitalize">{rule.rule_type.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      {rule.rule_type === 'content_filter' && 'AI-powered content scanning'}
                      {rule.rule_type === 'size_limit' && `Max size: ${rule.parameters.max_size_mb}MB`}
                      {rule.rule_type === 'duration_limit' && `Max duration: ${rule.parameters.max_duration_seconds}s`}
                      {rule.rule_type === 'format_restriction' && `Allowed formats: ${rule.parameters.allowed_formats?.join(', ')}`}
                    </p>
                  </div>
                </div>
                <Badge className={getRuleSeverityColor(rule.severity)}>
                  {rule.severity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {pendingContent.filter(c => c.moderation_status === 'pending').length > 0 && (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleBulkAction('approve')}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve All Pending ({pendingContent.filter(c => c.moderation_status === 'pending').length})
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleBulkAction('reject')}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject All Pending
          </Button>
        </div>
      )}

      {/* Content List */}
      <div className="space-y-4">
        {pendingContent.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Content to Review</h3>
              <p className="text-muted-foreground">
                All content has been reviewed or no content has been uploaded yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          pendingContent.map((content) => (
            <Card key={content.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
                      {getFileIcon(content.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium truncate">{content.file_name}</h4>
                        {getStatusBadge(content.moderation_status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>{content.file_type}</span>
                        <span>{formatFileSize(content.file_size)}</span>
                        <span>Uploaded {format(new Date(content.created_at), 'MMM d, HH:mm')}</span>
                      </div>
                      {content.moderation_notes && (
                        <p className="text-sm text-muted-foreground">
                          Notes: {content.moderation_notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {content.moderation_status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedContent(content)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleContentReview(content.id, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleContentReview(content.id, 'reject')}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle>Review Content</CardTitle>
              <CardDescription>
                {selectedContent.file_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-background rounded-lg mx-auto mb-2">
                  {getFileIcon(selectedContent.file_type)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Content preview would appear here
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>File Type</Label>
                  <p>{selectedContent.file_type}</p>
                </div>
                <div>
                  <Label>File Size</Label>
                  <p>{formatFileSize(selectedContent.file_size)}</p>
                </div>
                <div>
                  <Label>Upload Date</Label>
                  <p>{format(new Date(selectedContent.created_at), 'PPp')}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p>{getStatusBadge(selectedContent.moderation_status)}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="review-notes">Review Notes (Optional)</Label>
                <Textarea
                  id="review-notes"
                  placeholder="Add notes about this content review..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    const notes = (document.getElementById('review-notes') as HTMLTextAreaElement)?.value;
                    handleContentReview(selectedContent.id, 'approve', notes);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Content
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    const notes = (document.getElementById('review-notes') as HTMLTextAreaElement)?.value;
                    handleContentReview(selectedContent.id, 'reject', notes);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Content
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedContent(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
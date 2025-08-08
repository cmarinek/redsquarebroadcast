import { useState, useEffect } from "react";
import { 
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Search,
  Clock,
  User,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ContentModerationItem {
  id: string;
  content_id: string;
  screen_id: string;
  status: 'pending' | 'approved' | 'rejected';
  moderated_by?: string;
  moderation_reason?: string;
  automated_flags: any;
  created_at: string;
  content: {
    file_name: string;
    file_type: string;
    file_url: string;
    file_size: number;
  };
  screen: {
    screen_name: string;
  };
}

interface ContentApprovalWorkflowsProps {
  screens: Array<{ id: string; screen_name: string; }>;
}

export const ContentApprovalWorkflows = ({ screens }: ContentApprovalWorkflowsProps) => {
  const { toast } = useToast();
  const [contentItems, setContentItems] = useState<ContentModerationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ContentModerationItem | null>(null);
  const [moderationReason, setModerationReason] = useState("");

  useEffect(() => {
    fetchModerationItems();
  }, [selectedScreen]);

  const fetchModerationItems = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('content_moderation')
        .select(`
          *,
          content_uploads!inner(file_name, file_type, file_url, file_size),
          screens!inner(screen_name)
        `);

      if (selectedScreen !== "all") {
        query = query.eq('screen_id', selectedScreen);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const processedItems: ContentModerationItem[] = data?.map(item => ({
        id: item.id,
        content_id: item.content_id,
        screen_id: item.screen_id,
        status: item.status as 'pending' | 'approved' | 'rejected',
        moderated_by: item.moderated_by,
        moderation_reason: item.moderation_reason,
        automated_flags: item.automated_flags || {},
        created_at: item.created_at,
        content: (item as any).content_uploads,
        screen: (item as any).screens
      })) || [];

      setContentItems(processedItems);
    } catch (error) {
      console.error("Error fetching moderation items:", error);
      toast({
        title: "Error loading content",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const moderateContent = async (itemId: string, status: 'approved' | 'rejected', reason?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('content_moderation')
        .update({
          status,
          moderation_reason: reason,
          moderated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: `Content ${status}`,
        description: `The content has been ${status} successfully.`,
      });

      fetchModerationItems();
      setSelectedItem(null);
      setModerationReason("");
    } catch (error) {
      console.error("Error moderating content:", error);
      toast({
        title: "Error moderating content",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredItems = contentItems.filter(item => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesSearch = item.content.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.screen.screen_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = contentItems.filter(item => item.status === 'pending').length;
  const approvedCount = contentItems.filter(item => item.status === 'approved').length;
  const rejectedCount = contentItems.filter(item => item.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Content Approval Workflows
              </CardTitle>
              <CardDescription>
                Review and moderate content before it goes live on your screens
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Pending Review</p>
                <p className="text-2xl font-bold text-amber-900">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Approved</p>
                <p className="text-2xl font-bold text-emerald-900">{approvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Rejected</p>
                <p className="text-2xl font-bold text-red-900">{rejectedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by file name or screen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedScreen} onValueChange={setSelectedScreen}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All screens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Screens</SelectItem>
                {screens.map((screen) => (
                  <SelectItem key={screen.id} value={screen.id}>
                    {screen.screen_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      <Card>
        <CardHeader>
          <CardTitle>Content Moderation Queue</CardTitle>
          <CardDescription>
            Review uploaded content and approve or reject for broadcast
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredItems.length > 0 ? (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <div className="flex-shrink-0">
                    {item.content.file_type.startsWith('image/') ? (
                      <img
                        src={item.content.file_url}
                        alt={item.content.file_name}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{item.content.file_name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Screen: {item.screen.screen_name}</span>
                          <span>•</span>
                          <span>Size: {(item.content.file_size / 1024 / 1024).toFixed(1)} MB</span>
                          <span>•</span>
                          <span>Uploaded: {format(new Date(item.created_at), 'MMM d, h:mm a')}</span>
                        </div>
                        {item.moderation_reason && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Reason: {item.moderation_reason}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(item.status)} border flex items-center gap-1`}>
                          {getStatusIcon(item.status)}
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Content Review</DialogTitle>
                          <DialogDescription>
                            Review this content and decide whether to approve or reject it
                          </DialogDescription>
                        </DialogHeader>
                        {selectedItem && (
                          <div className="space-y-4">
                            <div className="text-center">
                              {selectedItem.content.file_type.startsWith('image/') ? (
                                <img
                                  src={selectedItem.content.file_url}
                                  alt={selectedItem.content.file_name}
                                  className="max-w-full max-h-96 mx-auto rounded border"
                                />
                              ) : selectedItem.content.file_type.startsWith('video/') ? (
                                <video
                                  src={selectedItem.content.file_url}
                                  controls
                                  className="max-w-full max-h-96 mx-auto rounded border"
                                />
                              ) : (
                                <div className="p-8 bg-muted rounded border text-center">
                                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                                  <p className="font-medium">{selectedItem.content.file_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedItem.content.file_type}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="text-sm font-medium">File Name:</label>
                                <p className="text-sm text-muted-foreground">{selectedItem.content.file_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Screen:</label>
                                <p className="text-sm text-muted-foreground">{selectedItem.screen.screen_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">File Size:</label>
                                <p className="text-sm text-muted-foreground">
                                  {(selectedItem.content.file_size / 1024 / 1024).toFixed(1)} MB
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Uploaded:</label>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(selectedItem.created_at), 'MMM d, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>

                            {selectedItem.status === 'pending' && (
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Add a reason for rejection (optional for approval)..."
                                  value={moderationReason}
                                  onChange={(e) => setModerationReason(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => moderateContent(selectedItem.id, 'rejected', moderationReason)}
                                    disabled={loading}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button
                                    onClick={() => moderateContent(selectedItem.id, 'approved', moderationReason)}
                                    disabled={loading}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No content to review</h3>
              <p className="text-muted-foreground">
                All uploaded content has been moderated
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, XCircle, Eye, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface ContentItem {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  moderation_status: string;
  moderation_notes: string | null;
  created_at: string;
  user_id: string;
  user_email: string;
  moderation_result: any;
}

export function ContentModerationDashboard() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("content_uploads")
        .select(`
          *,
          profiles:user_id (
            email,
            display_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setContent(
        data?.map((item: any) => ({
          id: item.id,
          file_name: item.file_name,
          file_path: item.file_path,
          file_type: item.file_type,
          moderation_status: item.moderation_status || "pending",
          moderation_notes: item.moderation_notes,
          created_at: item.created_at,
          user_id: item.user_id,
          user_email: item.profiles?.email || "N/A",
          moderation_result: item.moderation_result,
        })) || []
      );
    } catch (error: any) {
      toast({
        title: "Error loading content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateModerationStatus = async (
    contentId: string,
    status: string,
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from("content_uploads")
        .update({
          moderation_status: status,
          moderation_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", contentId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Content marked as ${status}`,
      });

      fetchContent();
      setSelectedContent(null);
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: AlertCircle },
      approved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle },
    };

    const { variant, icon: Icon } = variants[status] || variants.pending;

    return (
      <Badge variant={variant}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const pendingCount = content.filter((c) => c.moderation_status === "pending").length;
  const approvedCount = content.filter((c) => c.moderation_status === "approved").length;
  const rejectedCount = content.filter((c) => c.moderation_status === "rejected").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Content Moderation</h2>
          <p className="text-muted-foreground">Review and moderate uploaded content</p>
        </div>
        <Button onClick={fetchContent} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting moderation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">Safe content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">Flagged content</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Content</TabsTrigger>
        </TabsList>

        {["pending", "approved", "rejected", "all"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {tab === "all" ? "All Content" : `${tab.charAt(0).toUpperCase() + tab.slice(1)} Content`}
                </CardTitle>
                <CardDescription>
                  Review and moderate user-uploaded content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content
                    .filter((c) => tab === "all" || c.moderation_status === tab)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{item.file_name}</p>
                            {getStatusBadge(item.moderation_status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Uploaded by {item.user_email} •{" "}
                            {format(new Date(item.created_at), "MMM d, yyyy h:mm a")}
                          </p>
                          {item.moderation_notes && (
                            <p className="text-sm text-muted-foreground italic">
                              Note: {item.moderation_notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedContent(item)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Review
                          </Button>
                          {item.moderation_status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => updateModerationStatus(item.id, "approved")}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  updateModerationStatus(
                                    item.id,
                                    "rejected",
                                    "Content violates community guidelines"
                                  )
                                }
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                  {content.filter((c) => tab === "all" || c.moderation_status === tab)
                    .length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No {tab !== "all" && tab} content to review
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

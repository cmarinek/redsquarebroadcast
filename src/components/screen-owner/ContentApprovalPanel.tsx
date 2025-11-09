import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, AlertTriangle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ContentUpload {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  user_id: string;
  moderation_status: string | null;
  moderation_notes: string | null;
  created_at: string;
  screen_id: string | null;
}

export const ContentApprovalPanel = ({ screenId }: { screenId?: string }) => {
  const [pendingContent, setPendingContent] = useState<ContentUpload[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentUpload | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPendingContent = async () => {
    try {
      let query = supabase
        .from('content_uploads')
        .select('*')
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false });

      if (screenId) {
        query = query.eq('screen_id', screenId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPendingContent(data || []);
    } catch (error) {
      console.error('Error fetching pending content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending content",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchPendingContent();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('content_uploads_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_uploads'
        },
        () => {
          fetchPendingContent();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [screenId]);

  const handleApprove = async (contentId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('content_uploads')
        .update({
          moderation_status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Content Approved",
        description: "Content has been approved for broadcasting"
      });

      fetchPendingContent();
    } catch (error) {
      console.error('Error approving content:', error);
      toast({
        title: "Error",
        description: "Failed to approve content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedContent || !rejectionReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a rejection reason",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('content_uploads')
        .update({
          moderation_status: 'rejected',
          moderation_notes: rejectionReason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', selectedContent.id);

      if (error) throw error;

      toast({
        title: "Content Rejected",
        description: "Content has been rejected"
      });

      setReviewDialogOpen(false);
      setSelectedContent(null);
      setRejectionReason("");
      fetchPendingContent();
    } catch (error) {
      console.error('Error rejecting content:', error);
      toast({
        title: "Error",
        description: "Failed to reject content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (content: ContentUpload) => {
    setSelectedContent(content);
    setReviewDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Content Approval Queue</h3>
          <Badge variant="outline">
            {pendingContent.length} Pending
          </Badge>
        </div>

        {pendingContent.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground">No content pending review</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingContent.map((content) => (
              <Card key={content.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        {content.file_name || 'Unknown File'}
                      </h4>
                      <Badge variant="outline">
                        {content.file_type || 'Unknown'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(content.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {content.file_path && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(content.file_path, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(content.id)}
                      disabled={loading}
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReviewDialog(content)}
                      disabled={loading}
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Content</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedContent && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedContent.file_name}</p>
                <p className="text-sm text-muted-foreground">
                  Type: {selectedContent.file_type}
                </p>
              </div>
            )}
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewDialogOpen(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading || !rejectionReason.trim()}
            >
              Reject Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

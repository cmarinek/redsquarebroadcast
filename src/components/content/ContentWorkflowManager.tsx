import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Filter,
  Search
} from "lucide-react";

interface ContentItem {
  id: string;
  fileName: string;
  uploader: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  fileType: 'image' | 'video' | 'gif';
  fileSize: string;
  moderationNotes?: string;
  tags: string[];
}

const mockContentItems: ContentItem[] = [
  {
    id: '1',
    fileName: 'summer_promo.mp4',
    uploader: 'John Doe',
    uploadedAt: '2024-01-15T10:30:00Z',
    status: 'pending',
    fileType: 'video',
    fileSize: '15.2 MB',
    tags: ['promo', 'summer', 'sale']
  },
  {
    id: '2',
    fileName: 'brand_logo.png',
    uploader: 'Jane Smith',
    uploadedAt: '2024-01-15T09:15:00Z',
    status: 'approved',
    fileType: 'image',
    fileSize: '2.1 MB',
    tags: ['logo', 'brand']
  },
  {
    id: '3',
    fileName: 'event_banner.gif',
    uploader: 'Mike Johnson',
    uploadedAt: '2024-01-15T08:45:00Z',
    status: 'under_review',
    fileType: 'gif',
    fileSize: '5.8 MB',
    moderationNotes: 'Checking brand compliance',
    tags: ['event', 'banner']
  }
];

export const ContentWorkflowManager = () => {
  const { toast } = useToast();
  const [contentItems, setContentItems] = useState<ContentItem[]>(mockContentItems);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleApprove = (itemId: string) => {
    setContentItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, status: 'approved' }
        : item
    ));
    toast({
      title: "Content Approved",
      description: "Content has been approved for broadcasting.",
    });
  };

  const handleReject = (itemId: string, reason: string) => {
    setContentItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, status: 'rejected', moderationNotes: reason }
        : item
    ));
    toast({
      title: "Content Rejected",
      description: "Content has been rejected with feedback.",
      variant: "destructive"
    });
  };

  const handleBulkAction = (action: 'approve' | 'reject') => {
    if (selectedItems.length === 0) return;

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    setContentItems(prev => prev.map(item => 
      selectedItems.includes(item.id)
        ? { ...item, status: newStatus }
        : item
    ));

    toast({
      title: `Bulk ${action === 'approve' ? 'Approval' : 'Rejection'}`,
      description: `${selectedItems.length} items have been ${action}d.`,
    });

    setSelectedItems([]);
  };

  const getStatusIcon = (status: ContentItem['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'under_review':
        return <Eye className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: ContentItem['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredItems = contentItems.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.uploader.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Content Workflow Manager</h2>
        <p className="text-muted-foreground">
          Review, moderate, and manage content submissions
        </p>
      </div>

      <Tabs defaultValue="moderation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
          <TabsTrigger value="analytics">Workflow Analytics</TabsTrigger>
          <TabsTrigger value="settings">Workflow Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Queue
              </CardTitle>
              <CardDescription>
                Review and moderate content submissions from users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters and Search */}
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <div className="flex gap-2 p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedItems.length} items selected
                  </span>
                  <Button size="sm" onClick={() => handleBulkAction('approve')}>
                    Bulk Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('reject')}>
                    Bulk Reject
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedItems([])}>
                    Clear Selection
                  </Button>
                </div>
              )}

              {/* Content Items */}
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-lg ${
                      selectedItems.includes(item.id) ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems(prev => [...prev, item.id]);
                            } else {
                              setSelectedItems(prev => prev.filter(id => id !== item.id));
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{item.fileName}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {item.uploader}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.uploadedAt).toLocaleString()}
                            </span>
                            <span>{item.fileSize}</span>
                          </div>
                          <div className="flex gap-1 mt-1">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          {item.moderationNotes && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                              <span className="flex items-center gap-1 font-medium text-muted-foreground">
                                <AlertCircle className="h-3 w-3" />
                                Moderation Notes:
                              </span>
                              {item.moderationNotes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(item.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(item.status)}
                            {item.status.replace('_', ' ')}
                          </span>
                        </Badge>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          {item.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleApprove(item.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleReject(item.id, 'Content policy violation')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Analytics</CardTitle>
              <CardDescription>
                Track content moderation performance and workflow efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">156</div>
                    <p className="text-sm text-muted-foreground">Pending Reviews</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">2.4h</div>
                    <p className="text-sm text-muted-foreground">Avg Review Time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">94.2%</div>
                    <p className="text-sm text-muted-foreground">Approval Rate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">1,247</div>
                    <p className="text-sm text-muted-foreground">Total Processed</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
              <CardDescription>
                Configure content moderation rules and workflow preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Auto-approval threshold</label>
                <Select defaultValue="high">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low confidence (60%)</SelectItem>
                    <SelectItem value="medium">Medium confidence (80%)</SelectItem>
                    <SelectItem value="high">High confidence (95%)</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content policy notes</label>
                <Textarea 
                  placeholder="Enter content policy guidelines..."
                  className="min-h-20"
                />
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
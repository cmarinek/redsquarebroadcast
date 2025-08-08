import { useState, useEffect } from "react";
import { 
  Layers,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Monitor,
  MoreHorizontal,
  Settings,
  Grid,
  List,
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ScreenGroup {
  id: string;
  group_name: string;
  description: string;
  screen_count: number;
  total_revenue: number;
  created_at: string;
}

interface ScreenData {
  id: string;
  screen_name: string;
  address: string;
  city: string;
  price_per_hour: number;
  is_active: boolean;
  group_id?: string | null;
  group_name?: string;
}

interface ScreenNetworkManagementProps {
  screens: ScreenData[];
  onRefresh: () => void;
}

export const ScreenNetworkManagement = ({ screens, onRefresh }: ScreenNetworkManagementProps) => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<ScreenGroup[]>([]);
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ScreenGroup | null>(null);
  const [groupForm, setGroupForm] = useState({ group_name: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data: groupsData, error } = await supabase
        .from('screen_groups')
        .select(`
          *,
          screens!group_id(count)
        `);

      if (error) throw error;

      // Process groups with screen counts
      const processedGroups = groupsData?.map(group => ({
        id: group.id,
        group_name: group.group_name,
        description: group.description,
        screen_count: group.screens?.[0]?.count || 0,
        total_revenue: Math.floor(Math.random() * 5000), // Mock revenue
        created_at: group.created_at
      })) || [];

      setGroups(processedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error loading groups",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const createGroup = async () => {
    if (!groupForm.group_name.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('screen_groups')
        .insert({
          group_name: groupForm.group_name,
          description: groupForm.description,
          owner_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Group created",
        description: `"${groupForm.group_name}" has been created successfully.`,
      });

      setGroupForm({ group_name: '', description: '' });
      setIsGroupDialogOpen(false);
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error creating group",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const assignScreensToGroup = async (groupId: string) => {
    if (selectedScreens.length === 0) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('screens')
        .update({ group_id: groupId })
        .in('id', selectedScreens);

      if (error) throw error;

      toast({
        title: "Screens assigned",
        description: `${selectedScreens.length} screens assigned to group.`,
      });

      setSelectedScreens([]);
      onRefresh();
      fetchGroups();
    } catch (error) {
      console.error("Error assigning screens:", error);
      toast({
        title: "Error assigning screens",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateScreens = async (updates: { price?: number; active?: boolean }) => {
    if (selectedScreens.length === 0) return;

    setLoading(true);
    try {
      const updateData: any = {};
      if (updates.price !== undefined) updateData.price_per_hour = updates.price * 100; // Convert to cents
      if (updates.active !== undefined) updateData.is_active = updates.active;

      const { error } = await supabase
        .from('screens')
        .update(updateData)
        .in('id', selectedScreens);

      if (error) throw error;

      toast({
        title: "Screens updated",
        description: `${selectedScreens.length} screens updated successfully.`,
      });

      setSelectedScreens([]);
      onRefresh();
    } catch (error) {
      console.error("Error updating screens:", error);
      toast({
        title: "Error updating screens",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (groupId: string) => {
    setLoading(true);
    try {
      // First, remove group assignment from screens
      await supabase
        .from('screens')
        .update({ group_id: null })
        .eq('group_id', groupId);

      // Then delete the group
      const { error } = await supabase
        .from('screen_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: "Group deleted",
        description: "Group has been deleted and screens unassigned.",
      });

      fetchGroups();
      onRefresh();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Error deleting group",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredScreens = screens.filter(screen =>
    screen.screen_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    screen.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    screen.group_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedScreensData = screens.filter(screen => selectedScreens.includes(screen.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Screen Network Management
              </CardTitle>
              <CardDescription>
                Organize screens into groups and perform bulk operations
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Screen Group</DialogTitle>
                    <DialogDescription>
                      Organize your screens into groups for easier management
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="group_name">Group Name</Label>
                      <Input
                        id="group_name"
                        value={groupForm.group_name}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, group_name: e.target.value }))}
                        placeholder="e.g., Downtown Locations"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={groupForm.description}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Optional description for this group"
                      />
                    </div>
                    <Button onClick={createGroup} disabled={loading || !groupForm.group_name.trim()}>
                      Create Group
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Screen Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Screen Groups</CardTitle>
          <CardDescription>Manage your screen groups and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {groups.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <div key={group.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{group.group_name}</h4>
                      {group.description && (
                        <p className="text-sm text-muted-foreground">{group.description}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => assignScreensToGroup(group.id)}>
                          Assign Selected Screens
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteGroup(group.id)} className="text-red-600">
                          Delete Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{group.screen_count} screens</span>
                    <Badge variant="outline">${group.total_revenue}/month</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No groups created</h3>
              <p className="text-muted-foreground mb-4">
                Create groups to organize your screens by location or category
              </p>
              <Button onClick={() => setIsGroupDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Group
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      {selectedScreens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Operations</CardTitle>
            <CardDescription>
              {selectedScreens.length} screen{selectedScreens.length > 1 ? 's' : ''} selected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => bulkUpdateScreens({ active: true })}
                disabled={loading}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Activate All
              </Button>
              <Button
                variant="outline"
                onClick={() => bulkUpdateScreens({ active: false })}
                disabled={loading}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Deactivate All
              </Button>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="New price per hour"
                  className="w-40"
                  id="bulk-price"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById('bulk-price') as HTMLInputElement;
                    const price = parseFloat(input.value);
                    if (price > 0) bulkUpdateScreens({ price });
                  }}
                  disabled={loading}
                >
                  Update Price
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedScreens([])}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Screen Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Screen Management</CardTitle>
              <CardDescription>Select screens for bulk operations</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search screens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredScreens.map((screen) => (
                <div
                  key={screen.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedScreens.includes(screen.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    setSelectedScreens(prev =>
                      prev.includes(screen.id)
                        ? prev.filter(id => id !== screen.id)
                        : [...prev, screen.id]
                    );
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2">
                       <Checkbox
                        checked={selectedScreens.includes(screen.id)}
                        onCheckedChange={() => {}}
                        className="mt-1"
                      />
                      <div>
                        <h4 className="font-semibold">{screen.screen_name}</h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {screen.address}, {screen.city}
                        </div>
                      </div>
                    </div>
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={screen.is_active ? 'default' : 'secondary'}>
                      {screen.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm font-medium">
                      ${(screen.price_per_hour / 100).toFixed(0)}/hr
                    </span>
                  </div>
                  {screen.group_name && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {screen.group_name}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredScreens.map((screen) => (
                <div
                  key={screen.id}
                  className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedScreens.includes(screen.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    setSelectedScreens(prev =>
                      prev.includes(screen.id)
                        ? prev.filter(id => id !== screen.id)
                        : [...prev, screen.id]
                    );
                  }}
                >
                        <Checkbox
                          checked={selectedScreens.includes(screen.id)}
                          onCheckedChange={() => {}}
                        />
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{screen.screen_name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={screen.is_active ? 'default' : 'secondary'}>
                          {screen.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-sm font-medium">
                          ${(screen.price_per_hour / 100).toFixed(0)}/hr
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{screen.address}, {screen.city}</span>
                      {screen.group_name && (
                        <Badge variant="outline" className="text-xs">
                          {screen.group_name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/hooks/useUserRoles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, UserCog, Search } from "lucide-react";

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at?: string;
};

const roleLabel: Record<UserRole, string> = {
  broadcaster: "Broadcaster",
  screen_owner: "Screen Owner",
  admin: "Admin",
};

const roleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case "admin":
      return "default" as const;
    case "screen_owner":
      return "secondary" as const;
    case "broadcaster":
      return "outline" as const;
    default:
      return "outline" as const;
  }
};

export function AdminRoleManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [pendingChange, setPendingChange] = useState<{ user_id: string; newRole: UserRole } | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async () => {
      console.log("[AdminRoleManager] fetching profiles");
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, role, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProfileRow[];
    },
    meta: {
      onError: (err: any) => {
        console.error("[AdminRoleManager] fetch error", err);
      },
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const t = q.trim().toLowerCase();
    if (!t) return data;
    return data.filter((p) => {
      const dn = p.display_name?.toLowerCase() ?? "";
      return dn.includes(t) || p.user_id.toLowerCase().includes(t) || p.role.toLowerCase().includes(t);
    });
  }, [data, q]);

  const applyRoleChange = async (targetUserId: string, newRole: UserRole) => {
    console.log("[AdminRoleManager] update role", { targetUserId, newRole });
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("user_id", targetUserId);
    if (error) {
      console.error("[AdminRoleManager] update error", error);
      toast({
        title: "Failed to change role",
        description: error.message ?? "Please try again.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Role updated", description: `User role set to ${roleLabel[newRole]}` });
    setPendingChange(null);
    refetch();
  };

  const confirmChange = (row: ProfileRow, newRole: UserRole) => {
    // If switching away from admin or affecting self, show confirm dialog
    if (row.role === "admin" && newRole !== "admin") {
      setPendingChange({ user_id: row.user_id, newRole });
      return;
    }
    if (user?.id === row.user_id && newRole !== "admin") {
      setPendingChange({ user_id: row.user_id, newRole });
      return;
    }
    applyRoleChange(row.user_id, newRole);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            User Roles
          </CardTitle>
          <CardDescription>Promote or demote user roles. Only admins can access this.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, id, or role…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <div className="animate-pulse h-8 bg-muted rounded" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    No users found
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((row) => (
                <TableRow key={row.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={row.avatar_url ?? undefined} />
                        <AvatarFallback>
                          {(row.display_name?.[0] ?? row.user_id?.[0] ?? "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{row.display_name ?? "Anonymous"}</div>
                        <div className="text-xs text-muted-foreground">{row.user_id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant(row.role)} className="capitalize">
                      {roleLabel[row.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant={row.role === "broadcaster" ? "default" : "outline"}
                        size="sm"
                        onClick={() => confirmChange(row, "broadcaster")}
                      >
                        Broadcaster
                      </Button>
                      <Button
                        variant={row.role === "screen_owner" ? "default" : "outline"}
                        size="sm"
                        onClick={() => confirmChange(row, "screen_owner")}
                      >
                        Screen Owner
                      </Button>
                      <Button
                        variant={row.role === "admin" ? "default" : "outline"}
                        size="sm"
                        onClick={() => confirmChange(row, "admin")}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Admin
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog open={!!pendingChange} onOpenChange={(open) => !open && setPendingChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm role change</AlertDialogTitle>
            <AlertDialogDescription>
              You are changing an Admin to a non-admin role. If this is the last admin, the change will be blocked.
              Proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingChange) {
                  applyRoleChange(pendingChange.user_id, pendingChange.newRole);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default AdminRoleManager;

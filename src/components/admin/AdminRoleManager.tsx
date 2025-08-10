
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Shield, UserCog, Search } from "lucide-react";

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole; // legacy single role on profiles; not used for logic anymore
  created_at?: string;
};

type RoleRow = {
  user_id: string;
  role: UserRole;
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
  const [pendingChange, setPendingChange] = useState<{ user_id: string } | null>(null);

  const { data: profiles, isLoading: profilesLoading, refetch: refetchProfiles } = useQuery({
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
        console.error("[AdminRoleManager] profiles fetch error", err);
      },
    },
  });

  const userIds = useMemo(() => (profiles ?? []).map(p => p.user_id), [profiles]);

  const { data: roles, isLoading: rolesLoading, refetch: refetchRoles } = useQuery({
    queryKey: ["admin", "user_roles", userIds],
    enabled: userIds.length > 0,
    queryFn: async () => {
      console.log("[AdminRoleManager] fetching user_roles for", userIds.length, "users");
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);
      if (error) throw error;
      return (data ?? []) as RoleRow[];
    },
    meta: {
      onError: (err: any) => {
        console.error("[AdminRoleManager] user_roles fetch error", err);
      },
    },
  });

  const rolesByUser = useMemo(() => {
    const map: Record<string, UserRole[]> = {};
    (roles ?? []).forEach((row) => {
      if (!map[row.user_id]) map[row.user_id] = [];
      map[row.user_id].push(row.role);
    });
    return map;
  }, [roles]);

  const filtered = useMemo(() => {
    if (!profiles) return [];
    const t = q.trim().toLowerCase();
    if (!t) return profiles;
    return profiles.filter((p) => {
      const dn = p.display_name?.toLowerCase() ?? "";
      const rolesText = (rolesByUser[p.user_id] ?? []).join(",").toLowerCase();
      return dn.includes(t) || p.user_id.toLowerCase().includes(t) || rolesText.includes(t);
    });
  }, [profiles, q, rolesByUser]);

  const applyToggleRole = async (targetUserId: string, role: UserRole) => {
    const currentRoles = rolesByUser[targetUserId] ?? [];
    const isActive = currentRoles.includes(role);

    console.log("[AdminRoleManager] toggle role", { targetUserId, role, isActive });

    if (isActive) {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", targetUserId)
        .eq("role", role);
      if (error) {
        console.error("[AdminRoleManager] delete role error", error);
        toast({
          title: "Failed to remove role",
          description: error.message ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Role removed", description: `${roleLabel[role]} removed` });
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: targetUserId, role } as any);
      if (error) {
        console.error("[AdminRoleManager] insert role error", error);
        toast({
          title: "Failed to add role",
          description: error.message ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Role added", description: `${roleLabel[role]} granted` });
    }

    await Promise.all([refetchRoles(), refetchProfiles()]);
  };

  const confirmToggle = (row: ProfileRow, role: UserRole) => {
    const currentRoles = rolesByUser[row.user_id] ?? [];
    const isActive = currentRoles.includes(role);

    // Only confirm when removing the admin role
    if (role === "admin" && isActive) {
      setPendingChange({ user_id: row.user_id });
      return;
    }

    // If affecting own admin removal, also confirm (handled above as it's removing admin)
    applyToggleRole(row.user_id, role);
  };

  const isBusy = profilesLoading || rolesLoading;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            User Roles
          </CardTitle>
          <CardDescription>Grant or revoke multiple roles per user. Only admins can access this.</CardDescription>
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
          <Button variant="outline" onClick={() => { refetchProfiles(); refetchRoles(); }}>Refresh</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isBusy && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <div className="animate-pulse h-8 bg-muted rounded" />
                  </TableCell>
                </TableRow>
              )}
              {!isBusy && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    No users found
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((row) => {
                const userRoles = rolesByUser[row.user_id] ?? [];
                const isBroadcaster = userRoles.includes("broadcaster");
                const isScreenOwner = userRoles.includes("screen_owner");
                const isAdmin = userRoles.includes("admin");
                return (
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
                      <div className="flex flex-wrap gap-1">
                        {userRoles.length === 0 && (
                          <Badge variant="outline" className="capitalize">None</Badge>
                        )}
                        {userRoles.map((r) => (
                          <Badge key={r} variant={roleBadgeVariant(r)} className="capitalize">
                            {roleLabel[r]}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant={isBroadcaster ? "default" : "outline"}
                          size="sm"
                          onClick={() => confirmToggle(row, "broadcaster")}
                        >
                          Broadcaster
                        </Button>
                        <Button
                          variant={isScreenOwner ? "default" : "outline"}
                          size="sm"
                          onClick={() => confirmToggle(row, "screen_owner")}
                        >
                          Screen Owner
                        </Button>
                        <Button
                          variant={isAdmin ? "default" : "outline"}
                          size="sm"
                          onClick={() => confirmToggle(row, "admin")}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Admin
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog open={!!pendingChange} onOpenChange={(open) => !open && setPendingChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm admin removal</AlertDialogTitle>
            <AlertDialogDescription>
              You are removing the Admin role. If this is the last admin, the change will be blocked.
              Proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingChange) {
                  applyToggleRole(pendingChange.user_id, "admin");
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

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserRole } from "@/hooks/useUserRoles";
import { Shield, UserCog, Search } from "lucide-react";
import { optimizeImageUrl } from "@/utils/media";
import { DatabaseService } from "@/services/DatabaseService";
import { NotificationService } from "@/services/NotificationService";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { BaseCard } from "@/components/shared/BaseCard";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type UserWithRoles = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at?: string;
  email?: string;
  roles: UserRole[];
};

const roleLabel: Record<UserRole, string> = {
  advertiser: "Advertiser",
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
    case "advertiser":
    case "broadcaster":
      return "outline" as const;
    default:
      return "outline" as const;
  }
};

export function AdminRoleManager() {
  const [q, setQ] = useState("");
  const [pendingChange, setPendingChange] = useState<{ user_id: string } | null>(null);

  const { data: profiles, isLoading: profilesLoading, refetch: refetchProfiles } = useQuery({
    queryKey: ["admin", "all_users"],
    queryFn: DatabaseService.getAllUsers,
  });

  const userIds = useMemo(() => (profiles ?? []).map(p => p.user_id), [profiles]);

  const { data: roles, isLoading: rolesLoading, refetch: refetchRoles } = useQuery({
    queryKey: ["admin", "user_roles", userIds],
    enabled: userIds.length > 0,
    queryFn: () => DatabaseService.getUserRoles(userIds),
  });

  const rolesByUser = useMemo(() => {
    const map: Record<string, UserRole[]> = {};
    (roles ?? []).forEach((row) => {
      if (!map[row.user_id]) map[row.user_id] = [];
      map[row.user_id].push(row.role);
    });
    return map;
  }, [roles]);

  const usersWithRoles: UserWithRoles[] = useMemo(() => {
    return (profiles ?? []).map(profile => ({
      ...profile,
      roles: rolesByUser[profile.user_id] ?? []
    }));
  }, [profiles, rolesByUser]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return usersWithRoles;
    return usersWithRoles.filter((user) => {
      const dn = user.display_name?.toLowerCase() ?? "";
      const email = user.email?.toLowerCase() ?? "";
      const rolesText = user.roles.join(",").toLowerCase();
      return dn.includes(t) || user.user_id.toLowerCase().includes(t) || rolesText.includes(t) || email.includes(t);
    });
  }, [usersWithRoles, q]);

  const { execute: toggleRole } = useAsyncOperation(
    async (userId: string, role: UserRole) => {
      const currentRoles = rolesByUser[userId] ?? [];
      const isActive = currentRoles.includes(role);
      
      const result = await DatabaseService.toggleUserRole(userId, role, isActive);
      
      NotificationService.success(
        `${roleLabel[role]} role ${result.action}`,
        { duration: 2000 }
      );
      
      await Promise.all([refetchRoles(), refetchProfiles()]);
    },
    { showErrorToast: true }
  );

  const confirmToggle = (user: UserWithRoles, role: UserRole) => {
    const isActive = user.roles.includes(role);
    
    // Only confirm when removing the admin role
    if (role === "admin" && isActive) {
      setPendingChange({ user_id: user.user_id });
      return;
    }
    
    toggleRole(user.user_id, role);
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (user: UserWithRoles) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={optimizeImageUrl(user.avatar_url, { w: 64, h: 64, q: 70 }) ?? undefined} />
            <AvatarFallback>
              {(user.display_name?.[0] ?? user.user_id?.[0] ?? "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.display_name ?? "Anonymous"}</div>
            <div className="text-xs text-muted-foreground">
              {user.email && <div>{user.email}</div>}
              <div>{user.user_id}</div>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (user: UserWithRoles) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.length === 0 ? (
            <StatusBadge status="idle" />
          ) : (
            user.roles.map((role) => (
              <StatusBadge 
                key={role} 
                status={role === 'admin' ? 'critical' : role === 'screen_owner' ? 'medium' : 'low'} 
              />
            ))
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (user: UserWithRoles) => {
        const isAdvertiser = user.roles.includes("advertiser") || user.roles.includes("broadcaster");
        const isScreenOwner = user.roles.includes("screen_owner");
        const isAdmin = user.roles.includes("admin");
        
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant={isAdvertiser ? "default" : "outline"}
              size="sm"
              onClick={() => confirmToggle(user, "advertiser")}
            >
              Advertiser
            </Button>
            <Button
              variant={isScreenOwner ? "default" : "outline"}
              size="sm"
              onClick={() => confirmToggle(user, "screen_owner")}
            >
              Screen Owner
            </Button>
            <Button
              variant={isAdmin ? "default" : "outline"}
              size="sm"
              onClick={() => confirmToggle(user, "admin")}
            >
              <Shield className="h-4 w-4 mr-1" />
              Admin
            </Button>
          </div>
        );
      }
    }
  ];

  const isBusy = profilesLoading || rolesLoading;

  return (
    <>
      <BaseCard
        title="User Roles"
        description="Grant or revoke multiple roles per user. Only admins can access this."
        icon={UserCog}
        loading={isBusy}
        actions={
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, id, or role…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => { refetchProfiles(); refetchRoles(); }}
            >
              Refresh
            </Button>
          </div>
        }
      >
        <DataTable
          data={filtered}
          columns={columns}
          loading={isBusy}
          emptyMessage="No users found"
          keyExtractor={(user) => user.user_id}
        />
      </BaseCard>

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
                  toggleRole(pendingChange.user_id, "admin");
                  setPendingChange(null);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default AdminRoleManager;
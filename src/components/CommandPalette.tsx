import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  Map,
  MonitorPlay,
  BarChart3,
  User,
  Settings,
  HelpCircle,
  BookOpen,
  Shield,
  Upload,
  Calendar,
  CreditCard,
  LogOut,
  Search,
  Smartphone,
  Cast,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  keywords?: string[];
  requiresAuth?: boolean;
  roles?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdvertiser, isScreenOwner, isAdmin } = useUserRoles();

  // Toggle command palette with Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  // Define all available commands
  const commands: Command[] = [
    // Navigation
    {
      id: "home",
      label: "Go to Home",
      description: "Return to the homepage",
      icon: Home,
      action: () => navigate("/"),
      keywords: ["homepage", "main", "start"],
    },
    {
      id: "discover",
      label: "Discover Screens",
      description: "Find digital screens to advertise on",
      icon: Map,
      action: () => navigate("/discover"),
      keywords: ["search", "find", "screens", "map", "locations"],
    },
    {
      id: "how-it-works",
      label: "How It Works",
      description: "Learn about RedSquare",
      icon: HelpCircle,
      action: () => navigate("/how-it-works"),
      keywords: ["help", "guide", "tutorial", "learn"],
    },
    {
      id: "documentation",
      label: "Documentation",
      description: "Read our guides and docs",
      icon: BookOpen,
      action: () => navigate("/learn"),
      keywords: ["docs", "help", "guides", "faq"],
    },

    // User Actions (authenticated)
    {
      id: "profile",
      label: "View Profile",
      description: "Manage your account",
      icon: User,
      action: () => navigate("/profile"),
      requiresAuth: true,
      keywords: ["account", "settings", "user"],
    },
    {
      id: "my-campaigns",
      label: "My Campaigns",
      description: "View your advertising campaigns",
      icon: BarChart3,
      action: () => navigate("/my-campaigns"),
      requiresAuth: true,
      roles: ["advertiser", "admin"],
      keywords: ["ads", "campaigns", "bookings", "analytics"],
    },
    {
      id: "my-screens",
      label: "My Screens Dashboard",
      description: "Manage your screens",
      icon: MonitorPlay,
      action: () => navigate("/my-screens"),
      requiresAuth: true,
      roles: ["screen_owner", "admin"],
      keywords: ["screens", "dashboard", "monitor"],
    },
    {
      id: "register-screen",
      label: "Register New Screen",
      description: "Add a new screen to your account",
      icon: Upload,
      action: () => navigate("/register-screen"),
      requiresAuth: true,
      roles: ["screen_owner", "admin"],
      keywords: ["add", "register", "new screen"],
    },
    {
      id: "schedule",
      label: "Schedule Content",
      description: "Manage content scheduling",
      icon: Calendar,
      action: () => navigate("/scheduling"),
      requiresAuth: true,
      keywords: ["calendar", "schedule", "booking", "time"],
    },
    {
      id: "subscription",
      label: "Subscription",
      description: "Manage your subscription",
      icon: CreditCard,
      action: () => navigate("/subscription"),
      requiresAuth: true,
      roles: ["screen_owner", "admin"],
      keywords: ["billing", "payment", "plan"],
    },

    // Admin
    {
      id: "admin",
      label: "Admin Dashboard",
      description: "Access admin panel",
      icon: Shield,
      action: () => navigate("/admin"),
      requiresAuth: true,
      roles: ["admin"],
      keywords: ["admin", "management"],
    },

    // Downloads
    {
      id: "download-mobile",
      label: "Download Mobile App",
      description: "Get the mobile app",
      icon: Smartphone,
      action: () => navigate("/download"),
      keywords: ["app", "mobile", "download", "ios", "android"],
    },
    {
      id: "download-screen",
      label: "Setup Screen App",
      description: "Install RedSquare on your screen",
      icon: Cast,
      action: () => navigate("/setup-redsquare-screen"),
      keywords: ["screen", "app", "tv", "display", "install"],
    },

    // Auth Actions
    {
      id: "sign-in",
      label: "Sign In",
      description: "Sign in to your account",
      icon: User,
      action: () => navigate("/auth"),
      requiresAuth: false,
      keywords: ["login", "auth", "authenticate"],
    },
    {
      id: "sign-out",
      label: "Sign Out",
      description: "Sign out of your account",
      icon: LogOut,
      action: () => signOut(),
      requiresAuth: true,
      keywords: ["logout", "exit", "leave"],
    },
  ];

  // Filter commands based on user state and roles
  const availableCommands = commands.filter((command) => {
    // If command requires auth but user is not logged in, hide it
    if (command.requiresAuth && !user) return false;

    // If command is for non-authenticated users only
    if (command.requiresAuth === false && user) return false;

    // If command requires specific roles
    if (command.roles && command.roles.length > 0) {
      const hasRole =
        command.roles.includes("advertiser") && isAdvertiser() ||
        command.roles.includes("screen_owner") && isScreenOwner() ||
        command.roles.includes("admin") && isAdmin();
      if (!hasRole) return false;
    }

    return true;
  });

  // Group commands by category
  const navigationCommands = availableCommands.filter((c) =>
    ["home", "discover", "how-it-works", "documentation"].includes(c.id)
  );
  const userCommands = availableCommands.filter((c) =>
    ["profile", "my-campaigns", "my-screens", "register-screen", "schedule", "subscription"].includes(c.id)
  );
  const adminCommands = availableCommands.filter((c) => c.id === "admin");
  const downloadCommands = availableCommands.filter((c) =>
    ["download-mobile", "download-screen"].includes(c.id)
  );
  const authCommands = availableCommands.filter((c) =>
    ["sign-in", "sign-out"].includes(c.id)
  );

  return (
    <>
      {/* Keyboard hint */}
      <div className="fixed bottom-4 right-4 hidden lg:block z-40">
        <button
          onClick={() => setOpen(true)}
          className="bg-background/80 backdrop-blur-sm border border-border rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors flex items-center gap-2"
          aria-label="Open command palette"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
          <span>Search</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {navigationCommands.length > 0 && (
            <CommandGroup heading="Navigation">
              {navigationCommands.map((command) => {
                const Icon = command.icon;
                return (
                  <CommandItem
                    key={command.id}
                    onSelect={() => runCommand(command.action)}
                  >
                    <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                    <div className="flex flex-col">
                      <span>{command.label}</span>
                      {command.description && (
                        <span className="text-xs text-muted-foreground">
                          {command.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {userCommands.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Your Account">
                {userCommands.map((command) => {
                  const Icon = command.icon;
                  return (
                    <CommandItem
                      key={command.id}
                      onSelect={() => runCommand(command.action)}
                    >
                      <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                      <div className="flex flex-col">
                        <span>{command.label}</span>
                        {command.description && (
                          <span className="text-xs text-muted-foreground">
                            {command.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}

          {adminCommands.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Admin">
                {adminCommands.map((command) => {
                  const Icon = command.icon;
                  return (
                    <CommandItem
                      key={command.id}
                      onSelect={() => runCommand(command.action)}
                    >
                      <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                      <div className="flex flex-col">
                        <span>{command.label}</span>
                        {command.description && (
                          <span className="text-xs text-muted-foreground">
                            {command.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}

          {downloadCommands.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Downloads">
                {downloadCommands.map((command) => {
                  const Icon = command.icon;
                  return (
                    <CommandItem
                      key={command.id}
                      onSelect={() => runCommand(command.action)}
                    >
                      <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                      <div className="flex flex-col">
                        <span>{command.label}</span>
                        {command.description && (
                          <span className="text-xs text-muted-foreground">
                            {command.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}

          {authCommands.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Account">
                {authCommands.map((command) => {
                  const Icon = command.icon;
                  return (
                    <CommandItem
                      key={command.id}
                      onSelect={() => runCommand(command.action)}
                    >
                      <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                      <div className="flex flex-col">
                        <span>{command.label}</span>
                        {command.description && (
                          <span className="text-xs text-muted-foreground">
                            {command.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

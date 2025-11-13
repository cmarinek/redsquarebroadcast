import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, Home, ArrowLeft, Map, HelpCircle, BookOpen, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to discovery page with search query
      navigate(`/discover?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Suggest popular pages based on user state
  const suggestedPages = user ? [
    {
      title: "Discover Screens",
      description: "Find digital screens to display your content",
      icon: Map,
      path: "/discover",
    },
    {
      title: "Dashboard",
      description: "View your campaigns and analytics",
      icon: MonitorPlay,
      path: "/my-campaigns",
    },
    {
      title: "How It Works",
      description: "Learn how RedSquare works",
      icon: HelpCircle,
      path: "/how-it-works",
    },
    {
      title: "Profile",
      description: "Manage your account settings",
      icon: Home,
      path: "/profile",
    },
  ] : [
    {
      title: "Home",
      description: "Return to the homepage",
      icon: Home,
      path: "/",
    },
    {
      title: "How It Works",
      description: "Learn how RedSquare works",
      icon: HelpCircle,
      path: "/how-it-works",
    },
    {
      title: "Discover Screens",
      description: "Browse available digital screens",
      icon: Map,
      path: "/discover",
    },
    {
      title: "Documentation",
      description: "Read our comprehensive guides",
      icon: BookOpen,
      path: "/learn",
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background px-4 py-16"
      role="main"
      aria-labelledby="error-title"
    >
      <div className="max-w-3xl w-full">
        {/* Error Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 mb-6">
            <span className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              404
            </span>
          </div>
          <h1
            id="error-title"
            className="text-4xl sm:text-5xl font-bold mb-4 text-foreground"
          >
            Page Not Found
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-sm text-muted-foreground">
            URL: <code className="bg-muted px-2 py-1 rounded">{location.pathname}</code>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate(-1)}
            className="bg-gradient-primary hover:shadow-[var(--shadow-red)] transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Go Back
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" aria-hidden="true" />
              Home
            </Link>
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" aria-hidden="true" />
              Search for Screens
            </CardTitle>
            <CardDescription>
              Try searching for digital screens in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search by location or screen name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                aria-label="Search for screens"
              />
              <Button type="submit" aria-label="Search">
                <Search className="w-4 h-4" aria-hidden="true" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Suggested Pages */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">
            Popular Pages
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {suggestedPages.map((page) => {
              const Icon = page.icon;
              return (
                <Card
                  key={page.path}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  asChild
                >
                  <Link to={page.path}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg group-hover:text-primary transition-colors">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                        {page.title}
                      </CardTitle>
                      <CardDescription>{page.description}</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Still having trouble?{" "}
            <Link
              to="/how-it-works"
              className="text-primary hover:underline font-medium"
            >
              Visit our help center
            </Link>
            {" "}or{" "}
            <Link
              to="/support"
              className="text-primary hover:underline font-medium"
            >
              contact support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

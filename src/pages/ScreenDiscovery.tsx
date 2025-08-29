import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, QrCode, Star, Clock, DollarSign, HelpCircle, Zap, Users, Eye, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import MapboxMap from "@/components/maps/MapboxMap";
import { QrScanner } from "@yudiel/react-qr-scanner";
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

interface Screen {
  id: string;
  screen_name: string | null;
  location: string | null;
  pricing_cents: number | null;
  status: string;
  latitude: number | null;
  longitude: number | null;
}

export default function ScreenDiscovery() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);
  const [showHelpTips, setShowHelpTips] = useState(true);
  const watchIdRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchScreens("");
    requestLocationAccess();
  }, []);

  // Debounced search
  useEffect(() => {
    const handle = setTimeout(() => {
      fetchScreens(searchQuery.trim());
    }, 500);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const fetchScreens = async (query: string) => {
    setLoading(true);
    try {
      let supabaseQuery = supabase
        .from("screens")
        .select("id, screen_name, location, pricing_cents, status, latitude, longitude")
        .eq("status", "active")
        .limit(50);

      if (query) {
        const searchPattern = `%${query}%`;
        supabaseQuery = supabaseQuery.or(
          `screen_name.ilike.${searchPattern},location.ilike.${searchPattern},id.ilike.${searchPattern}`
        );
      }

      const { data, error } = await supabaseQuery;
      if (error) throw error;
      setScreens((data as Screen[]) || []);
    } catch (error) {
      console.error("Error loading screens:", error);
      toast({
        title: "Unable to load screens",
        description: "Please check your internet connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const requestLocationAccess = () => {
    if (!navigator.geolocation || locationPermissionAsked) return;
    
    setLocationPermissionAsked(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        });
        toast({
          title: "Location found!",
          description: "We can now show you screens near you.",
        });
        
        // Start watching position for updates
        try {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => {},
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 20000 }
          );
        } catch {}
      },
      (error) => {
        console.log("Location access denied or failed:", error);
        toast({
          title: "Location not available",
          description: "We'll show all screens, but can't sort by distance.",
          variant: "default"
        });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Calculate distance between two points
  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const earthRadius = 6371; // km
    
    const lat1Rad = toRadians(point1.lat);
    const lat2Rad = toRadians(point2.lat);
    const latDiff = toRadians(point2.lat - point1.lat);
    const lngDiff = toRadians(point2.lng - point1.lng);

    const a = Math.sin(latDiff / 2) ** 2 + 
              Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
              Math.sin(lngDiff / 2) ** 2;
    
    return 2 * earthRadius * Math.asin(Math.sqrt(a));
  };

  const getScreenDistance = (screen: Screen) => {
    if (!coords || screen.latitude == null || screen.longitude == null) {
      return null;
    }
    return calculateDistance(coords, { lat: screen.latitude, lng: screen.longitude });
  };

  // Sort screens by distance (nearest first)
  const sortedScreens = [...screens].sort((a, b) => {
    const distanceA = getScreenDistance(a);
    const distanceB = getScreenDistance(b);
    
    if (distanceA === null && distanceB === null) return 0;
    if (distanceA === null) return 1;
    if (distanceB === null) return -1;
    return distanceA - distanceB;
  });

  const handleQRCodeScan = () => {
    setShowScanner(true);
  };

  const handleQRCodeResult = (scannedText: string) => {
    try {
      let screenId = scannedText;
      
      // Handle full URLs (https://example.com/screen/ID)
      if (scannedText.startsWith('http')) {
        const url = new URL(scannedText);
        const pathParts = url.pathname.split('/').filter(Boolean);
        const screenIndex = pathParts.indexOf('screen');
        if (screenIndex !== -1 && pathParts[screenIndex + 1]) {
          screenId = pathParts[screenIndex + 1];
        }
      }
      
      if (screenId) {
        navigate(`/screen/${screenId}`);
        toast({
          title: "Screen found!",
          description: "Taking you to the screen details...",
        });
      }
    } catch {
      navigate(`/screen/${scannedText}`);
    } finally {
      setShowScanner(false);
    }
  };

  return (
    <TooltipProvider>
      <Layout>
        <SEO 
          title="Find Screens Near You | Red Square" 
          description="Easily find digital screens in your area to display your content. Search by location, scan QR codes, or explore the interactive map." 
          path="/explore" 
        />
        
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
              
              {/* Welcome Header */}
              <div className="text-center mb-12">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    <Eye className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Find the Perfect Screen
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                  Discover digital screens in your area where you can display your content. 
                  It's easy to find, book, and broadcast to screens near you.
                </p>

                {/* Help Tips Card */}
                {showHelpTips && (
                  <Alert className="max-w-2xl mx-auto mb-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      <div className="flex items-center justify-between">
                        <span>
                          <strong>New here?</strong> Use the search box to find screens by location, 
                          or scan a QR code if you're standing near a screen.
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowHelpTips(false)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Got it
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Search Tools Section */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    How would you like to find screens?
                  </CardTitle>
                  <CardDescription>
                    Choose the method that works best for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Search by Text */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">Search by Location or Name</h3>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Type a city, street name, or business name to find screens</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Type a city, address, or screen name (e.g., 'Downtown', 'Coffee Shop')"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* QR Code Scanner */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">Scan a Screen's QR Code</h3>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Look for QR codes displayed on screens - scan to book instantly</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleQRCodeScan} 
                        variant="outline" 
                        className="flex items-center gap-2"
                        size="lg"
                      >
                        <QrCode className="h-5 w-5" />
                        <Smartphone className="h-4 w-4" />
                        Open Camera to Scan QR Code
                      </Button>
                      <div className="flex-1 text-sm text-muted-foreground flex items-center">
                        Perfect when you're standing in front of a screen and want to book it right away
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Interactive Map */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Interactive Map
                  </CardTitle>
                  <CardDescription>
                    See all available screens on the map. Click any pin to view details.
                    {!coords && " (Allow location access to see screens near you)"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-80 rounded-lg overflow-hidden">
                    <MapboxMap
                      coords={coords}
                      screens={screens}
                      onSelectScreen={(id) => navigate(`/screen/${id}`)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* QR Scanner Dialog */}
              <Dialog open={showScanner} onOpenChange={setShowScanner}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center">Scan Screen QR Code</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Point your camera at the QR code displayed on the screen
                    </p>
                    <div className="rounded-lg overflow-hidden">
                      <QrScanner
                        onDecode={handleQRCodeResult}
                        onError={() => setShowScanner(false)}
                        constraints={{ facingMode: 'environment' }}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowScanner(false)}
                      className="w-full"
                    >
                      Cancel Scanning
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Available Screens Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Available Screens</h2>
                  {coords && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Sorted by distance
                    </Badge>
                  )}
                </div>
                
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                          <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                          <div className="h-8 bg-muted rounded w-full"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : sortedScreens.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                      <h3 className="text-xl font-semibold mb-2">No screens found</h3>
                      <p className="text-muted-foreground mb-6">
                        {searchQuery 
                          ? `We couldn't find any screens matching "${searchQuery}". Try a different search term.`
                          : "No screens are currently available in this area. Check back later or try searching in a different location."
                        }
                      </p>
                      {searchQuery && (
                        <Button onClick={() => setSearchQuery("")} variant="outline">
                          Clear Search & Show All
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedScreens.map((screen) => {
                      const distance = getScreenDistance(screen);
                      return (
                        <Card key={screen.id} className="hover:shadow-lg transition-all cursor-pointer group">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                  {screen.screen_name || "Digital Display Screen"}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-2">
                                  <MapPin className="h-4 w-4" />
                                  {screen.location || "Location not specified"}
                                  {distance && (
                                    <span className="ml-2 text-xs bg-secondary px-2 py-1 rounded-full">
                                      {distance < 1 
                                        ? `${Math.round(distance * 1000)}m away`
                                        : `${distance.toFixed(1)}km away`
                                      }
                                    </span>
                                  )}
                                </CardDescription>
                              </div>
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                4.8
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Available 24/7
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                High traffic
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-2xl font-bold text-primary">
                                ${((screen.pricing_cents || 0) / 100).toFixed(2)}
                                <span className="text-sm font-normal text-muted-foreground">/hour</span>
                              </div>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                Instant booking
                              </Badge>
                            </div>
                            
                            <Button 
                              className="w-full"
                              onClick={() => navigate(`/screen/${screen.id}`)}
                              size="lg"
                            >
                              View Details & Book Now
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Help Section */}
              <Card className="mt-12 border-dashed">
                <CardContent className="p-8 text-center">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
                  <p className="text-muted-foreground mb-4">
                    New to Red Square? We're here to help you get started with finding and booking screens.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" asChild>
                      <a href="/how-it-works">How It Works</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/setup-guide">Setup Guide</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </Layout>
    </TooltipProvider>
  );
}
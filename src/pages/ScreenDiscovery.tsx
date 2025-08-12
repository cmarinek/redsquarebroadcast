import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, QrCode, Star, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import MapboxMap from "@/components/maps/MapboxMap";
import { QrScanner } from "@yudiel/react-qr-scanner";
import SEO from "@/components/SEO";


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
  const watchIdRef = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchScreens("");
    getLocation();
  }, []);

  // Debounced server-side search for better performance
  useEffect(() => {
    const handle = setTimeout(() => {
      fetchScreens(searchQuery.trim());
    }, 300);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const fetchScreens = async (q: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from("screens")
        .select("id, screen_name, location, pricing_cents, status, latitude, longitude")
        .eq("status", "active")
        .limit(50);

      if (q) {
        const like = `%${q}%`;
        query = query.or(
          `screen_name.ilike.${like},location.ilike.${like},id.ilike.${like}`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      setScreens((data as Screen[]) || []);
    } catch (error) {
      console.error("Error fetching screens:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get user location
  const getLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords(null),
      { enableHighAccuracy: true, timeout: 15000 }
    );
    // Live updates
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
      );
    } catch {}
  };
  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  // Haversine distance in km
  const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  };

  const filteredScreens = screens.filter((screen) =>
    (screen.screen_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (screen.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    screen.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

const distanceOf = (s: Screen) => (
  coords && s.latitude != null && s.longitude != null
    ? distanceKm(coords, { lat: s.latitude, lng: s.longitude })
    : null
);
const orderedScreens = [...filteredScreens].sort((a, b) => {
  const da = distanceOf(a);
  const db = distanceOf(b);
  if (da === null && db === null) return 0;
  if (da === null) return 1;
  if (db === null) return -1;
  return (da as number) - (db as number);
});

  const handleQRScan = () => setShowScanner(true);

  const handleDecode = (text: string) => {
    try {
      // Accept full URLs like https://site/screen/ID or direct IDs
      let id = text;
      if (text.startsWith('http')) {
        const url = new URL(text);
        const parts = url.pathname.split('/').filter(Boolean);
        const idx = parts.indexOf('screen');
        if (idx !== -1 && parts[idx + 1]) id = parts[idx + 1];
      }
      if (id) navigate(`/screen/${id}`);
    } catch {
      // Fallback: try direct navigation
      navigate(`/screen/${text}`);
    } finally {
      setShowScanner(false);
    }
  };

  return (
    <Layout>
      <SEO title="Discover Screens Nearby | Red Square" description="Find digital screens by proximity, scan QR codes, or search by city, name, or ID." path="/discover" />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Discover Screens
            </h1>
            <p className="text-muted-foreground text-lg">
              Find the perfect screen to broadcast your content
            </p>
          </div>

          {/* Search and QR Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by city, screen name, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleQRScan} variant="outline" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Scan QR Code
            </Button>
          </div>

          <Card className="mb-8">
            <CardContent className="p-0">
              <div className="h-64 rounded-lg overflow-hidden">
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scan Screen QR Code</DialogTitle>
              </DialogHeader>
              <div className="rounded overflow-hidden">
                <QrScanner
                  onDecode={handleDecode}
                  onError={() => setShowScanner(false)}
                  constraints={{ facingMode: 'environment' }}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Screens List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Available Screens</h2>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredScreens.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No screens found</p>
                  <p className="text-muted-foreground">Try adjusting your search criteria</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orderedScreens.map((screen) => (
                  <Card key={screen.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {screen.screen_name || "Digital Screen"}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4" />
                            {screen.location || 'Location not specified'}
                            {coords && screen.latitude != null && screen.longitude != null && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                {distanceKm(coords, { lat: screen.latitude, lng: screen.longitude }).toFixed(1)} km away
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          <Star className="h-3 w-3 mr-1" />
                          4.8
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {`09:00 - 21:00`}
                        </div>
                        <div className="flex items-center gap-1 text-lg font-semibold">
                          <DollarSign className="h-4 w-4" />
                          {((screen.pricing_cents || 0) / 100).toFixed(2)}/hr
                        </div>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => navigate(`/screen/${screen.id}`)}
                      >
                        View Details & Book
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
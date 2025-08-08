import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, QrCode, Star, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";

interface Screen {
  id: string;
  screen_name: string;
  address: string;
  city: string;
  price_per_hour: number;
  location_lat: number;
  location_lng: number;
  availability_start: string;
  availability_end: string;
}

export default function ScreenDiscovery() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchScreens();
  }, []);

  const fetchScreens = async () => {
    try {
      const { data, error } = await supabase
        .from("screens")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      setScreens(data || []);
    } catch (error) {
      console.error("Error fetching screens:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredScreens = screens.filter(screen =>
    screen.screen_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    screen.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    screen.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQRScan = () => {
    // In a real app, this would open camera for QR scanning
    alert("QR scanner would open here");
  };

  return (
    <Layout>
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

          {/* Map Placeholder */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Interactive Map View</p>
                  <p className="text-sm text-muted-foreground">Shows nearby screens based on your location</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                {filteredScreens.map((screen) => (
                  <Card key={screen.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {screen.screen_name || "Digital Screen"}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4" />
                            {screen.address}, {screen.city}
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
                          {screen.availability_start} - {screen.availability_end}
                        </div>
                        <div className="flex items-center gap-1 text-lg font-semibold">
                          <DollarSign className="h-4 w-4" />
                          {(screen.price_per_hour / 100).toFixed(2)}/hr
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
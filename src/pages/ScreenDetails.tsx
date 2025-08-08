import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, DollarSign, Star, Calendar, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";

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

export default function ScreenDetails() {
  const { screenId } = useParams();
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (screenId) {
      fetchScreen();
    }
  }, [screenId]);

  const fetchScreen = async () => {
    try {
      const { data, error } = await supabase
        .from("screens")
        .select("*")
        .eq("id", screenId)
        .single();

      if (error) throw error;
      setScreen(data);
    } catch (error) {
      console.error("Error fetching screen:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/2"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!screen) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Screen Not Found</h1>
            <Button onClick={() => navigate("/discover")}>
              Back to Discovery
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/discover")}
              className="mb-4"
            >
              ← Back to Discovery
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {screen.screen_name || "Digital Screen"}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{screen.address}, {screen.city}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  4.8 (127 reviews)
                </Badge>
                <div className="text-right">
                  <div className="text-2xl font-bold flex items-center gap-1">
                    <DollarSign className="h-5 w-5" />
                    {(screen.price_per_hour / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">per hour</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Screen Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Screen Image */}
              <Card>
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">RS</span>
                      </div>
                      <p className="text-lg font-medium">Live Screen Preview</p>
                      <p className="text-sm text-muted-foreground">55" 4K Display</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Availability */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Operating Hours</span>
                      <span className="text-sm text-muted-foreground">
                        {screen.availability_start} - {screen.availability_end}
                      </span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Available Time Slots Today</p>
                      <div className="grid grid-cols-3 gap-2">
                        {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((time) => (
                          <Badge key={time} variant="outline" className="justify-center">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location & Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Location & Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Interactive Map</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Screen Size:</span>
                        <p className="text-muted-foreground">55" 4K Display</p>
                      </div>
                      <div>
                        <span className="font-medium">Location Type:</span>
                        <p className="text-muted-foreground">High Traffic Area</p>
                      </div>
                      <div>
                        <span className="font-medium">Daily Views:</span>
                        <p className="text-muted-foreground">~2,500 people</p>
                      </div>
                      <div>
                        <span className="font-medium">Peak Hours:</span>
                        <p className="text-muted-foreground">8AM - 6PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Book This Screen</CardTitle>
                  <CardDescription>
                    Upload content and schedule your broadcast
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/book/${screen.id}/upload`)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Start Booking
                  </Button>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base rate:</span>
                      <span>${(screen.price_per_hour / 100).toFixed(2)}/hour</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform fee:</span>
                      <span>5%</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total (1 hour):</span>
                      <span>${((screen.price_per_hour * 1.05) / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">What's included:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• HD content display</li>
                      <li>• Real-time monitoring</li>
                      <li>• Performance analytics</li>
                      <li>• 24/7 support</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Star, Clock, DollarSign } from "lucide-react";

const mockScreens = [
  {
    id: "screen-001",
    name: "Times Square Billboard",
    location: "New York, NY",
    distance: "0.2 mi",
    rating: 4.9,
    pricePerHour: 45,
    availability: "Available Now",
    type: "LED Billboard",
    size: "40x60 ft",
    audienceSize: "50K+ daily"
  },
  {
    id: "screen-002", 
    name: "Downtown Coffee Shop",
    location: "Austin, TX",
    distance: "0.8 mi",
    rating: 4.7,
    pricePerHour: 12,
    availability: "Next: 2:00 PM",
    type: "Digital Display",
    size: "32 inch",
    audienceSize: "200+ daily"
  },
  {
    id: "screen-003",
    name: "Mall Central Court",
    location: "Los Angeles, CA", 
    distance: "1.2 mi",
    rating: 4.8,
    pricePerHour: 28,
    availability: "Available Now",
    type: "Video Wall",
    size: "12x8 ft",
    audienceSize: "5K+ daily"
  }
];

export const DemoScreenDiscovery = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);
  const [filteredScreens, setFilteredScreens] = useState(mockScreens);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const filtered = mockScreens.filter(screen =>
          screen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          screen.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredScreens(filtered);
        setIsSearching(false);
      }, 800);

      return () => clearTimeout(timer);
    } else {
      setFilteredScreens(mockScreens);
    }
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by location, name, or screen ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="cursor-pointer">Near Me</Badge>
        <Badge variant="outline" className="cursor-pointer">Available Now</Badge>
        <Badge variant="outline" className="cursor-pointer">Under $20/hr</Badge>
        <Badge variant="outline" className="cursor-pointer">High Traffic</Badge>
      </div>

      {/* Screen Results */}
      <div className="space-y-4">
        {isSearching ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-muted-foreground">Searching screens...</p>
          </div>
        ) : (
          filteredScreens.map((screen) => (
            <Card 
              key={screen.id} 
              className={`cursor-pointer transition-all hover:shadow-lg border-muted/20 ${
                selectedScreen === screen.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedScreen(selectedScreen === screen.id ? null : screen.id)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{screen.name}</h3>
                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {screen.location} • {screen.distance}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center mb-1">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{screen.rating}</span>
                    </div>
                    <Badge 
                      variant={screen.availability.includes('Available') ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {screen.availability}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Type</div>
                    <div className="font-medium">{screen.type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Size</div>
                    <div className="font-medium">{screen.size}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Audience</div>
                    <div className="font-medium">{screen.audienceSize}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Price</div>
                    <div className="font-medium text-primary">${screen.pricePerHour}/hr</div>
                  </div>
                </div>

                {selectedScreen === screen.id && (
                  <div className="border-t border-muted/20 pt-4 mt-4">
                    <div className="flex gap-3">
                      <Button size="sm" className="bg-gradient-primary">
                        <Clock className="w-4 h-4 mr-2" />
                        Book Now
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Star className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredScreens.length === 0 && !isSearching && (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No screens found matching your criteria</p>
          <Button variant="outline" className="mt-2" onClick={() => setSearchTerm("")}>
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
};
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Monitor, Users, TrendingUp, Search, Filter, Globe } from "lucide-react";
import MapboxMap from "@/components/maps/MapboxMap";

// Major metropolitan areas with their approximate coordinates and screen densities
const majorCities = [
  { name: "New York", lat: 40.7128, lng: -74.0060, screens: 45000, country: "USA" },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437, screens: 32000, country: "USA" },
  { name: "London", lat: 51.5074, lng: -0.1278, screens: 28000, country: "UK" },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503, screens: 41000, country: "Japan" },
  { name: "Shanghai", lat: 31.2304, lng: 121.4737, screens: 38000, country: "China" },
  { name: "Beijing", lat: 39.9042, lng: 116.4074, screens: 35000, country: "China" },
  { name: "Paris", lat: 48.8566, lng: 2.3522, screens: 22000, country: "France" },
  { name: "Berlin", lat: 52.5200, lng: 13.4050, screens: 18000, country: "Germany" },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, screens: 25000, country: "India" },
  { name: "Delhi", lat: 28.7041, lng: 77.1025, screens: 23000, country: "India" },
  { name: "São Paulo", lat: -23.5505, lng: -46.6333, screens: 20000, country: "Brazil" },
  { name: "Mexico City", lat: 19.4326, lng: -99.1332, screens: 19000, country: "Mexico" },
  { name: "Sydney", lat: -33.8688, lng: 151.2093, screens: 15000, country: "Australia" },
  { name: "Toronto", lat: 43.6532, lng: -79.3832, screens: 16000, country: "Canada" },
  { name: "Dubai", lat: 25.2048, lng: 55.2708, screens: 12000, country: "UAE" },
  { name: "Singapore", lat: 1.3521, lng: 103.8198, screens: 14000, country: "Singapore" },
  { name: "Hong Kong", lat: 22.3193, lng: 114.1694, screens: 18000, country: "Hong Kong" },
  { name: "Seoul", lat: 37.5665, lng: 126.9780, screens: 22000, country: "South Korea" },
  { name: "Bangkok", lat: 13.7563, lng: 100.5018, screens: 16000, country: "Thailand" },
  { name: "Istanbul", lat: 41.0082, lng: 28.9784, screens: 14000, country: "Turkey" },
  { name: "Moscow", lat: 55.7558, lng: 37.6176, screens: 17000, country: "Russia" },
  { name: "Madrid", lat: 40.4168, lng: -3.7038, screens: 13000, country: "Spain" },
  { name: "Rome", lat: 41.9028, lng: 12.4964, screens: 11000, country: "Italy" },
  { name: "Amsterdam", lat: 52.3676, lng: 4.9041, screens: 9000, country: "Netherlands" },
  { name: "Stockholm", lat: 59.3293, lng: 18.0686, screens: 8000, country: "Sweden" },
];

// Screen type names for variety
const screenTypes = [
  "LED Billboard", "Digital Display", "Video Wall", "Interactive Kiosk", "Smart TV",
  "Transit Screen", "Mall Display", "Street Panel", "Building Screen", "Bridge LED",
  "Stadium Display", "Airport Screen", "Metro Display", "Bus Stop Screen", "Store Window"
];

// Generate hundreds of thousands of screens distributed around major cities
const generateMockScreens = () => {
  const screens = [];
  let screenId = 1;
  
  majorCities.forEach(city => {
    // Generate screens in clusters around each city
    for (let i = 0; i < city.screens; i++) {
      // Create clusters with some screens closer to city center, others in suburbs
      const isSuburban = Math.random() > 0.6;
      const radius = isSuburban ? 0.3 : 0.1; // degrees (~33km vs ~11km)
      
      // Random offset from city center
      const latOffset = (Math.random() - 0.5) * 2 * radius;
      const lngOffset = (Math.random() - 0.5) * 2 * radius;
      
      const screenType = screenTypes[Math.floor(Math.random() * screenTypes.length)];
      const locationSuffix = isSuburban ? "Suburbs" : "Downtown";
      
      screens.push({
        id: `screen-${screenId}`,
        screen_name: `${screenType} #${screenId}`,
        location: `${city.name} ${locationSuffix}, ${city.country}`,
        latitude: city.lat + latOffset,
        longitude: city.lng + lngOffset,
      });
      
      screenId++;
    }
  });
  
  return screens;
};

// Generate the massive screen network
const mockScreens = generateMockScreens();

const networkStats = {
  totalScreens: mockScreens.length,
  activeScreens: Math.floor(mockScreens.length * 0.92), // 92% uptime
  totalCities: majorCities.length,
  totalCountries: 25
};

// Generate city performance data based on screen counts
const cityData = majorCities
  .sort((a, b) => b.screens - a.screens)
  .slice(0, 12)
  .map(city => ({
    city: city.name,
    country: city.country,
    screens: city.screens,
    active: Math.floor(city.screens * (0.88 + Math.random() * 0.08)), // 88-96% uptime
    revenue: `$${Math.floor(city.screens * (2.8 + Math.random() * 1.2)).toLocaleString()}` // $2.80-4.00 per screen
  }));

// Calculate screen type distribution from our generated data
const screenTypeDistribution = [
  { type: "LED Billboards", percentage: 28 },
  { type: "Digital Displays", percentage: 24 },
  { type: "Video Walls", percentage: 18 },
  { type: "Interactive Kiosks", percentage: 15 },
  { type: "Smart TVs", percentage: 8 },
  { type: "Transit Screens", percentage: 7 }
].map(type => ({
  ...type,
  count: Math.floor(mockScreens.length * (type.percentage / 100))
}));

export const DemoScreenNetwork = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [filteredCities, setFilteredCities] = useState(cityData);
  const [realTimeStats, setRealTimeStats] = useState(networkStats);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStats(prev => ({
        ...prev,
        activeScreens: prev.activeScreens + Math.floor(Math.random() * 5) - 2
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = cityData;
    
    if (searchTerm) {
      filtered = filtered.filter(city => 
        city.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRegion !== "all") {
      // Simple region filtering - in real app this would be more sophisticated
      const regionCountries = {
        "americas": ["USA", "Canada", "Brazil", "Mexico"],
        "europe": ["UK", "France", "Germany", "Spain", "Italy"],
        "asia": ["Japan", "China", "India", "Singapore"],
        "oceania": ["Australia", "New Zealand"]
      };
      
      const countries = regionCountries[selectedRegion as keyof typeof regionCountries] || [];
      filtered = filtered.filter(city => countries.includes(city.country));
    }

    setFilteredCities(filtered);
  }, [searchTerm, selectedRegion]);

  return (
    <div className="space-y-6">
      {/* Global Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-muted/20">
          <CardContent className="p-6 text-center">
            <Monitor className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{realTimeStats.totalScreens.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Screens</div>
            <Badge className="mt-2 bg-green-500/10 text-green-600 border-green-500/20">
              Growing
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-muted/20">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{realTimeStats.activeScreens.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Active Now</div>
            <Badge className="mt-2 bg-blue-500/10 text-blue-600 border-blue-500/20">
              Live
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-muted/20">
          <CardContent className="p-6 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{networkStats.totalCities}</div>
            <div className="text-sm text-muted-foreground">Cities</div>
          </CardContent>
        </Card>

        <Card className="border-muted/20">
          <CardContent className="p-6 text-center">
            <Globe className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{networkStats.totalCountries}</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </CardContent>
        </Card>
      </div>

      {/* World Map Visualization */}
      <Card className="border-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Global Network Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg overflow-hidden">
            <MapboxMap 
              coords={{ lat: 40.7128, lng: -74.0060 }} 
              screens={mockScreens}
              onSelectScreen={(screen) => {
                console.log("Selected screen:", screen);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search cities or countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={selectedRegion === "all" ? "default" : "outline"}
            onClick={() => setSelectedRegion("all")}
          >
            All Regions
          </Button>
          <Button
            size="sm"
            variant={selectedRegion === "americas" ? "default" : "outline"}
            onClick={() => setSelectedRegion("americas")}
          >
            Americas
          </Button>
          <Button
            size="sm"
            variant={selectedRegion === "europe" ? "default" : "outline"}
            onClick={() => setSelectedRegion("europe")}
          >
            Europe
          </Button>
          <Button
            size="sm"
            variant={selectedRegion === "asia" ? "default" : "outline"}
            onClick={() => setSelectedRegion("asia")}
          >
            Asia
          </Button>
        </div>
      </div>

      {/* City Performance Table */}
      <Card className="border-muted/20">
        <CardHeader>
          <CardTitle>Top Performing Cities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCities.map((city, index) => (
              <div key={city.city} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-muted-foreground w-8">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{city.city}</div>
                    <div className="text-sm text-muted-foreground">{city.country}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Screens</div>
                    <div className="font-semibold">{city.screens}</div>
                    <div className="text-xs text-green-600">
                      {city.active} active
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                    <div className="font-semibold">
                      {Math.round((city.active / city.screens) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                    <div className="font-semibold text-primary">{city.revenue}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Screen Types Distribution */}
      <Card className="border-muted/20">
        <CardHeader>
          <CardTitle>Screen Types Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {screenTypeDistribution.map((type, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{type.type}</span>
                  <span className="font-medium">{type.count.toLocaleString()} ({type.percentage}%)</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${type.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Monitor, Users, TrendingUp, Search, Filter, Globe } from "lucide-react";

const networkStats = {
  totalScreens: 12547,
  activeScreens: 11892,
  totalCities: 284,
  totalCountries: 47
};

const cityData = [
  { city: "New York", country: "USA", screens: 1247, active: 1189, revenue: "$45,230" },
  { city: "London", country: "UK", screens: 892, active: 847, revenue: "$28,940" },
  { city: "Tokyo", country: "Japan", screens: 734, active: 698, revenue: "$31,580" },
  { city: "Los Angeles", country: "USA", screens: 623, active: 594, revenue: "$22,150" },
  { city: "Paris", country: "France", screens: 445, active: 421, revenue: "$18,670" },
  { city: "Sydney", country: "Australia", screens: 387, active: 352, revenue: "$15,420" },
  { city: "Berlin", country: "Germany", screens: 298, active: 276, revenue: "$12,890" },
  { city: "Toronto", country: "Canada", screens: 234, active: 221, revenue: "$9,830" }
];

const screenTypes = [
  { type: "LED Billboards", count: 4234, percentage: 34 },
  { type: "Digital Displays", count: 3567, percentage: 28 },
  { type: "Video Walls", count: 2456, percentage: 20 },
  { type: "Interactive Kiosks", count: 1523, percentage: 12 },
  { type: "Smart TVs", count: 767, percentage: 6 }
];

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
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <div className="w-full max-w-4xl mx-auto h-64 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Globe className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Interactive world map would be displayed here</p>
                <p className="text-sm text-muted-foreground mt-2">Showing real-time screen locations and activity</p>
              </div>
            </div>
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
            {screenTypes.map((type, index) => (
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
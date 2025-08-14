import { useState } from "react";
import { Layout } from "@/components/Layout";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Monitor, Smartphone, Upload, Users, TrendingUp, MapPin, Clock, DollarSign } from "lucide-react";
import { DemoScreenDiscovery } from "@/components/demo/DemoScreenDiscovery";
import { DemoContentUpload } from "@/components/demo/DemoContentUpload";
import { DemoBookingFlow } from "@/components/demo/DemoBookingFlow";
import { DemoRevenueTracker } from "@/components/demo/DemoRevenueTracker";
import { DemoVideoGenerator } from "@/components/demo/DemoVideoGenerator";
import { DemoScreenNetwork } from "@/components/demo/DemoScreenNetwork";

const Demo = () => {
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  const demoStats = [
    { icon: Monitor, label: "Active Screens", value: "12,547", change: "+8.2%" },
    { icon: Users, label: "Active Users", value: "45,231", change: "+12.5%" },
    { icon: TrendingUp, label: "Broadcasts Today", value: "1,847", change: "+15.3%" },
    { icon: DollarSign, label: "Revenue Generated", value: "$28,491", change: "+22.1%" }
  ];

  const demoJourneys = [
    {
      id: "screen-owner",
      title: "Screen Owner Journey",
      description: "Register your screen, set pricing, and start earning",
      icon: Monitor,
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20"
    },
    {
      id: "broadcaster",
      title: "Broadcaster Journey", 
      description: "Discover screens, upload content, and launch campaigns",
      icon: Upload,
      color: "bg-red-500/10 text-red-600 border-red-500/20"
    },
    {
      id: "viewer",
      title: "Viewer Experience",
      description: "See how audiences engage with dynamic content",
      icon: Users,
      color: "bg-green-500/10 text-green-600 border-green-500/20"
    }
  ];

  return (
    <Layout>
      <SEO 
        title="Interactive Demo - Red Square Platform"
        description="Experience Red Square's digital advertising platform through interactive demos. See how screen owners earn revenue and broadcasters reach audiences."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
              <Play className="w-3 h-3 mr-1" />
              Interactive Demo
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Experience <span className="bg-gradient-primary bg-clip-text text-transparent">Red Square</span> Live
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Explore every aspect of our digital advertising platform through interactive simulations, 
              AI-generated demos, and real-time data visualization.
            </p>

            {/* Live Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {demoStats.map((stat, index) => (
                <Card key={index} className="text-center border-muted/20">
                  <CardContent className="pt-6">
                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {stat.change}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Demo Tabs */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="journeys" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-12">
                <TabsTrigger value="journeys">User Journeys</TabsTrigger>
                <TabsTrigger value="features">Live Features</TabsTrigger>
                <TabsTrigger value="network">Screen Network</TabsTrigger>
                <TabsTrigger value="videos">AI Demo Videos</TabsTrigger>
              </TabsList>

              {/* User Journeys Tab */}
              <TabsContent value="journeys" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Choose Your Journey</h2>
                  <p className="text-muted-foreground">Experience Red Square from different perspectives</p>
                </div>
                
                <div className="grid lg:grid-cols-3 gap-8">
                  {demoJourneys.map((journey) => (
                    <Card key={journey.id} className="cursor-pointer transition-all hover:shadow-lg border-muted/20">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${journey.color}`}>
                            <journey.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{journey.title}</CardTitle>
                            <CardDescription>{journey.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => setActiveSimulation(journey.id)}
                          className="w-full"
                          variant={activeSimulation === journey.id ? "default" : "outline"}
                        >
                          {activeSimulation === journey.id ? "Currently Active" : "Start Demo"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Active Simulation Display */}
                {activeSimulation && (
                  <div className="mt-12 border-t border-muted/20 pt-12">
                    {activeSimulation === "screen-owner" && (
                      <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-center">Screen Owner Demo</h3>
                        <DemoRevenueTracker />
                      </div>
                    )}
                    {activeSimulation === "broadcaster" && (
                      <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-center">Broadcaster Demo</h3>
                        <DemoScreenDiscovery />
                        <DemoContentUpload />
                        <DemoBookingFlow />
                      </div>
                    )}
                    {activeSimulation === "viewer" && (
                      <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-center">Viewer Experience</h3>
                        <Card className="border-muted/20">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="w-full max-w-md mx-auto bg-muted/30 rounded-lg p-8 mb-6">
                                <div className="animate-pulse">
                                  <div className="h-32 bg-gradient-primary rounded mb-4"></div>
                                  <div className="h-4 bg-muted rounded mb-2"></div>
                                  <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                                </div>
                              </div>
                              <p className="text-muted-foreground">Viewers see dynamic, engaging content that updates in real-time</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Live Features Tab */}
              <TabsContent value="features" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Interactive Platform Features</h2>
                  <p className="text-muted-foreground">Try out core functionality with live simulations</p>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card className="border-muted/20">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-primary" />
                        Screen Discovery
                      </CardTitle>
                      <CardDescription>Find and explore available screens</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DemoScreenDiscovery />
                    </CardContent>
                  </Card>

                  <Card className="border-muted/20">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Upload className="w-5 h-5 mr-2 text-primary" />
                        Content Upload
                      </CardTitle>
                      <CardDescription>Upload and preview your content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DemoContentUpload />
                    </CardContent>
                  </Card>

                  <Card className="border-muted/20">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-primary" />
                        Booking System
                      </CardTitle>
                      <CardDescription>Schedule your broadcasts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DemoBookingFlow />
                    </CardContent>
                  </Card>

                  <Card className="border-muted/20">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                        Revenue Tracking
                      </CardTitle>
                      <CardDescription>Monitor earnings and performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DemoRevenueTracker />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Screen Network Tab */}
              <TabsContent value="network" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Global Screen Network</h2>
                  <p className="text-muted-foreground">Explore our worldwide network of connected screens</p>
                </div>
                <DemoScreenNetwork />
              </TabsContent>

              {/* AI Demo Videos Tab */}
              <TabsContent value="videos" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">AI-Generated Demo Videos</h2>
                  <p className="text-muted-foreground">Watch realistic demonstrations of Red Square in action</p>
                </div>
                <DemoVideoGenerator />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of screen owners and broadcasters already using Red Square
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-primary">
                Start Broadcasting
              </Button>
              <Button size="lg" variant="outline">
                Register Your Screen
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Demo;
import React from "react";
import { OnboardingModal } from "./OnboardingModal";
import { 
  Upload, 
  Target, 
  BarChart3, 
  Calendar, 
  CreditCard, 
  Settings, 
  Smartphone,
  Zap,
  Users,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdvertiserOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const AdvertiserOnboarding = ({ 
  isOpen, 
  onClose, 
  onComplete 
}: AdvertiserOnboardingProps) => {
  const steps = [
    {
      title: "Welcome to Red Square",
      description: "Your gateway to digital advertising on screens everywhere",
      icon: <Zap className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                What is Red Square?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Red Square democratizes access to screen-based advertising. Upload your ads, find nearby screens, and broadcast your message to targeted audiences.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">Upload Content</h4>
                  <p className="text-sm text-muted-foreground">Images, videos, or GIFs</p>
                </div>
                <div className="text-center">
                  <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">Find Screens</h4>
                  <p className="text-sm text-muted-foreground">Discover nearby displays</p>
                </div>
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">Track Results</h4>
                  <p className="text-sm text-muted-foreground">Monitor your campaigns</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Content Creation & Upload",
      description: "Learn how to create and upload compelling advertising content",
      icon: <Upload className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supported Content Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 border rounded-lg">
                  <Badge variant="outline" className="mb-2">Images</Badge>
                  <p className="text-sm text-muted-foreground">JPG, PNG, WebP</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Badge variant="outline" className="mb-2">Videos</Badge>
                  <p className="text-sm text-muted-foreground">MP4, WebM</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Badge variant="outline" className="mb-2">GIFs</Badge>
                  <p className="text-sm text-muted-foreground">Animated content</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>• <strong>Resolution:</strong> Use 1920x1080 or higher for best quality</li>
                <li>• <strong>Duration:</strong> Keep videos under 30 seconds for maximum impact</li>
                <li>• <strong>File Size:</strong> Optimize files for fast loading (under 50MB)</li>
                <li>• <strong>Design:</strong> Use high contrast and readable fonts</li>
                <li>• <strong>Call to Action:</strong> Include clear next steps for viewers</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Screen Discovery & Selection",
      description: "Find the perfect screens for your advertising campaigns",
      icon: <Target className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Discovery Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Map Search</h4>
                  <p className="text-sm text-muted-foreground mb-2">Browse screens by location on an interactive map</p>
                  <ul className="text-sm space-y-1">
                    <li>• Filter by distance</li>
                    <li>• View pricing and availability</li>
                    <li>• See audience demographics</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">QR Code Scan</h4>
                  <p className="text-sm text-muted-foreground mb-2">Instantly book screens you see in person</p>
                  <ul className="text-sm space-y-1">
                    <li>• Use mobile app scanner</li>
                    <li>• Get direct booking access</li>
                    <li>• Skip the search process</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Screen Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Each screen profile provides detailed information to help you make informed decisions:</p>
              <div className="grid grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm">
                  <li>• Location and address</li>
                  <li>• Screen size and resolution</li>
                  <li>• Pricing per time slot</li>
                  <li>• Availability calendar</li>
                </ul>
                <ul className="space-y-2 text-sm">
                  <li>• Audience demographics</li>
                  <li>• Peak viewing times</li>
                  <li>• Owner ratings and reviews</li>
                  <li>• Technical specifications</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Campaign Scheduling & Management",
      description: "Schedule your ads and manage your advertising campaigns",
      icon: <Calendar className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduling Your Ads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Time Slots</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Select specific time periods</li>
                    <li>• View pricing by time of day</li>
                    <li>• Book multiple slots in advance</li>
                    <li>• Set recurring schedules</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Campaign Types</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• One-time campaigns</li>
                    <li>• Weekly recurring ads</li>
                    <li>• Monthly promotions</li>
                    <li>• Event-based advertising</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Management Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Track and manage all your advertising campaigns from one central location:</p>
              <div className="grid grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm">
                  <li>• View active campaigns</li>
                  <li>• Monitor spending and budgets</li>
                  <li>• Schedule future content</li>
                </ul>
                <ul className="space-y-2 text-sm">
                  <li>• Performance analytics</li>
                  <li>• Audience engagement metrics</li>
                  <li>• ROI tracking and reporting</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Advanced Features",
      description: "Unlock powerful tools for sophisticated advertising campaigns",
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>A/B Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Test different versions of your ads to optimize performance:</p>
              <ul className="space-y-2 text-sm">
                <li>• Create multiple ad variations</li>
                <li>• Automatically split traffic</li>
                <li>• Compare performance metrics</li>
                <li>• Optimize based on results</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audience Targeting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Reach the right audience with advanced targeting options:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm">
                  <li>• Geographic targeting</li>
                  <li>• Time-based scheduling</li>
                  <li>• Demographic filtering</li>
                </ul>
                <ul className="space-y-2 text-sm">
                  <li>• Behavioral targeting</li>
                  <li>• Device type preferences</li>
                  <li>• Custom audience segments</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Comprehensive insights to measure and improve your campaigns:</p>
              <ul className="space-y-2 text-sm">
                <li>• Real-time performance metrics</li>
                <li>• Audience engagement analytics</li>
                <li>• Cost per impression (CPI) tracking</li>
                <li>• ROI and conversion reporting</li>
                <li>• Custom dashboard creation</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Mobile App Integration",
      description: "Take your advertising campaigns on the go",
      icon: <Smartphone className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Red Square Mobile App</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Download our mobile app for convenient campaign management anywhere:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Key Features</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• QR code scanning for instant booking</li>
                    <li>• Real-time campaign monitoring</li>
                    <li>• Upload content directly from your phone</li>
                    <li>• Push notifications for campaign updates</li>
                    <li>• Location-based screen discovery</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Quick Actions</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Start/stop campaigns instantly</li>
                    <li>• Adjust budgets on the fly</li>
                    <li>• View performance metrics</li>
                    <li>• Receive booking confirmations</li>
                    <li>• Contact screen owners directly</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  return (
    <OnboardingModal
      isOpen={isOpen}
      onClose={onClose}
      onComplete={onComplete}
      steps={steps}
      title="Advertiser Getting Started Guide"
    />
  );
};
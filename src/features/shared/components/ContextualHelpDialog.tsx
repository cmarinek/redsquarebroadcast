import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, Monitor, ArrowRight, HelpCircle, X } from "lucide-react";
import { Link } from "react-router-dom";

interface ContextualHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  context: 'platform' | 'screens' | 'general';
}

export const ContextualHelpDialog = ({ isOpen, onClose, context }: ContextualHelpDialogProps) => {
  const getContextContent = () => {
    switch (context) {
      case 'platform':
        return {
          title: "Platform Mode Help",
          badge: { text: "Platform Mode", className: "bg-primary/10 text-primary border-primary/20" },
          description: "You're currently in Platform mode for content creation and campaign management.",
          sections: [
            {
              title: "What can you do here?",
              items: [
                "Upload images, videos, and GIFs for broadcasting",
                "Discover and book available screens for your content",
                "Schedule content to display at specific times",
                "Track campaign performance and analytics",
                "Manage your advertising budget and payments"
              ]
            },
            {
              title: "Quick Actions",
              items: [
                "Go to 'Find Screens' to discover available displays",
                "Visit 'My Campaigns' to track your active content",
                "Check your analytics to see performance metrics"
              ]
            }
          ]
        };
      
      case 'screens':
        return {
          title: "Screens Mode Help",
          badge: { text: "Screens Mode", className: "bg-green-500/10 text-green-600 border-green-500/20" },
          description: "You're currently in Screens mode for display management and revenue tracking.",
          sections: [
            {
              title: "What can you do here?",
              items: [
                "Register new screens to your network",
                "Set availability times and pricing for your displays",
                "Monitor screen status and performance",
                "Track revenue and earnings from your screens",
                "Download and install the RedSquare Screens app"
              ]
            },
            {
              title: "Quick Actions",
              items: [
                "Go to 'My Screens' to manage your display network",
                "Visit 'Add Screen' to register a new display",
                "Check 'Subscription' for billing and earnings"
              ]
            }
          ]
        };
      
      default:
        return {
          title: "RedSquare Platform Overview",
          badge: { text: "Getting Started", className: "bg-muted text-muted-foreground border-muted-foreground/20" },
          description: "RedSquare is a unified platform connecting advertisers with screen owners.",
          sections: [
            {
              title: "For Advertisers & Broadcasters",
              items: [
                "Upload content and create campaigns",
                "Discover screens in your target locations",
                "Schedule and manage your broadcasts",
                "Track performance and ROI"
              ]
            },
            {
              title: "For Screen Owners",
              items: [
                "Turn any screen into a revenue source",
                "Install the RedSquare Screens app",
                "Set your own pricing and availability",
                "Earn money automatically from content display"
              ]
            }
          ]
        };
    }
  };

  const content = getContextContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-6 h-6 text-primary" />
              <div>
                <DialogTitle>{content.title}</DialogTitle>
                <DialogDescription className="mt-1">
                  {content.description}
                </DialogDescription>
              </div>
            </div>
            <Badge className={content.badge.className}>
              {content.badge.text}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {content.sections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-3 text-foreground">{section.title}</h4>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Quick navigation */}
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-3">Quick Navigation</h4>
            <div className="flex flex-wrap gap-2">
              {context === 'platform' && (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/discover">Find Screens</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/my-campaigns">My Campaigns</Link>
                  </Button>
                </>
              )}
              {context === 'screens' && (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/my-screens">My Screens</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/register-screen">Add Screen</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/setup-redsquare-screen">Setup Guide</Link>
                  </Button>
                </>
              )}
              <Button asChild variant="outline" size="sm">
                <Link to="/how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
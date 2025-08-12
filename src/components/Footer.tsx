import { Monitor, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
export const Footer = () => {
  return <footer className="bg-secondary/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-foreground rounded-sm"></div>
              </div>
              <span className="text-xl font-bold text-foreground">Red Square</span>
            </div>
            <p className="text-muted-foreground">
              Revolutionizing digital advertising through connected screens worldwide.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Platform</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/my-campaigns" className="hover:text-foreground transition-colors">For Advertisers</Link></li>
              <li><Link to="/my-screens" className="hover:text-foreground transition-colors">For Screen Owners</Link></li>
              <li><Link to="/device-setup" className="hover:text-foreground transition-colors">Hardware Solutions</Link></li>
              <li><Link to="/how-it-works" className="hover:text-foreground transition-colors">API Documentation</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Support</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/how-it-works" className="hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link to="/how-it-works" className="hover:text-foreground transition-colors">Getting Started</Link></li>
              <li><Link to="/production-plan" className="hover:text-foreground transition-colors">Production Plan</Link></li>
              <li><a href="mailto:support@redsquare.app" className="hover:text-foreground transition-colors">Technical Support</a></li>
              <li><a href="mailto:support@redsquare.app" className="hover:text-foreground transition-colors">Contact Sales</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@redsquare.app" className="hover:text-foreground transition-colors">support@redsquare.app</a>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <a href="tel:+12153975797" className="hover:text-foreground transition-colors">(215) 397-5797</a>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground">© 2025 Red Square. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <div className="w-7 h-7 rounded-md bg-gradient-primary" aria-hidden="true" />
          <span className="text-foreground">Red Square</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <a href="#how-it-works">How it works</a>
          </Button>
          <Button variant="secondary" asChild>
            <a href="mailto:founders@redsquare.app?subject=Red%20Square%20Inquiry">Contact</a>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Upload, Calendar, DollarSign, Shield, Zap } from "lucide-react";
const features = [{
  icon: Monitor,
  title: "Smart Screen Network",
  description: "Connect to thousands of digital screens in prime locations worldwide.",
  gradient: "from-red-primary to-red-secondary"
}, {
  icon: Upload,
  title: "Easy Content Upload",
  description: "Upload videos, images, and interactive content with our intuitive platform.",
  gradient: "from-red-secondary to-red-glow"
}, {
  icon: Calendar,
  title: "Advanced Scheduling",
  description: "Schedule your broadcasts with precision timing and automated campaigns.",
  gradient: "from-red-glow to-red-primary"
}, {
  icon: DollarSign,
  title: "Flexible Pricing",
  description: "Pay per broadcast or subscribe for unlimited access to our network.",
  gradient: "from-red-primary to-red-secondary"
}, {
  icon: Shield,
  title: "Secure & Reliable",
  description: "Enterprise-grade security with 99.9% uptime guarantee.",
  gradient: "from-red-secondary to-red-glow"
}, {
  icon: Zap,
  title: "Real-time Analytics",
  description: "Track performance, views, and engagement in real-time.",
  gradient: "from-red-glow to-red-primary"
}];
export const Features = () => {
  return <section id="features" className="py-24 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Powerful Features for</span>
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Modern Broadcasting
            </span>
          </h2>
          <p className="text-xl max-w-3xl mx-auto text-slate-50">Upload content, schedule broadcasts, and monetize digital displays worldwide with RedSquare.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => <Card key={index} className="group hover:shadow-[var(--shadow-red)] transition-all duration-300 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </section>;
};
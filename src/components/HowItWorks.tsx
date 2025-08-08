import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Upload, Monitor, DollarSign } from "lucide-react";
import dongleImage from "@/assets/dongle-device.jpg";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Content",
    description: "Create and upload your media content through our web app, mobile app, or desktop application."
  },
  {
    number: "02",
    icon: Monitor,
    title: "Choose Your Screens",
    description: "Select from thousands of available screens in prime locations or connect your own displays."
  },
  {
    number: "03",
    icon: DollarSign,
    title: "Schedule & Pay",
    description: "Set your broadcast schedule, make payment, and watch your content go live on selected screens."
  }
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">How Red Square</span>
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get your content broadcasting in just three simple steps. 
            Our platform makes digital advertising accessible to everyone.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="group hover:shadow-[var(--shadow-red)] transition-all duration-300 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary border-2 border-primary rounded-full flex items-center justify-center text-sm font-bold text-primary">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
              
              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Hardware Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-6">
              <span className="text-foreground">Professional</span>
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Hardware Solution
              </span>
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Our Red Square dongle transforms any display into a smart, connected screen. 
              Easy plug-and-play setup with enterprise-grade reliability.
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                4K video output support
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                WiFi and Ethernet connectivity
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                Remote management capabilities
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                24/7 monitoring and updates
              </li>
            </ul>
          </div>
          
          <div className="relative">
            <div className="relative group">
              <img 
                src={dongleImage} 
                alt="Red Square hardware dongle" 
                className="w-full h-auto rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-glow rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
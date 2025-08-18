import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Upload, Calendar, DollarSign, Shield, Zap } from "lucide-react";
import { useTranslation } from 'react-i18next';

export const Features = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: Monitor,
      title: t('translation.features.smartScreenNetwork'),
      description: t('translation.features.smartScreenNetworkDesc'),
      gradient: "from-red-primary to-red-secondary"
    },
    {
      icon: Upload,
      title: t('translation.features.easyContentUpload'),
      description: t('translation.features.easyContentUploadDesc'),
      gradient: "from-red-secondary to-red-glow"
    },
    {
      icon: Calendar,
      title: t('translation.features.advancedScheduling'),
      description: t('translation.features.advancedSchedulingDesc'),
      gradient: "from-red-glow to-red-primary"
    },
    {
      icon: DollarSign,
      title: t('translation.features.flexiblePricing'),
      description: t('translation.features.flexiblePricingDesc'),
      gradient: "from-red-primary to-red-secondary"
    },
    {
      icon: Shield,
      title: t('translation.features.secureReliable'),
      description: t('translation.features.secureReliableDesc'),
      gradient: "from-red-secondary to-red-glow"
    },
    {
      icon: Zap,
      title: t('translation.features.realTimeAnalytics'),
      description: t('translation.features.realTimeAnalyticsDesc'),
      gradient: "from-red-glow to-red-primary"
    }
  ];
  return (
    <section id="features" className="py-24 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">{t('translation.features.title')}</span>
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {t('translation.features.subtitle')}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('translation.features.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-[var(--shadow-red)] transition-all duration-300 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm"
            >
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
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Upload, Calendar, DollarSign, Shield, Zap } from "lucide-react";
import { useTranslation } from 'react-i18next';

export const Features = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: Monitor,
      title: t('features.smartScreenNetwork'),
      description: t('features.smartScreenNetworkDesc'),
      gradient: "from-red-primary to-red-secondary"
    },
    {
      icon: Upload,
      title: t('features.easyContentUpload'),
      description: t('features.easyContentUploadDesc'),
      gradient: "from-red-secondary to-red-glow"
    },
    {
      icon: Calendar,
      title: t('features.advancedScheduling'),
      description: t('features.advancedSchedulingDesc'),
      gradient: "from-red-glow to-red-primary"
    },
    {
      icon: DollarSign,
      title: t('features.flexiblePricing'),
      description: t('features.flexiblePricingDesc'),
      gradient: "from-red-primary to-red-secondary"
    },
    {
      icon: Shield,
      title: t('features.secureReliable'),
      description: t('features.secureReliableDesc'),
      gradient: "from-red-secondary to-red-glow"
    },
    {
      icon: Zap,
      title: t('features.realTimeAnalytics'),
      description: t('features.realTimeAnalyticsDesc'),
      gradient: "from-red-glow to-red-primary"
    }
  ];
  return (
    <section id="features" className="py-12 sm:py-16 lg:py-24 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4">
            <span className="text-foreground block">{t('features.title')}</span>
            <span className="bg-gradient-primary bg-clip-text text-transparent block">
              {t('features.subtitle')}
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0">
            {t('features.description')}
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-[var(--shadow-red)] transition-all duration-300 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm"
            >
              <CardHeader className="p-4 sm:p-6">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <CardDescription className="text-muted-foreground text-sm sm:text-base">
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
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Upload, Monitor, DollarSign } from "lucide-react";
import dongleImage from "@/assets/dongle-device.jpg";
import { useTranslation } from 'react-i18next';

export const HowItWorks = () => {
  const { t } = useTranslation();
  
  const steps = [
    {
      number: "01",
      icon: Upload,
      title: t('howItWorks.step1Title'),
      description: t('howItWorks.step1Desc')
    },
    {
      number: "02",
      icon: Monitor,
      title: t('howItWorks.step2Title'),
      description: t('howItWorks.step2Desc')
    },
    {
      number: "03",
      icon: DollarSign,
      title: t('howItWorks.step3Title'),
      description: t('howItWorks.step3Desc')
    }
  ];
  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">{t('howItWorks.title')}</span>
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {t('howItWorks.subtitle')}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('howItWorks.description')}
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
              <span className="text-foreground">{t('howItWorks.professionalTitle')}</span>
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {t('howItWorks.hardwareSolutionTitle')}
              </span>
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              {t('howItWorks.hardwareDescription')}
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                {t('howItWorks.feature4kSupport')}
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                {t('howItWorks.featureConnectivity')}
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                {t('howItWorks.featureRemoteManagement')}
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                {t('howItWorks.featureMonitoring')}
              </li>
            </ul>
          </div>
          
          <div className="relative">
            <div className="relative group">
              <img 
                src={dongleImage} 
                alt="Red Square hardware dongle device photo"
                className="w-full h-auto rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-glow rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
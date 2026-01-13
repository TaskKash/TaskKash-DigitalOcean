import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, CheckCircle, Lock, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';

export default function IdentityVerification() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const benefits = [
    {
      icon: TrendingUp,
      title: t('identity.benefits.higherValue.title'),
      description: t('identity.benefits.higherValue.description')
    },
    {
      icon: CheckCircle,
      title: t('identity.benefits.priority.title'),
      description: t('identity.benefits.priority.description')
    },
    {
      icon: Lock,
      title: t('identity.benefits.protection.title'),
      description: t('identity.benefits.protection.description')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('identity.title')} showBack />
      
      <div className="pt-20 pb-24 px-4 max-w-md mx-auto">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-3">{t('identity.hero.title')}</h1>
            <p className="text-muted-foreground">
              {t('identity.hero.subtitle')}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">{t('identity.whyVerify')}</h2>
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Profile Strength */}
          <Card className="p-4 bg-gradient-card border-r-4 border-primary">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{t('identity.currentStrength')}</span>
              <span className="text-2xl font-bold text-secondary">30%</span>
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              {t('identity.strengthIncrease')}
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary w-[30%]"></div>
            </div>
          </Card>

          {/* What you need */}
          <Card className="p-4 bg-blue-50">
            <h3 className="font-semibold mb-3">{t('identity.whatYouNeed.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>{t('identity.whatYouNeed.idCard')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>{t('identity.whatYouNeed.selfie')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>{t('identity.whatYouNeed.time')}</span>
              </li>
            </ul>
          </Card>

          {/* Privacy Note */}
          <Card className="p-4 bg-gray-50">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">{t('identity.privacy.title')}</p>
                <p>{t('identity.privacy.description')}</p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button 
              onClick={() => setLocation('/upload-id')}
              className="w-full h-12 bg-gradient-primary text-white"
            >
              {t('identity.startVerification')}
            </Button>
            <Button 
              onClick={() => setLocation('/home')}
              variant="ghost"
              className="w-full"
            >
              {t('identity.maybeLater')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

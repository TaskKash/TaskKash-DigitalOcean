import React from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import { BrandName } from '@/components/BrandName';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const features = [
    {
      icon: Sparkles,
      title: t('welcome.features.diverse.title'),
      description: t('welcome.features.diverse.description'),
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
    {
      icon: TrendingUp,
      title: t('welcome.features.instant.title'),
      description: t('welcome.features.instant.description'),
      color: 'text-primary',
      bg: 'bg-green-100'
    },
    {
      icon: Shield,
      title: t('welcome.features.secure.title'),
      description: t('welcome.features.secure.description'),
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      icon: Zap,
      title: t('welcome.features.fast.title'),
      description: t('welcome.features.fast.description'),
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full space-y-8">
        {/* Logo & Title */}
        <div className="text-center text-white">
          <div className="w-32 h-32 mx-auto mb-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/welcome')}>
            <img src="/logo.png" alt="TASKKASH Logo" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-4xl font-bold mb-3 text-white">
            {t('welcome.title')} <BrandName size="3xl" />
          </h1>
          <p className="text-xl opacity-90">
            {t('welcome.subtitle')}
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="p-4 text-center">
              <div className={`w-12 h-12 ${feature.bg} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <Card className="p-6 bg-white/95 backdrop-blur">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">50K+</p>
              <p className="text-xs text-muted-foreground">{t('welcome.stats.users')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">2M+</p>
              <p className="text-xs text-muted-foreground">{t('welcome.stats.tasks')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">5M+</p>
              <p className="text-xs text-muted-foreground">{t('welcome.stats.paid')}</p>
            </div>
          </div>
        </Card>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => setLocation('/register')}
            className="w-full h-14 text-lg bg-white text-primary hover:bg-gray-100"
          >
            {t('welcome.buttons.register')}
          </Button>
          
          <Button 
            onClick={() => setLocation('/login')}
            variant="outline"
            className="w-full h-14 text-lg bg-transparent text-white border-2 border-white hover:bg-white/10"
          >
            {t('welcome.buttons.login')}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-primary text-white/80">{t('welcome.or')}</span>
            </div>
          </div>
          
          <Button 
            onClick={() => setLocation('/advertiser/login')}
            variant="outline"
            className="w-full h-12 text-base bg-white/10 text-white border border-white/50 hover:bg-white/20"
          >
            💼 {t('welcome.buttons.advertiser')}
          </Button>
        </div>

        {/* Terms */}
        <p className="text-center text-white/80 text-xs">
          {t('welcome.terms.text')}{' '}
          <button onClick={() => setLocation('/terms')} className="underline">
            {t('welcome.terms.terms')}
          </button>
          {' '}{t('welcome.terms.and')}{' '}
          <button onClick={() => setLocation('/privacy')} className="underline">
            {t('welcome.terms.privacy')}
          </button>
        </p>
      </div>
    </div>
  );
}

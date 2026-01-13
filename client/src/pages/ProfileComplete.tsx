import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { 
  User, Camera, CreditCard, Link2, ChevronRight, 
  CheckCircle, ArrowLeft, Star, Gift, Shield 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MobileLayout from '@/components/layout/MobileLayout';
import { useApp } from '@/contexts/AppContext';
import { trpc } from '@/lib/trpc';

interface ProfileStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  bonus: number;
  completed: boolean;
  optional: boolean;
}

export default function ProfileComplete() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useApp();
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submitKYCMutation = trpc.userProfile.submitKYC.useMutation();
  const connectSocialMutation = trpc.userProfile.connectSocial.useMutation();
  const saveAnswerMutation = trpc.userProfile.saveProfileAnswer.useMutation();

  const steps: ProfileStep[] = [
    {
      id: 'basic',
      title: t('profileComplete.basicInfo'),
      description: t('profileComplete.basicInfoDesc'),
      icon: <User className="w-6 h-6" />,
      bonus: 0,
      completed: !!user?.name,
      optional: false,
    },
    {
      id: 'kyc',
      title: t('profileComplete.verifyIdentity'),
      description: t('profileComplete.verifyIdentityDesc'),
      icon: <CreditCard className="w-6 h-6" />,
      bonus: 20,
      completed: user?.verified || false,
      optional: true,
    },
    {
      id: 'social',
      title: t('profileComplete.connectSocial'),
      description: t('profileComplete.connectSocialDesc'),
      icon: <Link2 className="w-6 h-6" />,
      bonus: 10,
      completed: false,
      optional: true,
    },
    {
      id: 'preferences',
      title: t('profileComplete.preferences'),
      description: t('profileComplete.preferencesDesc'),
      icon: <Star className="w-6 h-6" />,
      bonus: 15,
      completed: false,
      optional: true,
    },
  ];

  const profileStrength = user?.profileStrength || 40;
  const completedSteps = steps.filter(s => s.completed).length;
  const totalBonus = steps.filter(s => s.completed).reduce((sum, s) => sum + s.bonus, 0);

  const handleSkip = () => {
    setLocation('/home');
  };

  const handleStepClick = (stepId: string) => {
    setCurrentStep(stepId);
  };

  const handleKYCUpload = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await submitKYCMutation.mutateAsync({
        userId: user.id,
        documentType: 'national_id',
        documentUrl: '/mock/id-document.jpg',
      });
      setCurrentStep(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialConnect = async (provider: 'google' | 'facebook' | 'instagram') => {
    if (!user) return;
    setIsLoading(true);
    try {
      await connectSocialMutation.mutateAsync({
        userId: user.id,
        provider,
      });
      setCurrentStep(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return <BasicInfoStep onComplete={() => setCurrentStep(null)} />;
      case 'kyc':
        return (
          <KYCStep 
            onUpload={handleKYCUpload} 
            isLoading={isLoading}
            onBack={() => setCurrentStep(null)}
          />
        );
      case 'social':
        return (
          <SocialConnectStep 
            onConnect={handleSocialConnect}
            isLoading={isLoading}
            onBack={() => setCurrentStep(null)}
          />
        );
      case 'preferences':
        return (
          <PreferencesStep 
            userId={user?.id || 0}
            onComplete={() => setCurrentStep(null)}
          />
        );
      default:
        return null;
    }
  };

  if (currentStep) {
    return (
      <MobileLayout title={steps.find(s => s.id === currentStep)?.title || ''} showBack onBack={() => setCurrentStep(null)}>
        <div className="p-4 pb-24">
          {renderStepContent()}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={t('profileComplete.title')} showBottomNav={false}>
      <div className="p-4 pb-24">
        {/* Profile Strength Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">{t('profileComplete.profileStrength')}</h2>
              <p className="text-green-100 text-sm">{t('profileComplete.completeToUnlock')}</p>
            </div>
            <div className="text-4xl font-bold">{profileStrength}%</div>
          </div>
          <div className="w-full bg-green-400/30 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${profileStrength}%` }}
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Gift className="w-5 h-5" />
            <span className="text-sm">{t('profileComplete.bonusEarned')}: +{totalBonus}%</span>
          </div>
        </div>

        {/* Benefits Card */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">
                {t('profileComplete.whyComplete')}
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-500 mt-2 space-y-1">
                <li>• {t('profileComplete.benefit1')}</li>
                <li>• {t('profileComplete.benefit2')}</li>
                <li>• {t('profileComplete.benefit3')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={`w-full bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-4 shadow-sm border transition-all ${
                step.completed 
                  ? 'border-green-200 dark:border-green-800' 
                  : 'border-gray-100 dark:border-gray-700 hover:border-green-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
              }`}>
                {step.completed ? <CheckCircle className="w-6 h-6" /> : step.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                  {step.optional && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded">
                      {t('profileComplete.optional')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{step.description}</p>
                {step.bonus > 0 && !step.completed && (
                  <span className="text-xs text-green-600 font-medium">
                    +{step.bonus}% {t('profileComplete.profileBonus')}
                  </span>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t max-w-md mx-auto">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1 h-12"
            >
              {t('profileComplete.skipForNow')}
            </Button>
            <Button
              onClick={() => setLocation('/home')}
              className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600"
            >
              {t('profileComplete.continue')}
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}

// Sub-components for each step
function BasicInfoStep({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h3 className="font-semibold mb-4">{t('profileComplete.yourName')}</h3>
        <Input
          placeholder={t('profileComplete.enterName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12"
        />
      </div>
      <Button onClick={onComplete} className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600">
        {t('common.save')}
      </Button>
    </div>
  );
}

function KYCStep({ onUpload, isLoading, onBack }: { onUpload: () => void; isLoading: boolean; onBack: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="font-semibold text-lg">{t('profileComplete.uploadID')}</h3>
          <p className="text-sm text-gray-500 mt-2">{t('profileComplete.uploadIDDesc')}</p>
        </div>

        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 transition-colors">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">{t('profileComplete.tapToUpload')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('profileComplete.supportedFormats')}</p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          <strong>{t('profileComplete.mockNote')}:</strong> {t('profileComplete.mockNoteDesc')}
        </p>
      </div>

      <Button 
        onClick={onUpload} 
        disabled={isLoading}
        className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600"
      >
        {isLoading ? t('common.loading') : t('profileComplete.verifyNow')}
      </Button>
    </div>
  );
}

function SocialConnectStep({ onConnect, isLoading, onBack }: { onConnect: (provider: 'google' | 'facebook' | 'instagram') => void; isLoading: boolean; onBack: () => void }) {
  const { t } = useTranslation();

  const socialOptions = [
    { id: 'google', name: 'Google', color: 'bg-red-500', icon: '🔴' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600', icon: '🔵' },
    { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: '📸' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
        {t('profileComplete.socialConnectDesc')}
      </p>

      {socialOptions.map((social) => (
        <button
          key={social.id}
          onClick={() => onConnect(social.id as any)}
          disabled={isLoading}
          className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-green-300 transition-all"
        >
          <div className={`w-12 h-12 ${social.color} rounded-full flex items-center justify-center text-white text-xl`}>
            {social.icon}
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {t('profileComplete.connectWith')} {social.name}
          </span>
        </button>
      ))}

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mt-6">
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          <strong>{t('profileComplete.mockNote')}:</strong> {t('profileComplete.socialMockDesc')}
        </p>
      </div>
    </div>
  );
}

function PreferencesStep({ userId, onComplete }: { userId: number; onComplete: () => void }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>([]);
  const saveAnswerMutation = trpc.userProfile.saveProfileAnswer.useMutation();

  const categories = [
    { id: 'electronics', label: t('profileComplete.cat.electronics'), emoji: '📱' },
    { id: 'fashion', label: t('profileComplete.cat.fashion'), emoji: '👕' },
    { id: 'food', label: t('profileComplete.cat.food'), emoji: '🍔' },
    { id: 'travel', label: t('profileComplete.cat.travel'), emoji: '✈️' },
    { id: 'sports', label: t('profileComplete.cat.sports'), emoji: '⚽' },
    { id: 'gaming', label: t('profileComplete.cat.gaming'), emoji: '🎮' },
    { id: 'beauty', label: t('profileComplete.cat.beauty'), emoji: '💄' },
    { id: 'automotive', label: t('profileComplete.cat.automotive'), emoji: '🚗' },
  ];

  const toggleCategory = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (selected.length > 0) {
      await saveAnswerMutation.mutateAsync({
        userId,
        questionKey: 'interests',
        answerValue: selected.join(','),
      });
    }
    onComplete();
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600 dark:text-gray-400 text-center">
        {t('profileComplete.selectInterests')}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`p-4 rounded-xl border-2 transition-all ${
              selected.includes(cat.id)
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            <span className="text-2xl mb-2 block">{cat.emoji}</span>
            <span className="text-sm font-medium">{cat.label}</span>
          </button>
        ))}
      </div>

      <Button 
        onClick={handleSave} 
        className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600"
        disabled={selected.length === 0}
      >
        {t('common.save')} ({selected.length} {t('profileComplete.selected')})
      </Button>
    </div>
  );
}

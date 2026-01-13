import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MobileLayout from '@/components/layout/MobileLayout';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function ProfileQuestions4() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [maritalStatus, setMaritalStatus] = useState('');
  const [carType, setCarType] = useState('');
  const [housingType, setHousingType] = useState('');

  const handleComplete = async () => {
    if (!maritalStatus || !carType || !housingType) {
      toast.error(t('profileQuestions.fillAllFields'));
      return;
    }

    try {
      // Call API to complete profile and credit wallet
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maritalStatus,
          carType,
          housingType,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        toast.error(t('profileQuestions.sessionExpired'));
        setTimeout(() => setLocation('/login'), 2000);
        return;
      }

      if (response.status === 409) {
        toast.info(t('profileQuestions.alreadyCompleted'));
        setTimeout(() => setLocation('/profile'), 1500);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete profile');
      }

      // Success! Show confetti and success message
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success(t('profileQuestions.success', { reward: 8 }));

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        setLocation('/profile');
      }, 2000);
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error(t('profileQuestions.error'));
    }
  };

  return (
    <MobileLayout title={t('profileQuestions.page4.title')}>
      <div className="px-4 max-w-md mx-auto">
        <div className="space-y-6">
          {/* Progress */}
          <Card className="p-4 bg-gradient-card">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">
                {t('profileQuestions.progress', { current: 4, total: 4 })} {t('profileQuestions.last')}
              </span>
              <span className="text-primary font-bold">+2 {t('currency')}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary w-[100%]"></div>
            </div>
          </Card>

          {/* Intro */}
          <Card className="p-4 bg-gradient-to-r from-primary-50 to-blue-50">
            <p className="text-sm font-semibold text-center">
              {t('profileQuestions.finalStep')}
            </p>
          </Card>

          {/* Marital Status */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('profileQuestions.maritalStatus')}</Label>
            <RadioGroup value={maritalStatus} onValueChange={setMaritalStatus}>
              <Card className="p-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="flex-1 cursor-pointer">
                    {t('profileQuestions.maritalStatus.single')}
                  </Label>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="married" id="married" />
                  <Label htmlFor="married" className="flex-1 cursor-pointer">
                    {t('profileQuestions.maritalStatus.married')}
                  </Label>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="divorced" id="divorced" />
                  <Label htmlFor="divorced" className="flex-1 cursor-pointer">
                    {t('profileQuestions.maritalStatus.divorced')}
                  </Label>
                </div>
              </Card>
            </RadioGroup>
          </div>

          {/* Car Type */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('profileQuestions.carType')}</Label>
            <Select value={carType} onValueChange={setCarType}>
              <SelectTrigger>
                <SelectValue placeholder={t('profileQuestions.carType.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('profileQuestions.carType.none')}</SelectItem>
                <SelectItem value="economy">{t('profileQuestions.carType.economy')}</SelectItem>
                <SelectItem value="mid">{t('profileQuestions.carType.mid')}</SelectItem>
                <SelectItem value="luxury">{t('profileQuestions.carType.luxury')}</SelectItem>
                <SelectItem value="suv">{t('profileQuestions.carType.suv')}</SelectItem>
                <SelectItem value="sports">{t('profileQuestions.carType.sports')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Housing Type */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('profileQuestions.housingType')}</Label>
            <Select value={housingType} onValueChange={setHousingType}>
              <SelectTrigger>
                <SelectValue placeholder={t('profileQuestions.housingType.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owned">{t('profileQuestions.housingType.owned')}</SelectItem>
                <SelectItem value="rent">{t('profileQuestions.housingType.rent')}</SelectItem>
                <SelectItem value="family">{t('profileQuestions.housingType.family')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Completion Reward */}
          <Card className="p-6 bg-gradient-to-r from-primary-100 to-blue-100 border-2 border-primary">
            <div className="text-center">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="font-bold text-lg mb-2">{t('profileQuestions.completionReward')}</h3>
              <p className="text-3xl font-bold text-primary mb-2">+8 {t('currency')}</p>
              <p className="text-sm text-muted-foreground">
                {t('profileQuestions.totalRewards')}
              </p>
            </div>
          </Card>

          {/* Complete Button */}
          <Button 
            onClick={handleComplete}
            disabled={!maritalStatus || !carType || !housingType}
            className="w-full h-12 bg-gradient-primary text-white text-lg"
          >
            {t('profileQuestions.completeProfile')}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}

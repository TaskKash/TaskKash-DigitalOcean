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

export default function ProfileQuestions3() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [shopping, setShopping] = useState('');
  const [tech, setTech] = useState('');
  const [interests, setInterests] = useState('');

  const handleNext = () => {
    if (!shopping || !tech || !interests) {
      toast.error(t('profileQuestions.fillAllFields'));
      return;
    }
    setLocation('/profile-questions-4');
  };

  return (
    <MobileLayout title={t('profileQuestions.page3.title')}>
      <div className="px-4 max-w-md mx-auto">
        <div className="space-y-6">
          {/* Progress */}
          <Card className="p-4 bg-gradient-card">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">
                {t('profileQuestions.progress', { current: 3, total: 4 })}
              </span>
              <span className="text-primary font-bold">+2 {t('currency')}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary w-[75%]"></div>
            </div>
          </Card>

          {/* Shopping */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('profileQuestions.shopping')}</Label>
            <RadioGroup value={shopping} onValueChange={setShopping}>
              <Card className="p-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online" className="flex-1 cursor-pointer">
                    {t('profileQuestions.shopping.online')}
                  </Label>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="offline" id="offline" />
                  <Label htmlFor="offline" className="flex-1 cursor-pointer">
                    {t('profileQuestions.shopping.offline')}
                  </Label>
                </div>
              </Card>
            </RadioGroup>
          </div>

          {/* Tech */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('profileQuestions.tech')}</Label>
            <RadioGroup value={tech} onValueChange={setTech}>
              <Card className="p-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="early" id="early" />
                  <Label htmlFor="early" className="flex-1 cursor-pointer">
                    {t('profileQuestions.tech.early')}
                  </Label>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="wait" id="wait" />
                  <Label htmlFor="wait" className="flex-1 cursor-pointer">
                    {t('profileQuestions.tech.wait')}
                  </Label>
                </div>
              </Card>
            </RadioGroup>
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('profileQuestions.interests')}</Label>
            <Select value={interests} onValueChange={setInterests}>
              <SelectTrigger>
                <SelectValue placeholder={t('profileQuestions.interests.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">{t('profileQuestions.interests.tech')}</SelectItem>
                <SelectItem value="fashion">{t('profileQuestions.interests.fashion')}</SelectItem>
                <SelectItem value="sports">{t('profileQuestions.interests.sports')}</SelectItem>
                <SelectItem value="travel">{t('profileQuestions.interests.travel')}</SelectItem>
                <SelectItem value="food">{t('profileQuestions.interests.food')}</SelectItem>
                <SelectItem value="gaming">{t('profileQuestions.interests.gaming')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Next Button */}
          <Button 
            onClick={handleNext}
            disabled={!shopping || !tech || !interests}
            className="w-full h-12 bg-gradient-primary text-white text-lg"
          >
            {t('next')}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}

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
  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (value: string) => {
    setInterests(prev => 
      prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
    );
  };

  const handleNext = () => {
    if (!shopping || !tech || interests.length === 0) {
      toast.error(t('profileQuestions.fillAllFields'));
      return;
    }

    // Append to sessionStorage
    const currentDraft = JSON.parse(sessionStorage.getItem('profileDraft') || '{}');
    sessionStorage.setItem('profileDraft', JSON.stringify({
      ...currentDraft,
      shopping,
      tech,
      interests // backend expects array, now it is one
    }));

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
            <Label className="text-base font-semibold">{t('profileQuestions.interests')} <span className="text-sm font-normal text-muted-foreground">({t('selectMultiple') || 'متعدد'})</span></Label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'tech', label: t('profileQuestions.interests.tech') },
                { id: 'fashion', label: t('profileQuestions.interests.fashion') },
                { id: 'sports', label: t('profileQuestions.interests.sports') },
                { id: 'travel', label: t('profileQuestions.interests.travel') },
                { id: 'food', label: t('profileQuestions.interests.food') },
                { id: 'gaming', label: t('profileQuestions.interests.gaming') }
              ].map(interest => (
                <div
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`px-4 py-2 rounded-full border cursor-pointer transition-colors text-sm font-medium select-none ${
                    interests.includes(interest.id) 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {interest.label}
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <Button 
            onClick={handleNext}
            disabled={!shopping || !tech || interests.length === 0}
            className="w-full h-12 bg-gradient-primary text-white text-lg"
          >
            {t('next')}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}

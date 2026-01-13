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

export default function ProfileQuestions1() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [gender, setGender] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [education, setEducation] = useState('');

  const handleNext = () => {
    if (!gender || !ageRange || !education) {
      toast.error(t('profileQuestions.fillAllFields'));
      return;
    }
    setLocation('/profile-questions-2');
  };

  return (
    <MobileLayout title={t('profileQuestions.page1.title')}>
      <div className="px-4 max-w-md mx-auto">
        <div className="space-y-6">
          {/* Progress */}
          <Card className="p-4 bg-gradient-card">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">
                {t('profileQuestions.progress', { current: 1, total: 4 })}
              </span>
              <span className="text-primary font-bold">+2 {t('currency')}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary w-[25%]"></div>
            </div>
          </Card>

          {/* Gender */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('profileQuestions.gender')}</Label>
            <RadioGroup value={gender} onValueChange={setGender}>
              <Card className="p-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="flex-1 cursor-pointer">
                    {t('profileQuestions.gender.male')}
                  </Label>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="flex-1 cursor-pointer">
                    {t('profileQuestions.gender.female')}
                  </Label>
                </div>
              </Card>
            </RadioGroup>
          </div>

          {/* Age Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('profileQuestions.age')}</Label>
            <Select value={ageRange} onValueChange={setAgeRange}>
              <SelectTrigger>
                <SelectValue placeholder={t('profileQuestions.age.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="18-24">{t('profileQuestions.age.18-24')}</SelectItem>
                <SelectItem value="25-34">{t('profileQuestions.age.25-34')}</SelectItem>
                <SelectItem value="35-44">{t('profileQuestions.age.35-44')}</SelectItem>
                <SelectItem value="45-54">{t('profileQuestions.age.45-54')}</SelectItem>
                <SelectItem value="55+">{t('profileQuestions.age.55+')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Education */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('profileQuestions.education')}</Label>
            <Select value={education} onValueChange={setEducation}>
              <SelectTrigger>
                <SelectValue placeholder={t('profileQuestions.education.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="highSchool">{t('profileQuestions.education.highSchool')}</SelectItem>
                <SelectItem value="diploma">{t('profileQuestions.education.diploma')}</SelectItem>
                <SelectItem value="bachelor">{t('profileQuestions.education.bachelor')}</SelectItem>
                <SelectItem value="master">{t('profileQuestions.education.master')}</SelectItem>
                <SelectItem value="phd">{t('profileQuestions.education.phd')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Next Button */}
          <Button 
            onClick={handleNext}
            disabled={!gender || !ageRange || !education}
            className="w-full h-12 bg-gradient-primary text-white text-lg"
          >
            {t('next')}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MobileLayout from '@/components/layout/MobileLayout';
import { toast } from 'sonner';

export default function ProfileQuestions2() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [employment, setEmployment] = useState('');
  const [income, setIncome] = useState('');
  const [industry, setIndustry] = useState('');

  const handleNext = () => {
    if (!employment || !income || !industry) {
      toast.error(t('profileQuestions.fillAllFields'));
      return;
    }
    setLocation('/profile-questions-3');
  };

  return (
    <MobileLayout title={t('profileQuestions.page2.title')}>
      <div className="px-4 max-w-md mx-auto">
        <div className="space-y-6">
          {/* Progress */}
          <Card className="p-4 bg-gradient-card">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">
                {t('profileQuestions.progress', { current: 2, total: 4 })}
              </span>
              <span className="text-primary font-bold">+2 {t('currency')}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary w-[50%]"></div>
            </div>
          </Card>

          {/* Employment */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('profileQuestions.employment')}</Label>
            <Select value={employment} onValueChange={setEmployment}>
              <SelectTrigger>
                <SelectValue placeholder={t('profileQuestions.employment.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employed">{t('profileQuestions.employment.employed')}</SelectItem>
                <SelectItem value="selfEmployed">{t('profileQuestions.employment.selfEmployed')}</SelectItem>
                <SelectItem value="student">{t('profileQuestions.employment.student')}</SelectItem>
                <SelectItem value="unemployed">{t('profileQuestions.employment.unemployed')}</SelectItem>
                <SelectItem value="retired">{t('profileQuestions.employment.retired')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Income */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('profileQuestions.income')}</Label>
            <Select value={income} onValueChange={setIncome}>
              <SelectTrigger>
                <SelectValue placeholder={t('profileQuestions.income.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-3000">{t('profileQuestions.income.0-3000')}</SelectItem>
                <SelectItem value="3000-6000">{t('profileQuestions.income.3000-6000')}</SelectItem>
                <SelectItem value="6000-10000">{t('profileQuestions.income.6000-10000')}</SelectItem>
                <SelectItem value="10000-20000">{t('profileQuestions.income.10000-20000')}</SelectItem>
                <SelectItem value="20000+">{t('profileQuestions.income.20000+')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Industry */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('profileQuestions.industry')}</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger>
                <SelectValue placeholder={t('profileQuestions.industry.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">{t('profileQuestions.industry.tech')}</SelectItem>
                <SelectItem value="finance">{t('profileQuestions.industry.finance')}</SelectItem>
                <SelectItem value="education">{t('profileQuestions.industry.education')}</SelectItem>
                <SelectItem value="healthcare">{t('profileQuestions.industry.healthcare')}</SelectItem>
                <SelectItem value="retail">{t('profileQuestions.industry.retail')}</SelectItem>
                <SelectItem value="other">{t('profileQuestions.industry.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Next Button */}
          <Button 
            onClick={handleNext}
            disabled={!employment || !income || !industry}
            className="w-full h-12 bg-gradient-primary text-white text-lg"
          >
            {t('next')}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'wouter';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gift, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrency } from "@/contexts/CurrencyContext";

interface Question {
  key: string;
  type: 'text' | 'select' | 'radio' | 'checkbox' | 'number';
  labelEn: string;
  labelAr: string;
  options?: { value: string; labelEn: string; labelAr: string }[];
  required?: boolean;
}

interface Section {
  key: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  bonusAmount: string;
  multiplierBonus: string;
}

export default function ProfileQuestionsSection() {
  const { currency, symbol, formatAmount } = useCurrency();
  const { sectionKey } = useParams<{ sectionKey: string }>();
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  
  const [section, setSection] = useState<Section | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reward, setReward] = useState<number>(0);

  useEffect(() => {
    fetchQuestions();
  }, [sectionKey]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`/api/profile/questions/${sectionKey}`);
      const data = await res.json();
      
      if (res.ok) {
        setSection(data.section);
        setQuestions(data.questions || []);
      } else {
        toast.error(data.error || 'Failed to load questions');
        setLocation('/my-tier');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields = questions.filter(q => q.required && !answers[q.key]);
    if (missingFields.length > 0) {
      toast.error(i18n.language === 'ar' 
        ? 'يرجى ملء جميع الحقول المطلوبة'
        : 'Please fill all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/profile/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey,
          answers
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setReward(data.bonusAwarded);
        
        // Show success message
        toast.success(i18n.language === 'ar' 
          ? `🎉 لقد ربحت ${data.bonusAwarded} {symbol}!`
          : `🎉 You earned ${data.bonusAwarded} {symbol}!`);

        // Show tier upgrade message if applicable
        if (data.tierChanged) {
          setTimeout(() => {
            toast.success(i18n.language === 'ar' 
              ? `⭐ تمت ترقيتك إلى ${data.newTier}!`
              : `⭐ You've been upgraded to ${data.newTier}!`);
          }, 1000);
        }

        // Redirect after 2 seconds
        setTimeout(() => {
          setLocation('/my-tier');
        }, 2000);
      } else {
        toast.error(data.error || 'Failed to submit answers');
      }
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error('Failed to submit answers');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const label = i18n.language === 'ar' ? question.labelAr : question.labelEn;

    switch (question.type) {
      case 'text':
        return (
          <div key={question.key} className="space-y-2">
            <Label htmlFor={question.key}>
              {label} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={question.key}
              value={answers[question.key] || ''}
              onChange={(e) => setAnswers({ ...answers, [question.key]: e.target.value })}
              required={question.required}
            />
          </div>
        );

      case 'number':
        return (
          <div key={question.key} className="space-y-2">
            <Label htmlFor={question.key}>
              {label} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={question.key}
              type="number"
              value={answers[question.key] || ''}
              onChange={(e) => setAnswers({ ...answers, [question.key]: e.target.value })}
              required={question.required}
            />
          </div>
        );

      case 'select':
        return (
          <div key={question.key} className="space-y-2">
            <Label htmlFor={question.key}>
              {label} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={answers[question.key] || ''}
              onValueChange={(value) => setAnswers({ ...answers, [question.key]: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={i18n.language === 'ar' ? 'اختر...' : 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {i18n.language === 'ar' ? option.labelAr : option.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'radio':
        return (
          <div key={question.key} className="space-y-2">
            <Label>
              {label} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <RadioGroup
              value={answers[question.key] || ''}
              onValueChange={(value) => setAnswers({ ...answers, [question.key]: value })}
            >
              {question.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value={option.value} id={`${question.key}-${option.value}`} />
                  <Label htmlFor={`${question.key}-${option.value}`} className="font-normal cursor-pointer">
                    {i18n.language === 'ar' ? option.labelAr : option.labelEn}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'checkbox':
        return (
          <div key={question.key} className="space-y-2">
            <Label>
              {label} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="space-y-2">
              {question.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id={`${question.key}-${option.value}`}
                    checked={(answers[question.key] || []).includes(option.value)}
                    onCheckedChange={(checked) => {
                      const currentValues = answers[question.key] || [];
                      const newValues = checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v: string) => v !== option.value);
                      setAnswers({ ...answers, [question.key]: newValues });
                    }}
                  />
                  <Label htmlFor={`${question.key}-${option.value}`} className="font-normal cursor-pointer">
                    {i18n.language === 'ar' ? option.labelAr : option.labelEn}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <MobileLayout title={i18n.language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (success) {
    return (
      <MobileLayout title={i18n.language === 'ar' ? 'نجاح!' : 'Success!'}>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {i18n.language === 'ar' ? 'تهانينا!' : 'Congratulations!'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {i18n.language === 'ar' 
              ? `لقد أكملت ${section?.nameAr} بنجاح`
              : `You've successfully completed ${section?.nameEn}`}
          </p>
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="w-6 h-6 text-green-500" />
              <span className="text-sm text-muted-foreground">
                {i18n.language === 'ar' ? 'المكافأة' : 'Reward'}
              </span>
            </div>
            <div className="text-3xl font-bold text-green-600">
              +{reward} {symbol}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {i18n.language === 'ar' 
              ? 'سيتم توجيهك إلى صفحة المستوى...'
              : 'Redirecting to My Tier page...'}
          </p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={i18n.language === 'ar' ? section?.nameAr : section?.nameEn}>
      <div className="space-y-4 pb-20">
        {/* Header Card */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg mb-1">
                {i18n.language === 'ar' ? section?.nameAr : section?.nameEn}
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                {i18n.language === 'ar' ? section?.descriptionAr : section?.descriptionEn}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {i18n.language === 'ar' ? 'المكافأة:' : 'Reward:'}
                </span>
                <span className="font-bold text-green-600">
                  +{section?.bonusAmount} {symbol}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Questions Form */}
        <form onSubmit={handleSubmit}>
          <Card className="p-6">
            <div className="space-y-6">
              {questions.map(renderQuestion)}
            </div>

            <Button 
              type="submit" 
              className="w-full mt-6"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {i18n.language === 'ar' ? 'جارٍ الإرسال...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  {i18n.language === 'ar' ? 'إرسال واحصل على المكافأة' : 'Submit & Get Reward'}
                </>
              )}
            </Button>
          </Card>
        </form>
      </div>
    </MobileLayout>
  );
}

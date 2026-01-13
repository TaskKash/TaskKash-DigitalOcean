import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronRight, ChevronLeft, CheckCircle2, Lock, Star, 
  Briefcase, Heart, ShoppingBag, TrendingUp, Target, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

interface Question {
  id: number;
  questionKey: string;
  questionTextEn: string;
  questionTextAr: string;
  questionType: 'single_choice' | 'multiple_choice';
  options: string[];
  currentAnswer: string | null;
}

export default function ProfileTierQuestions() {
  const { t, i18n } = useTranslation();
  const { user } = useApp();
  const [, setLocation] = useLocation();
  const isRTL = i18n.language === 'ar';
  
  const [currentTier, setCurrentTier] = useState<'tier1' | 'tier2' | 'tier3'>('tier1');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch completion status
  const { data: completionStatus, refetch: refetchStatus } = trpc.profileTiers.getCompletionStatus.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // Fetch questions for current tier
  const { data: questionsData, isLoading } = trpc.profileTiers.getQuestions.useQuery(
    { tier: currentTier, userId: user?.id },
    { enabled: !!user?.id }
  );

  // Submit answers mutation
  const submitAnswers = trpc.profileTiers.submitAnswers.useMutation({
    onSuccess: (data) => {
      toast.success(isRTL ? 'تم حفظ إجاباتك بنجاح!' : 'Your answers have been saved!');
      refetchStatus();
      
      // Move to next tier or finish
      if (currentTier === 'tier1' && !completionStatus?.tier2.isComplete) {
        setCurrentTier('tier2');
        setCurrentQuestionIndex(0);
        setAnswers({});
      } else if (currentTier === 'tier2' && !completionStatus?.tier3.isComplete) {
        setCurrentTier('tier3');
        setCurrentQuestionIndex(0);
        setAnswers({});
      } else {
        setLocation('/profile');
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Load existing answers
  useEffect(() => {
    if (questionsData?.questions) {
      const existingAnswers: Record<string, any> = {};
      questionsData.questions.forEach((q: Question) => {
        if (q.currentAnswer) {
          try {
            existingAnswers[q.questionKey] = JSON.parse(q.currentAnswer);
          } catch {
            existingAnswers[q.questionKey] = q.currentAnswer;
          }
        }
      });
      setAnswers(existingAnswers);
    }
  }, [questionsData]);

  // Determine which tier to start with
  useEffect(() => {
    if (completionStatus) {
      if (!completionStatus.tier1.isComplete) {
        setCurrentTier('tier1');
      } else if (!completionStatus.tier2.isComplete) {
        setCurrentTier('tier2');
      } else if (!completionStatus.tier3.isComplete) {
        setCurrentTier('tier3');
      }
    }
  }, [completionStatus]);

  const questions = questionsData?.questions || [];
  const currentQuestion = questions[currentQuestionIndex] as Question | undefined;
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleSingleChoice = (value: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.questionKey]: value }));
  };

  const handleMultipleChoice = (value: string, checked: boolean) => {
    if (!currentQuestion) return;
    const current = answers[currentQuestion.questionKey] || [];
    const updated = checked 
      ? [...current, value]
      : current.filter((v: string) => v !== value);
    setAnswers(prev => ({ ...prev, [currentQuestion.questionKey]: updated }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!user?.id) return;
    setIsSubmitting(true);
    submitAnswers.mutate({
      userId: user.id,
      tier: currentTier,
      answers,
    });
    setIsSubmitting(false);
  };

  const isCurrentAnswered = () => {
    if (!currentQuestion) return false;
    const answer = answers[currentQuestion.questionKey];
    if (currentQuestion.questionType === 'multiple_choice') {
      return answer && answer.length > 0;
    }
    return !!answer;
  };

  const getTierInfo = (tier: 'tier1' | 'tier2' | 'tier3') => {
    const tiers = {
      tier1: {
        icon: Briefcase,
        title: isRTL ? 'المستوى الأول - أساسي' : 'Tier 1 - Basic',
        description: isRTL ? 'اهتماماتك وعاداتك الأساسية' : 'Your basic interests and habits',
        color: 'bg-blue-100 text-blue-600',
        targetTier: isRTL ? 'فضي' : 'Silver',
      },
      tier2: {
        icon: ShoppingBag,
        title: isRTL ? 'المستوى الثاني - متقدم' : 'Tier 2 - Advanced',
        description: isRTL ? 'تفضيلات التسوق والعلامات التجارية' : 'Shopping and brand preferences',
        color: 'bg-amber-100 text-amber-600',
        targetTier: isRTL ? 'ذهبي' : 'Gold',
      },
      tier3: {
        icon: Target,
        title: isRTL ? 'المستوى الثالث - خبير' : 'Tier 3 - Expert',
        description: isRTL ? 'نمط الحياة والأهداف' : 'Lifestyle and goals',
        color: 'bg-purple-100 text-purple-600',
        targetTier: isRTL ? 'بلاتيني' : 'Platinum',
      },
    };
    return tiers[tier];
  };

  const tierInfo = getTierInfo(currentTier);
  const TierIcon = tierInfo.icon;

  // Check if behavioral consent is enabled
  if (completionStatus && !completionStatus.behavioralConsentEnabled) {
    return (
      <MobileLayout title={isRTL ? 'أسئلة الملف الشخصي' : 'Profile Questions'} showBack>
        <div className="p-4 space-y-6">
          <Alert className="bg-amber-50 border-amber-200">
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              {isRTL 
                ? 'يجب تفعيل موافقة التحليل السلوكي للوصول إلى أسئلة الملف الشخصي'
                : 'Behavioral profiling consent must be enabled to access profile questions'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => setLocation('/settings/consent')} className="w-full">
            {isRTL ? 'تفعيل الموافقة' : 'Enable Consent'}
          </Button>
        </div>
      </MobileLayout>
    );
  }

  if (isLoading) {
    return (
      <MobileLayout title={isRTL ? 'أسئلة الملف الشخصي' : 'Profile Questions'} showBack>
        <div className="p-4 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={isRTL ? 'أسئلة الملف الشخصي' : 'Profile Questions'} showBack>
      <div className="p-4 space-y-4 pb-32">
        {/* Tier Header */}
        <Card className={tierInfo.color.replace('text-', 'border-').replace('-600', '-200')}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${tierInfo.color.split(' ')[0]} flex items-center justify-center`}>
                <TierIcon className={`w-6 h-6 ${tierInfo.color.split(' ')[1]}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{tierInfo.title}</h3>
                <p className="text-sm text-muted-foreground">{tierInfo.description}</p>
              </div>
              <Badge variant="secondary">
                <Star className="w-3 h-3 mr-1" />
                {tierInfo.targetTier}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {isRTL ? `السؤال ${currentQuestionIndex + 1} من ${questions.length}` : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg leading-relaxed">
                {isRTL ? currentQuestion.questionTextAr : currentQuestion.questionTextEn}
              </CardTitle>
              {currentQuestion.questionType === 'multiple_choice' && (
                <CardDescription>
                  {isRTL ? 'يمكنك اختيار أكثر من إجابة' : 'You can select multiple answers'}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {currentQuestion.questionType === 'single_choice' ? (
                <RadioGroup
                  value={answers[currentQuestion.questionKey] || ''}
                  onValueChange={handleSingleChoice}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 space-x-reverse">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer py-2">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const currentAnswers = answers[currentQuestion.questionKey] || [];
                    const isChecked = currentAnswers.includes(option);
                    return (
                      <div key={index} className="flex items-center space-x-3 space-x-reverse">
                        <Checkbox
                          id={`option-${index}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => handleMultipleChoice(option, checked as boolean)}
                        />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer py-2">
                          {option}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tier Progress Overview */}
        {completionStatus && (
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {completionStatus.tier1.isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                  )}
                  <span>{isRTL ? 'المستوى 1' : 'Tier 1'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {completionStatus.tier2.isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                  )}
                  <span>{isRTL ? 'المستوى 2' : 'Tier 2'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {completionStatus.tier3.isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                  )}
                  <span>{isRTL ? 'المستوى 3' : 'Tier 3'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex-1"
          >
            {isRTL ? <ChevronRight className="w-4 h-4 ml-2" /> : <ChevronLeft className="w-4 h-4 mr-2" />}
            {isRTL ? 'السابق' : 'Previous'}
          </Button>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!isCurrentAnswered() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting 
                ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
                : (isRTL ? 'إنهاء المستوى' : 'Complete Tier')}
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isCurrentAnswered()}
              className="flex-1"
            >
              {isRTL ? 'التالي' : 'Next'}
              {isRTL ? <ChevronLeft className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

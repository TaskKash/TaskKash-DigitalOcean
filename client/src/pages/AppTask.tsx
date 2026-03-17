import { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLocation, useParams } from 'wouter';
import { Download, CheckCircle2, Smartphone, ExternalLink, Camera } from 'lucide-react';
import { useNavigationWarning } from '@/hooks/useNavigationWarning';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useCurrency } from "@/contexts/CurrencyContext";

interface AppTaskData {
  appName: string;
  appNameAr: string;
  appStoreUrl: string;
  playStoreUrl: string;
  appIcon: string;
  requiredActions: string[];
  verificationQuestions: {
    id: number;
    questionEn: string;
    questionAr: string;
    options: string[];
    optionsAr: string[];
    correctAnswer: number;
  }[];
}

export default function AppTask() {
  const { currency, symbol, formatAmount } = useCurrency();
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const taskId = parseInt(params.id || '0');
  
  const [step, setStep] = useState<'download' | 'verify' | 'questions'>('download');
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);

  const isArabic = i18n.language === 'ar';

  // Fetch task details
  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch task');
      return res.json();
    }
  });

  // Submit task mutation
  const submitMutation = useMutation({
    mutationFn: async (data: { answers: string[], screenshotUrl?: string }) => {
      const res = await fetch(`/api/tasks/${taskId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to submit task');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.passed) {
        toast.success(isArabic ? `تم إكمال المهمة! حصلت على ${task?.reward} {symbol}` : `Task completed! You earned ${task?.reward} {symbol}`);
        setLocation('/tasks');
      } else {
        toast.error(isArabic ? 'لم تجتاز المهمة. حاول مرة أخرى.' : 'Task not passed. Try again.');
      }
    },
    onError: () => {
      toast.error(isArabic ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.');
    }
  });

  // Navigation warning when task is in progress
  const isTaskInProgress = hasDownloaded && step !== 'questions';
  useNavigationWarning(isTaskInProgress, isArabic 
    ? 'لديك مهمة قيد التنفيذ. هل أنت متأكد أنك تريد المغادرة؟'
    : 'You have an active task in progress. Are you sure you want to leave?');

  const taskData: AppTaskData = task?.taskData ? 
    (typeof task.taskData === 'string' ? JSON.parse(task.taskData) : task.taskData) : null;

  const handleDownload = () => {
    const url = /iPhone|iPad|iPod/i.test(navigator.userAgent) 
      ? taskData?.appStoreUrl 
      : taskData?.playStoreUrl;
    
    if (url) {
      window.open(url, '_blank');
      setHasDownloaded(true);
      toast.success(isArabic ? 'جاري فتح متجر التطبيقات...' : 'Opening app store...');
    }
  };

  const handleOpenApp = () => {
    setHasOpened(true);
    toast.success(isArabic ? 'تم التأكيد! الآن أجب على الأسئلة' : 'Confirmed! Now answer the questions');
    setStep('questions');
  };

  const handleSubmit = () => {
    const answerArray = Object.values(answers);
    if (answerArray.length < (taskData?.verificationQuestions?.length || 0)) {
      toast.error(isArabic ? 'الرجاء الإجابة على جميع الأسئلة' : 'Please answer all questions');
      return;
    }

    setIsSubmitting(true);
    submitMutation.mutate({ answers: answerArray });
  };

  if (isLoading) {
    return (
      <MobileLayout title={isArabic ? 'تحميل التطبيق' : 'App Download'} showBack>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={isArabic ? task?.titleAr : task?.titleEn} showBack>
      <div className="p-4 space-y-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          <div className={`flex items-center ${step === 'download' ? 'text-primary' : 'text-green-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasDownloaded ? 'bg-green-500 text-white' : 'bg-primary/20'}`}>
              {hasDownloaded ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <span className="mx-2 text-sm">{isArabic ? 'تحميل' : 'Download'}</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-2">
            <div className={`h-full bg-primary transition-all ${hasDownloaded ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className={`flex items-center ${step === 'questions' ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'questions' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="mx-2 text-sm">{isArabic ? 'تأكيد' : 'Verify'}</span>
          </div>
        </div>

        {/* App Info Card */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              {taskData?.appIcon ? (
                <img src={taskData.appIcon} alt="App" className="w-12 h-12 rounded-lg" />
              ) : (
                <Smartphone className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{isArabic ? taskData?.appNameAr : taskData?.appName}</h3>
              <p className="text-sm text-muted-foreground">
                {isArabic ? task?.descriptionAr : task?.descriptionEn}
              </p>
            </div>
          </div>
        </Card>

        {/* Download Step */}
        {step === 'download' && (
          <Card className="p-4 space-y-4">
            <h4 className="font-semibold">{isArabic ? 'الخطوات المطلوبة:' : 'Required Steps:'}</h4>
            <ul className="space-y-2">
              {taskData?.requiredActions?.map((action, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{action}</span>
                </li>
              ))}
            </ul>

            <Button 
              onClick={handleDownload} 
              className="w-full" 
              size="lg"
              disabled={hasDownloaded}
            >
              <Download className="w-5 h-5 mr-2" />
              {hasDownloaded 
                ? (isArabic ? 'تم التحميل' : 'Downloaded') 
                : (isArabic ? 'تحميل التطبيق' : 'Download App')}
            </Button>

            {hasDownloaded && (
              <Button 
                onClick={handleOpenApp} 
                className="w-full" 
                size="lg"
                variant="outline"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                {isArabic ? 'فتحت التطبيق وأكملت الخطوات' : 'I opened the app and completed the steps'}
              </Button>
            )}
          </Card>
        )}

        {/* Questions Step */}
        {step === 'questions' && taskData?.verificationQuestions && (
          <Card className="p-4 space-y-6">
            <h4 className="font-semibold">{isArabic ? 'أسئلة التحقق:' : 'Verification Questions:'}</h4>
            
            {taskData.verificationQuestions.map((q, qIdx) => (
              <div key={q.id} className="space-y-3">
                <p className="font-medium">{qIdx + 1}. {isArabic ? q.questionAr : q.questionEn}</p>
                <RadioGroup
                  value={answers[qIdx] || ''}
                  onValueChange={(value) => setAnswers(prev => ({ ...prev, [qIdx]: value }))}
                >
                  {(isArabic ? q.optionsAr : q.options).map((option, oIdx) => (
                    <div key={oIdx} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value={oIdx.toString()} id={`q${qIdx}-o${oIdx}`} />
                      <Label htmlFor={`q${qIdx}-o${oIdx}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}

            <Button 
              onClick={handleSubmit} 
              className="w-full" 
              size="lg"
              disabled={isSubmitting || Object.keys(answers).length < taskData.verificationQuestions.length}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {isArabic ? 'إرسال الإجابات' : 'Submit Answers'}
                </>
              )}
            </Button>
          </Card>
        )}

        {/* Reward Info */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{isArabic ? 'المكافأة:' : 'Reward:'}</span>
            <span className="font-bold text-primary text-lg">{task?.reward} {isArabic ? symbol : currency}</span>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}

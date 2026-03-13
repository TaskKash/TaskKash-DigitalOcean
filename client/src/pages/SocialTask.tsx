import { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLocation, useParams } from 'wouter';
import { CheckCircle2, ExternalLink, Share2, Heart, MessageCircle, Users } from 'lucide-react';
import { useNavigationWarning } from '@/hooks/useNavigationWarning';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';

interface SocialAction {
  id: number;
  type: 'follow' | 'like' | 'comment' | 'share' | 'subscribe';
  platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'tiktok';
  url: string;
  descriptionEn: string;
  descriptionAr: string;
  completed: boolean;
}

interface SocialTaskData {
  actions: SocialAction[];
  verificationQuestions: {
    id: number;
    questionEn: string;
    questionAr: string;
    options: string[];
    optionsAr: string[];
    correctAnswer: number;
  }[];
  proofRequired: boolean;
  proofType?: 'screenshot' | 'username' | 'link';
}

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Share2 className="w-5 h-5" />,
  instagram: <Heart className="w-5 h-5" />,
  twitter: <MessageCircle className="w-5 h-5" />,
  youtube: <Users className="w-5 h-5" />,
  tiktok: <Share2 className="w-5 h-5" />
};

const actionLabels: Record<string, { en: string; ar: string }> = {
  follow: { en: 'Follow', ar: 'متابعة' },
  like: { en: 'Like', ar: 'إعجاب' },
  comment: { en: 'Comment', ar: 'تعليق' },
  share: { en: 'Share', ar: 'مشاركة' },
  subscribe: { en: 'Subscribe', ar: 'اشتراك' }
};

export default function SocialTask() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const taskId = parseInt(params.id || '0');
  
  const [step, setStep] = useState<'actions' | 'verify' | 'questions'>('actions');
  const [completedActions, setCompletedActions] = useState<Set<number>>(new Set());
  const [proofInput, setProofInput] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    mutationFn: async (data: { answers: string[], proof?: string }) => {
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
        toast.success(isArabic ? `تم إكمال المهمة! حصلت على ${task?.reward} ج.م` : `Task completed! You earned ${task?.reward} EGP`);
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
  const isTaskInProgress = completedActions.size > 0 && step !== 'questions';
  useNavigationWarning(isTaskInProgress, isArabic 
    ? 'لديك مهمة قيد التنفيذ. هل أنت متأكد أنك تريد المغادرة؟'
    : 'You have an active task in progress. Are you sure you want to leave?');

  const taskData: SocialTaskData = task?.taskData ? 
    (typeof task.taskData === 'string' ? JSON.parse(task.taskData) : task.taskData) : null;

  const handleActionClick = (action: SocialAction) => {
    window.open(action.url, '_blank');
    setCompletedActions(prev => {
      const next = new Set(prev);
      next.add(action.id);
      return next;
    });
    toast.success(isArabic ? 'تم فتح الرابط' : 'Link opened');
  };

  const handleContinue = () => {
    if (taskData?.proofRequired) {
      setStep('verify');
    } else {
      setStep('questions');
    }
  };

  const handleVerifySubmit = () => {
    if (taskData?.proofRequired && !proofInput) {
      toast.error(isArabic ? 'الرجاء إدخال الإثبات المطلوب' : 'Please provide the required proof');
      return;
    }
    setStep('questions');
  };

  const handleSubmit = () => {
    const answerArray = Object.values(answers);
    if (answerArray.length < (taskData?.verificationQuestions?.length || 0)) {
      toast.error(isArabic ? 'الرجاء الإجابة على جميع الأسئلة' : 'Please answer all questions');
      return;
    }

    setIsSubmitting(true);
    submitMutation.mutate({ answers: answerArray, proof: proofInput });
  };

  if (isLoading) {
    return (
      <MobileLayout title={isArabic ? 'مهمة اجتماعية' : 'Social Task'} showBack>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>
    );
  }

  const allActionsCompleted = completedActions.size >= (taskData?.actions?.length || 0);

  return (
    <MobileLayout title={isArabic ? task?.titleAr : task?.titleEn} showBack>
      <div className="p-4 space-y-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-4">
          {['actions', 'verify', 'questions'].map((s, idx) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s ? 'bg-primary text-white' : 
                ['actions', 'verify'].indexOf(step) > idx ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                {['actions', 'verify'].indexOf(step) > idx ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              {idx < 2 && <div className="w-12 h-1 bg-gray-200 mx-1"><div className={`h-full bg-primary transition-all ${['actions', 'verify'].indexOf(step) > idx ? 'w-full' : 'w-0'}`}></div></div>}
            </div>
          ))}
        </div>

        {/* Actions Step */}
        {step === 'actions' && (
          <>
            <Card className="p-4">
              <h3 className="font-semibold mb-4">{isArabic ? 'الإجراءات المطلوبة:' : 'Required Actions:'}</h3>
              <div className="space-y-3">
                {taskData?.actions?.map((action) => (
                  <div 
                    key={action.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      completedActions.has(action.id) ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        completedActions.has(action.id) ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
                      }`}>
                        {completedActions.has(action.id) ? <CheckCircle2 className="w-5 h-5" /> : platformIcons[action.platform]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {isArabic ? actionLabels[action.type].ar : actionLabels[action.type].en} - {action.platform}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isArabic ? action.descriptionAr : action.descriptionEn}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant={completedActions.has(action.id) ? "outline" : "default"}
                      onClick={() => handleActionClick(action)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Button 
              onClick={handleContinue} 
              className="w-full" 
              size="lg"
              disabled={!allActionsCompleted}
            >
              {allActionsCompleted 
                ? (isArabic ? 'متابعة' : 'Continue') 
                : (isArabic ? `أكمل ${taskData?.actions?.length - completedActions.size} إجراءات` : `Complete ${taskData?.actions?.length - completedActions.size} more actions`)}
            </Button>
          </>
        )}

        {/* Verify Step */}
        {step === 'verify' && taskData?.proofRequired && (
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">{isArabic ? 'إثبات الإكمال:' : 'Proof of Completion:'}</h3>
            <p className="text-sm text-muted-foreground">
              {taskData.proofType === 'username' 
                ? (isArabic ? 'أدخل اسم المستخدم الخاص بك على المنصة' : 'Enter your username on the platform')
                : taskData.proofType === 'link'
                  ? (isArabic ? 'أدخل رابط منشورك أو تعليقك' : 'Enter the link to your post or comment')
                  : (isArabic ? 'أدخل الإثبات المطلوب' : 'Enter the required proof')}
            </p>
            <Input 
              value={proofInput}
              onChange={(e) => setProofInput(e.target.value)}
              placeholder={taskData.proofType === 'username' ? '@username' : 'https://...'}
            />
            <Button onClick={handleVerifySubmit} className="w-full" size="lg">
              {isArabic ? 'متابعة' : 'Continue'}
            </Button>
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
                  {isArabic ? 'إرسال' : 'Submit'}
                </>
              )}
            </Button>
          </Card>
        )}

        {/* Reward Info */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{isArabic ? 'المكافأة:' : 'Reward:'}</span>
            <span className="font-bold text-primary text-lg">{task?.reward} {isArabic ? 'ج.م' : 'EGP'}</span>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}

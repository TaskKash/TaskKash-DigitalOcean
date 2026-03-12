import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocation, useRoute } from 'wouter';
import { Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { ProgressTracker, TaskStep } from '@/components/ProgressTracker';
import { ProofUpload, ProofImage } from '@/components/ProofUpload';
import { useLocalizedFieldGetter } from '@/lib/languageUtils';
import { useTranslation } from 'react-i18next';

const taskTypeIcons: Record<string, string> = {
  survey: '📋',
  video: '🎥',
  app: '📱',
  social: '👥',
  quiz: '❓',
  photo: '📸',
  visit: '📍'
};

const taskTypeNames: Record<string, string> = {
  survey: 'استبيان',
  video: 'فيديو',
  app: 'تطبيق',
  social: 'سوشيال ميديا',
  quiz: 'اختبار',
  photo: 'تصوير',
  visit: 'زيارة ميدانية'
};

export default function TaskDetail() {
  const { t } = useTranslation();
  const getLocalizedField = useLocalizedFieldGetter();
  const [, params] = useRoute('/tasks/:id');
  const [, setLocation] = useLocation();
  const { tasks, completeTask, refreshUser, refreshTransactions } = useApp();
  const [isStarting, setIsStarting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedProof, setUploadedProof] = useState<ProofImage[]>([]);

  const task = tasks.find(t => t.id === params?.id);

  // Redirect video, quiz, and survey tasks to new completion flow
  useEffect(() => {
    if (task && (task.type === 'video' || task.type === 'quiz')) {
      setLocation(`/tasks/${task.id}/complete`);
    } else if (task && task.type === 'survey') {
      setLocation(`/tasks/${task.id}/survey`);
    }
  }, [task, setLocation]);

  // Define task steps for Progress Tracker
  const taskSteps: TaskStep[] = [
    {
      id: 1,
      title: 'قبول المهمة',
      description: 'تم قبول المهمة بنجاح',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'in_progress' : 'pending',
      estimatedDuration: 1,
      completedAt: currentStep > 1 ? new Date() : undefined,
    },
    {
      id: 2,
      title: 'قراءة التعليمات',
      description: 'اقرأ تعليمات المهمة بعناية',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'in_progress' : 'pending',
      estimatedDuration: 2,
      completedAt: currentStep > 2 ? new Date() : undefined,
    },
    {
      id: 3,
      title: 'تنفيذ المهمة',
      description: 'قم بتنفيذ المهمة حسب التعليمات',
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'in_progress' : 'pending',
      estimatedDuration: task?.duration || 5,
      completedAt: currentStep > 3 ? new Date() : undefined,
    },
    {
      id: 4,
      title: 'رفع الإثبات',
      description: 'ارفع صور تثبت إكمال المهمة',
      status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'in_progress' : 'pending',
      estimatedDuration: 2,
      completedAt: currentStep > 4 ? new Date() : undefined,
    },
    {
      id: 5,
      title: 'انتظار المراجعة',
      description: 'سيتم مراجعة المهمة خلال 24 ساعة',
      status: currentStep > 5 ? 'completed' : currentStep === 5 ? 'in_progress' : 'pending',
      estimatedDuration: 1440, // 24 hours
      completedAt: currentStep > 5 ? new Date() : undefined,
    },
    {
      id: 6,
      title: 'استلام المكافأة',
      description: 'ستحصل على المكافأة فور الموافقة',
      status: currentStep > 6 ? 'completed' : currentStep === 6 ? 'in_progress' : 'pending',
      estimatedDuration: 1,
      completedAt: currentStep > 6 ? new Date() : undefined,
    },
  ];

  if (!task) {
    return (
      <MobileLayout title="المهمة" showBack>
        <div className="p-4">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">المهمة غير موجودة</p>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  const handleStartTask = async () => {
    if (!task) return;
    setIsStarting(true);
    
    try {
      if (localStorage.getItem('demo-mode') !== 'true') {
        const res = await fetch(`/api/tasks/${task.id}/start`, { method: 'POST' });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to start task');
        }
      }

      toast.success('تم بدء المهمة بنجاح!');
      setCurrentStep(2);
      toast.info('اقرأ التعليمات بعناية');
    } catch (error: any) {
      console.error('Start task error:', error);
      toast.error(error.message || 'حدث خطأ أثناء بدء المهمة');
    } finally {
      setIsStarting(false);
    }
  };

  const handleReadInstructions = () => {
    setCurrentStep(3);
    toast.info('ابدأ بتنفيذ المهمة الآن');
  };

  const handleExecuteTask = () => {
    setCurrentStep(4);
    toast.info('ارفع صور تثبت إكمال المهمة');
  };

  const handleProofUpload = async (images: ProofImage[]) => {
    setUploadedProof(images);
    setCurrentStep(5);
    toast.success('تم رفع الإثبات بنجاح!');

    try {
      // Submit to backend
      const res = await fetch(`/api/tasks/${task.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: images.map(img => img.url) }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit task');
      }

      // Refresh context data
      await refreshUser();
      await refreshTransactions();

      setCurrentStep(6);
      completeTask(task.id);
      toast.success(`تهانينا! حصلت على ${task.reward} ج.م`);

      // Redirect after 2 seconds
      setTimeout(() => {
        setLocation('/tasks');
      }, 2000);
    } catch (error: any) {
      console.error('Submit task error:', error);
      toast.error(error.message || 'حدث خطأ أثناء إرسال إثبات المهمة');
      setCurrentStep(4); // Revert back to proof upload step
    }
  };

  const difficultyColors: Record<string, string> = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
    advanced: 'bg-purple-100 text-purple-800'
  };

  const difficultyNames: Record<string, string> = {
    easy: 'سهل',
    medium: 'متوسط',
    hard: 'صعب',
    advanced: 'متقدم'
  };

  return (
    <MobileLayout title="تفاصيل المهمة" showBack>
      <div className="p-4 space-y-4">
        {/* Task Header */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-3xl">
              {taskTypeIcons[task.type]}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold mb-2">{getLocalizedField(task, 'title')}</h1>
              <p className="text-sm text-muted-foreground">{getLocalizedField(task, 'advertiser')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-secondary text-white border-0 text-lg px-3 py-1">
              {task.reward} ج.م
            </Badge>
            <Badge variant="outline">{taskTypeNames[task.type]}</Badge>
            <Badge className={difficultyColors[task.difficulty]}>
              {difficultyNames[task.difficulty]}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{getLocalizedField(task, 'description')}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{task.duration} دقيقة</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>ينتهي {task.expiresAt}</span>
            </div>
          </div>
        </Card>

        {/* Progress Tracker - يظهر بعد بدء المهمة */}
        {currentStep > 1 && (
          <ProgressTracker
            currentStep={currentStep}
            totalSteps={6}
            steps={taskSteps}
          />
        )}

        {/* Requirements - always show */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            المتطلبات
          </h3>
          <ul className="space-y-2">
            {task.requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Steps - only show if steps exist */}
        {task.steps && task.steps.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">خطوات إكمال المهمة</h3>
            <ol className="space-y-3">
              {task.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        )}

        {/* Proof Upload - يظهر في الخطوة 4 */}
        {currentStep === 4 && (
          <ProofUpload
            taskId={task.id}
            onUploadComplete={handleProofUpload}
          />
        )}

        {/* Benefit of Doubt Message */}
        {currentStep >= 2 && currentStep < 6 && (
          <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-700 mb-2">نحن نثق بك!</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    في حالة وجود شك في صحة إكمال المهمة، سنمنحك المكافأة بدلاً من رفضها.
                    لماذا؟ لأننا نقدر وقتك ومجهودك! 💚
                  </p>
                  <p className="text-xs text-emerald-600">
                    📊 تم منح 1,247 مكافأة بسياسة الثقة هذا الشهر
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        {currentStep === 1 && (
          <Button
            className="w-full h-12 text-lg"
            onClick={handleStartTask}
            disabled={isStarting}
          >
            {isStarting ? 'جاري البدء...' : 'ابدأ المهمة الآن'}
          </Button>
        )}

        {currentStep === 2 && (
          <Button
            className="w-full h-12 text-lg"
            onClick={handleReadInstructions}
          >
            لقد قرأت التعليمات - التالي
          </Button>
        )}

        {currentStep === 3 && (
          <Button
            className="w-full h-12 text-lg"
            onClick={handleExecuteTask}
          >
            أكملت التنفيذ - رفع الإثبات
          </Button>
        )}

        {currentStep === 5 && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <Clock className="w-5 h-5 animate-spin" />
              <span className="font-semibold">جاري مراجعة المهمة...</span>
            </div>
            <p className="text-sm text-blue-600 mt-2">
              سيتم مراجعة المهمة خلال 24 ساعة. سنرسل لك إشعاراً فور الموافقة.
            </p>
          </Card>
        )}

        {currentStep === 6 && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">تم إكمال المهمة وحصلت على {task.reward} ج.م!</span>
            </div>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}

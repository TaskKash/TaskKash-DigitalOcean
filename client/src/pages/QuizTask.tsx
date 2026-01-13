import { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLocation, useParams } from 'wouter';
import { CheckCircle2, XCircle, Clock, Trophy, Brain } from 'lucide-react';
import { useNavigationWarning } from '@/hooks/useNavigationWarning';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';

interface QuizQuestion {
  id: number;
  questionEn: string;
  questionAr: string;
  options: string[];
  optionsAr: string[];
  correctAnswer: number;
  explanation?: string;
  explanationAr?: string;
}

interface QuizTaskData {
  timeLimit: number; // in seconds
  questions: QuizQuestion[];
  showCorrectAnswers: boolean;
  allowRetry: boolean;
}

export default function QuizTask() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const taskId = parseInt(params.id || '0');
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

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

  const taskData: QuizTaskData = task?.taskData ? 
    (typeof task.taskData === 'string' ? JSON.parse(task.taskData) : task.taskData) : null;

  // Initialize timer
  useEffect(() => {
    if (taskData?.timeLimit) {
      setTimeLeft(taskData.timeLimit);
    }
  }, [taskData]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResults]);

  // Submit task mutation
  const submitMutation = useMutation({
    mutationFn: async (data: { answers: string[] }) => {
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
      setResults(data);
      setShowResults(true);
      if (data.passed) {
        toast.success(isArabic ? `أحسنت! حصلت على ${task?.reward} ج.م` : `Great job! You earned ${task?.reward} EGP`);
      } else {
        toast.error(isArabic ? 'لم تجتاز الاختبار. حاول مرة أخرى.' : 'Quiz not passed. Try again.');
      }
    },
    onError: () => {
      toast.error(isArabic ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  });

  // Navigation warning when quiz is in progress
  const isTaskInProgress = Object.keys(answers).length > 0 && !showResults;
  useNavigationWarning(isTaskInProgress, isArabic 
    ? 'لديك اختبار قيد التنفيذ. هل أنت متأكد أنك تريد المغادرة؟'
    : 'You have an active quiz in progress. Are you sure you want to leave?');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < (taskData?.questions?.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const answerArray = taskData?.questions?.map((_, idx) => answers[idx] || '') || [];
    setIsSubmitting(true);
    submitMutation.mutate({ answers: answerArray });
  };

  if (isLoading) {
    return (
      <MobileLayout title={isArabic ? 'اختبار' : 'Quiz'} showBack>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>
    );
  }

  const questions = taskData?.questions || [];
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  // Results Screen
  if (showResults && results) {
    return (
      <MobileLayout title={isArabic ? 'نتائج الاختبار' : 'Quiz Results'} showBack>
        <div className="p-4 space-y-4">
          <Card className="p-6 text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${results.passed ? 'bg-green-100' : 'bg-red-100'}`}>
              {results.passed ? (
                <Trophy className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {results.passed 
                ? (isArabic ? 'أحسنت!' : 'Great Job!') 
                : (isArabic ? 'حاول مرة أخرى' : 'Try Again')}
            </h2>
            <p className="text-4xl font-bold text-primary mb-2">{results.score}%</p>
            <p className="text-muted-foreground">
              {results.correctCount} / {results.totalQuestions} {isArabic ? 'إجابات صحيحة' : 'correct answers'}
            </p>
            {results.passed && (
              <p className="text-green-600 font-semibold mt-4">
                +{task?.reward} {isArabic ? 'ج.م' : 'EGP'}
              </p>
            )}
          </Card>

          {taskData?.showCorrectAnswers && results.answerResults && (
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold">{isArabic ? 'مراجعة الإجابات:' : 'Answer Review:'}</h3>
              {results.answerResults.map((result: any, idx: number) => (
                <div key={idx} className={`p-3 rounded-lg ${result.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-start gap-2">
                    {result.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{result.questionText}</p>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? 'إجابتك:' : 'Your answer:'} {result.userAnswer}
                      </p>
                      {!result.isCorrect && (
                        <p className="text-sm text-green-600">
                          {isArabic ? 'الإجابة الصحيحة:' : 'Correct answer:'} {result.correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          )}

          <Button onClick={() => setLocation('/tasks')} className="w-full" size="lg">
            {isArabic ? 'العودة للمهام' : 'Back to Tasks'}
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={isArabic ? task?.titleAr : task?.titleEn} showBack>
      <div className="p-4 space-y-4">
        {/* Timer and Progress */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Brain className="w-4 h-4 text-primary" />
            <span>{currentQuestion + 1} / {questions.length}</span>
          </div>
          {taskData?.timeLimit && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${timeLeft < 30 ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        <Progress value={progress} className="h-2" />

        {/* Question Card */}
        {currentQ && (
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-lg">
              {isArabic ? currentQ.questionAr : currentQ.questionEn}
            </h3>

            <RadioGroup
              value={answers[currentQuestion] || ''}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {(isArabic ? currentQ.optionsAr : currentQ.options).map((option, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center space-x-2 rtl:space-x-reverse p-3 rounded-lg border transition-colors ${
                    answers[currentQuestion] === idx.toString() 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentQuestion === 0}
            className="flex-1"
          >
            {isArabic ? 'السابق' : 'Previous'}
          </Button>
          
          {currentQuestion < questions.length - 1 ? (
            <Button 
              onClick={handleNext} 
              disabled={!answers[currentQuestion]}
              className="flex-1"
            >
              {isArabic ? 'التالي' : 'Next'}
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || answeredCount < questions.length}
              className="flex-1"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                isArabic ? 'إرسال' : 'Submit'
              )}
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <Card className="p-3">
          <div className="flex flex-wrap gap-2 justify-center">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  idx === currentQuestion 
                    ? 'bg-primary text-white' 
                    : answers[idx] !== undefined 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </Card>

        {/* Reward Info */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{isArabic ? 'المكافأة:' : 'Reward:'}</span>
            <span className="font-bold text-primary text-lg">{task?.reward} {isArabic ? 'ج.م' : 'EGP'}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isArabic ? `يجب الحصول على ${task?.passingScore}% للنجاح` : `${task?.passingScore}% required to pass`}
          </p>
        </Card>
      </div>
    </MobileLayout>
  );
}

import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useLocation } from 'wouter';
import { CheckCircle2 } from 'lucide-react';
import { useNavigationWarning } from '@/hooks/useNavigationWarning';
import { toast } from 'sonner';

const surveyQuestions = [
  {
    id: 1,
    question: 'كم مرة تستخدم تطبيقات توصيل الطعام في الأسبوع؟',
    type: 'single',
    options: ['لا أستخدمها', '1-2 مرة', '3-5 مرات', 'أكثر من 5 مرات']
  },
  {
    id: 2,
    question: 'ما هو التطبيق المفضل لديك؟',
    type: 'single',
    options: ['هنقرستيشن', 'جاهز', 'مرسول', 'طلبات', 'أخرى']
  },
  {
    id: 3,
    question: 'ما أهم العوامل التي تؤثر على اختيارك؟',
    type: 'single',
    options: ['السعر', 'سرعة التوصيل', 'تنوع المطاعم', 'العروض والخصومات']
  },
  {
    id: 4,
    question: 'ما مدى رضاك عن خدمات التوصيل؟',
    type: 'single',
    options: ['غير راضٍ', 'راضٍ إلى حد ما', 'راضٍ', 'راضٍ جداً']
  },
  {
    id: 5,
    question: 'هل واجهت مشاكل في التوصيل؟',
    type: 'single',
    options: ['نعم، كثيراً', 'نعم، أحياناً', 'نادراً', 'لا، أبداً']
  },
  {
    id: 6,
    question: 'ما هي أكثر مشكلة تواجهها؟',
    type: 'single',
    options: ['تأخير التوصيل', 'جودة الطعام', 'خطأ في الطلب', 'خدمة العملاء']
  },
  {
    id: 7,
    question: 'هل تستخدم ميزة الاشتراك الشهري؟',
    type: 'single',
    options: ['نعم، حالياً', 'استخدمتها سابقاً', 'لم أجربها', 'لا أعرفها']
  },
  {
    id: 8,
    question: 'كم تنفق شهرياً على التوصيل؟',
    type: 'single',
    options: ['أقل من 200 ج.م', '200-500 ج.م', '500-1000 ج.م', 'أكثر من 1000 ج.م']
  },
  {
    id: 9,
    question: 'هل تنصح الآخرين بالتطبيق؟',
    type: 'single',
    options: ['بالتأكيد لا', 'ربما لا', 'ربما نعم', 'بالتأكيد نعم']
  },
  {
    id: 10,
    question: 'أي تحسينات تقترحها؟ (اختياري)',
    type: 'text',
    options: []
  }
];

export default function SurveyTask() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = ((currentQuestion + 1) / surveyQuestions.length) * 100;
  const question = surveyQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === surveyQuestions.length - 1;
  const hasAnswer = answers[question.id];

  // Navigation warning when survey is in progress
  const isSurveyInProgress = Object.keys(answers).length > 0 && !isSubmitting;
  useNavigationWarning(isSurveyInProgress, 'You have unsaved survey answers. Are you sure you want to leave?');

  const handleNext = () => {
    if (currentQuestion < surveyQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('تم إرسال الاستبيان بنجاح! حصلت على 15 ج.م');
      setLocation('/tasks');
    }, 1500);
  };

  return (
    <MobileLayout title="استبيان" showBack>
      <div className="p-4 space-y-4">
        {/* Progress */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">
              السؤال {currentQuestion + 1} من {surveyQuestions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </Card>

        {/* Question Card */}
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-bold">
                {currentQuestion + 1}
              </div>
              <h3 className="text-lg font-semibold pt-1">{question.question}</h3>
            </div>

            {question.type === 'single' && (
              <RadioGroup
                value={answers[question.id]}
                onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
              >
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 space-x-reverse p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                        answers[question.id] === option
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setAnswers({ ...answers, [question.id]: option })}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                      {answers[question.id] === option && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {question.type === 'text' && (
              <Textarea
                placeholder="اكتب إجابتك هنا... (اختياري)"
                value={answers[question.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                rows={5}
                className="resize-none"
              />
            )}
          </div>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {currentQuestion > 0 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex-1"
            >
              السابق
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!hasAnswer && question.type !== 'text'}
            className="flex-1"
          >
            {isSubmitting ? 'جاري الإرسال...' : isLastQuestion ? 'إرسال' : 'التالي'}
          </Button>
        </div>

        {/* Reward Reminder */}
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <span className="text-2xl">💰</span>
            <div>
              <p className="font-semibold">ستحصل على 15 ج.م</p>
              <p className="text-sm">عند إكمال جميع الأسئلة</p>
            </div>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}


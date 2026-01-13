import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Clock, Award, ChevronRight, ChevronLeft } from 'lucide-react';
import MobileLayout from '../components/layout/MobileLayout';

interface SurveyQuestion {
  id: number;
  questionText: string;
  questionTextAr?: string;
  questionOrder: number;
  questionType: 'single_choice' | 'multi_choice' | 'scale';
  options: string[];
  optionsAr?: string[];
  maxSelections: number;
}

interface Task {
  id: number;
  type: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  reward: number;
  difficulty: string;
  duration: number;
  taskData: any;
  surveyQuestions: SurveyQuestion[];
  advertiserName: string;
  advertiserLogo: string;
}

type Step = 'intro' | 'survey' | 'result';

export default function SurveyCompletion() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const { user, refreshUser, refreshTransactions } = useApp();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string[] }>({});
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${id}`);
      const data = await response.json();
      setTask(data.task);
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSurvey = async () => {
    try {
      await fetch(`/api/tasks/${id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      setStep('survey');
    } catch (error) {
      console.error('Error starting survey:', error);
    }
  };

  const handleOptionSelect = (questionId: number, option: string, maxSelections: number) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      
      if (maxSelections === 1) {
        return { ...prev, [questionId]: [option] };
      } else {
        if (currentAnswers.includes(option)) {
          return { ...prev, [questionId]: currentAnswers.filter(a => a !== option) };
        } else if (currentAnswers.length < maxSelections) {
          return { ...prev, [questionId]: [...currentAnswers, option] };
        }
        return prev;
      }
    });
  };

  const isOptionSelected = (questionId: number, option: string) => {
    return (answers[questionId] || []).includes(option);
  };

  const canProceed = () => {
    if (!task?.surveyQuestions) return false;
    const currentQuestion = task.surveyQuestions[currentQuestionIndex];
    const currentAnswers = answers[currentQuestion.id] || [];
    return currentAnswers.length > 0;
  };

  const goToNextQuestion = () => {
    if (!task?.surveyQuestions) return;
    if (currentQuestionIndex < task.surveyQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitSurvey = async () => {
    if (!task) return;
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/tasks/${id}/submit-survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, selectedOptions]) => ({
            questionId: parseInt(questionId),
            selectedOptions
          }))
        })
      });
      
      const data = await response.json();
      setResult(data);
      setStep('result');
      // Refresh user data and transactions after successful survey completion
      await refreshUser();
      await refreshTransactions();
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout title={language === 'ar' ? 'الاستبيان' : 'Survey'}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!task) {
    return (
      <MobileLayout title={language === 'ar' ? 'الاستبيان' : 'Survey'}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <p className="text-lg text-muted-foreground">
            {language === 'ar' ? 'لم يتم العثور على الاستبيان' : 'Survey not found'}
          </p>
          <button
            onClick={() => setLocation('/tasks')}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            {language === 'ar' ? 'العودة للمهام' : 'Back to Tasks'}
          </button>
        </div>
      </MobileLayout>
    );
  }

  // Intro Step
  if (step === 'intro') {
    const taskData = task.taskData || {};
    return (
      <MobileLayout 
        title={language === 'ar' ? task.titleAr : task.titleEn}
        showBack
        onBack={() => setLocation('/tasks')}
      >
        <div className="p-4">
          {/* Survey Card */}
          <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
            {/* Header Image */}
            <div className="h-40 bg-gradient-to-br from-primary to-green-600 flex items-center justify-center">
              {taskData.imageUrl ? (
                <img 
                  src={taskData.imageUrl} 
                  alt="Survey" 
                  className="h-20 object-contain"
                />
              ) : (
                <div className="text-white text-5xl">📋</div>
              )}
            </div>
            
            <div className="p-5">
              <h1 className="text-xl font-bold text-foreground mb-2">
                {language === 'ar' ? task.titleAr : task.titleEn}
              </h1>
              <p className="text-muted-foreground text-sm mb-4">
                {language === 'ar' ? task.descriptionAr : task.descriptionEn}
              </p>
              
              {/* Survey Info */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="text-center p-3 bg-muted rounded-xl">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' ? 'الوقت' : 'Est. Time'}
                  </p>
                  <p className="font-semibold text-foreground text-sm">
                    {taskData.estimatedTime || 5} {language === 'ar' ? 'د' : 'min'}
                  </p>
                </div>
                <div className="text-center p-3 bg-muted rounded-xl">
                  <CheckCircle className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' ? 'الأسئلة' : 'Questions'}
                  </p>
                  <p className="font-semibold text-foreground text-sm">
                    {task.surveyQuestions?.length || taskData.totalQuestions || 16}
                  </p>
                </div>
                <div className="text-center p-3 bg-muted rounded-xl">
                  <Award className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' ? 'المكافأة' : 'Reward'}
                  </p>
                  <p className="font-semibold text-primary text-sm">
                    {task.reward} {language === 'ar' ? 'ج.م' : 'EGP'}
                  </p>
                </div>
              </div>
              
              {/* Privacy Note */}
              <div className="bg-primary/10 p-3 rounded-xl mb-5">
                <p className="text-xs text-primary">
                  {language === 'ar' 
                    ? '🔒 جميع إجاباتك ستبقى سرية وستستخدم فقط لتحسين الخدمات.'
                    : '🔒 All your responses will be kept confidential and used only to improve services.'}
                </p>
              </div>
              
              {/* Start Button */}
              <button
                onClick={startSurvey}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-base shadow-md hover:opacity-90 transition-opacity"
              >
                {language === 'ar' ? 'ابدأ الاستبيان' : 'Start Survey'}
              </button>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Survey Step
  if (step === 'survey' && task.surveyQuestions && task.surveyQuestions.length > 0) {
    const currentQuestion = task.surveyQuestions[currentQuestionIndex];
    
    // Fix: Ensure currentQuestion and options exist before accessing
    if (!currentQuestion) {
      return (
        <MobileLayout title={language === 'ar' ? 'خطأ' : 'Error'}>
          <div className="p-4 text-center">
            <p>{language === 'ar' ? 'حدث خطأ في تحميل السؤال' : 'Error loading question'}</p>
            <button onClick={() => setStep('intro')} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
              {language === 'ar' ? 'العودة' : 'Back'}
            </button>
          </div>
        </MobileLayout>
      );
    }

    const options = (language === 'ar' && currentQuestion.optionsAr) 
      ? currentQuestion.optionsAr 
      : (currentQuestion.options || []);
      
    const questionText = (language === 'ar' && currentQuestion.questionTextAr) 
      ? currentQuestion.questionTextAr 
      : currentQuestion.questionText;
    const isLastQuestion = currentQuestionIndex === task.surveyQuestions.length - 1;
    const progress = ((currentQuestionIndex + 1) / task.surveyQuestions.length) * 100;

    return (
      <MobileLayout 
        title={`${language === 'ar' ? 'السؤال' : 'Q'} ${currentQuestionIndex + 1}/${task.surveyQuestions.length}`}
        showBack
        onBack={() => currentQuestionIndex > 0 ? goToPrevQuestion() : setStep('intro')}
        showBottomNav={false}
      >
        <div className="p-4 pb-28">
          {/* Progress Bar */}
          <div className="mb-5">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {Math.round(progress)}% {language === 'ar' ? 'مكتمل' : 'complete'}
            </p>
          </div>

          {/* Question Card */}
          <div className="bg-card rounded-2xl shadow-md p-5 mb-5">
            <h2 className="text-base font-semibold text-foreground mb-4 leading-relaxed">
              {questionText}
            </h2>
            
            {currentQuestion.maxSelections > 1 && (
              <p className="text-xs text-primary mb-4">
                {language === 'ar' 
                  ? `اختر حتى ${currentQuestion.maxSelections} خيارات`
                  : `Select up to ${currentQuestion.maxSelections} options`}
              </p>
            )}

            {/* Options */}
            <div className="space-y-2.5">
              {currentQuestion.questionType !== 'scale' && options.map((option, index) => {
                const isSelected = isOptionSelected(currentQuestion.id, option);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(currentQuestion.id, option, currentQuestion.maxSelections)}
                    className={`w-full p-3.5 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected 
                          ? 'border-primary bg-primary' 
                          : 'border-muted-foreground'
                      }`}>
                        {isSelected && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <span className={`flex-1 text-sm ${isSelected ? 'text-primary font-medium' : 'text-foreground'}`}>
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
              
              {/* Scale Options */}
              {currentQuestion.questionType === 'scale' && (
                <div className="flex justify-between gap-1.5 mt-4 flex-wrap">
                  {options.map((option, index) => {
                    const isSelected = isOptionSelected(currentQuestion.id, option);
                    return (
                      <button
                        key={index}
                        onClick={() => handleOptionSelect(currentQuestion.id, option, 1)}
                        className={`w-9 h-9 rounded-full border-2 font-semibold text-sm transition-all ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation - Fixed above bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 max-w-md mx-auto">
          <div className="flex gap-3">
            {currentQuestionIndex > 0 && (
              <button
                onClick={goToPrevQuestion}
                className="flex-1 py-3 bg-muted text-foreground rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                {language === 'ar' ? 'السابق' : 'Previous'}
              </button>
            )}
            
            {isLastQuestion ? (
              <button
                onClick={submitSurvey}
                disabled={!canProceed() || submitting}
                className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                  canProceed() && !submitting
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {language === 'ar' ? 'إرسال' : 'Submit'}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={goToNextQuestion}
                disabled={!canProceed()}
                className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                  canProceed()
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {language === 'ar' ? 'التالي' : 'Next'}
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Result Step
  if (step === 'result') {
    return (
      <MobileLayout showBottomNav={false} showHeader={false}>
        <div className="min-h-screen bg-gradient-to-br from-primary to-green-600 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {language === 'ar' ? 'شكراً لك!' : 'Thank You!'}
            </h1>
            
            <p className="text-muted-foreground text-sm mb-5">
              {language === 'ar' 
                ? 'تم إكمال الاستبيان بنجاح. تمت إضافة المكافأة إلى رصيدك.'
                : 'Survey completed successfully. Your reward has been added to your balance.'}
            </p>
            
            <div className="bg-primary/10 rounded-2xl p-5 mb-5">
              <p className="text-xs text-muted-foreground mb-1">
                {language === 'ar' ? 'المكافأة المكتسبة' : 'Reward Earned'}
              </p>
              <p className="text-3xl font-bold text-primary">
                +{task.reward} {language === 'ar' ? 'ج.م' : 'EGP'}
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => setLocation('/wallet')}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium"
              >
                {language === 'ar' ? 'عرض المحفظة' : 'View Wallet'}
              </button>
              <button
                onClick={() => setLocation('/tasks')}
                className="w-full py-3 bg-muted text-foreground rounded-xl font-medium"
              >
                {language === 'ar' ? 'المزيد من المهام' : 'More Tasks'}
              </button>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return null;
}

import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Clock, Gift, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Question {
  id: number;
  questionText: string;
  questionTextAr?: string;
  questionType: string;
  options?: { text: string; value?: string }[];
  optionsAr?: { text: string; value?: string }[];
  isRequired: boolean;
  mediaUrl?: string;
}

export default function TakeSurvey() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams();
  const surveyId = parseInt(params.surveyId || "0");
  const campaignId = parseInt(params.campaignId || "0");
  const { user } = useApp();
  const isRTL = i18n.language === "ar";

  // Survey state
  const [responseId, setResponseId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // API calls
  const startSurvey = trpc.userSurvey.startSurvey.useMutation();
  const submitAnswer = trpc.userSurvey.submitAnswer.useMutation();
  const completeSurvey = trpc.userSurvey.completeSurvey.useMutation();

  // Start survey on mount
  useEffect(() => {
    const initSurvey = async () => {
      try {
        const result = await startSurvey.mutateAsync({
          userId: user?.id || 0,
          surveyId,
          campaignId,
          deviceType: navigator.userAgent.includes("Mobile") ? "mobile" : "desktop",
        });

        setResponseId(result.responseId);
        if (result.questions) {
          setQuestions(result.questions.map((q: any) => ({
            ...q,
            options: q.options ? JSON.parse(q.options) : [],
            optionsAr: q.optionsAr ? JSON.parse(q.optionsAr) : [],
          })));
        }
        setStartTime(Date.now());
        setQuestionStartTime(Date.now());
      } catch (err: any) {
        setError(err.message || "Failed to start survey");
      }
    };

    if (user?.id && surveyId && campaignId) {
      initSurvey();
    }
  }, [user?.id, surveyId, campaignId]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleAnswer = (value: any) => {
    if (!currentQuestion) return;
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = async () => {
    if (!currentQuestion || !responseId) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    // Submit current answer
    try {
      await submitAnswer.mutateAsync({
        responseId,
        questionId: currentQuestion.id,
        answerValue: answers[currentQuestion.id],
        timeSpentSeconds: timeSpent,
      });

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuestionStartTime(Date.now());
      } else {
        // Complete survey
        const totalTime = Math.floor((Date.now() - startTime) / 1000);
        const result = await completeSurvey.mutateAsync({
          userId: user?.id || 0,
          responseId,
          totalTimeSeconds: totalTime,
        });
        setCompletionResult(result);
        setIsCompleted(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit answer");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const canProceed = () => {
    if (!currentQuestion) return false;
    if (!currentQuestion.isRequired) return true;
    
    const answer = answers[currentQuestion.id];
    if (answer === undefined || answer === null || answer === "") return false;
    if (Array.isArray(answer) && answer.length === 0) return false;
    
    return true;
  };

  // Render question based on type
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const questionText = isRTL && currentQuestion.questionTextAr 
      ? currentQuestion.questionTextAr 
      : currentQuestion.questionText;
    
    const options = isRTL && currentQuestion.optionsAr?.length 
      ? currentQuestion.optionsAr 
      : currentQuestion.options;

    switch (currentQuestion.questionType) {
      case "single_choice":
        return (
          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={(value) => handleAnswer(value)}
            className="space-y-3"
          >
            {options?.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                  answers[currentQuestion.id] === option.text
                    ? "border-primary bg-primary/5"
                    : "hover:border-gray-300"
                }`}
                onClick={() => handleAnswer(option.text)}
              >
                <RadioGroupItem value={option.text} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "multiple_choice":
        const selectedOptions = answers[currentQuestion.id] || [];
        return (
          <div className="space-y-3">
            {options?.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedOptions.includes(option.text)
                    ? "border-primary bg-primary/5"
                    : "hover:border-gray-300"
                }`}
                onClick={() => {
                  const newSelected = selectedOptions.includes(option.text)
                    ? selectedOptions.filter((o: string) => o !== option.text)
                    : [...selectedOptions, option.text];
                  handleAnswer(newSelected);
                }}
              >
                <Checkbox
                  checked={selectedOptions.includes(option.text)}
                  id={`option-${index}`}
                />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        );

      case "open_text":
        return (
          <Textarea
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={isRTL ? "اكتب إجابتك هنا..." : "Type your answer here..."}
            rows={4}
            className="text-lg"
          />
        );

      case "rating_scale":
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{isRTL ? "ضعيف جداً" : "Very Poor"}</span>
              <span>{isRTL ? "ممتاز" : "Excellent"}</span>
            </div>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={answers[currentQuestion.id] === rating ? "default" : "outline"}
                  size="lg"
                  className="w-14 h-14 text-xl"
                  onClick={() => handleAnswer(rating)}
                >
                  {rating}
                </Button>
              ))}
            </div>
          </div>
        );

      case "nps":
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{isRTL ? "غير محتمل على الإطلاق" : "Not at all likely"}</span>
              <span>{isRTL ? "محتمل جداً" : "Extremely likely"}</span>
            </div>
            <div className="flex justify-center gap-1 flex-wrap">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <Button
                  key={score}
                  variant={answers[currentQuestion.id] === score ? "default" : "outline"}
                  size="sm"
                  className={`w-10 h-10 ${
                    score <= 6 ? "hover:bg-red-100" : score <= 8 ? "hover:bg-yellow-100" : "hover:bg-green-100"
                  }`}
                  onClick={() => handleAnswer(score)}
                >
                  {score}
                </Button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span className="text-red-500">{isRTL ? "منتقدون" : "Detractors"}</span>
              <span className="text-yellow-500">{isRTL ? "محايدون" : "Passives"}</span>
              <span className="text-green-500">{isRTL ? "مروجون" : "Promoters"}</span>
            </div>
          </div>
        );

      case "slider":
        return (
          <div className="space-y-6 py-4">
            <Slider
              value={[answers[currentQuestion.id] || 50]}
              onValueChange={(value) => handleAnswer(value[0])}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="text-center">
              <span className="text-3xl font-bold text-primary">
                {answers[currentQuestion.id] || 50}%
              </span>
            </div>
          </div>
        );

      default:
        return <p>{isRTL ? "نوع سؤال غير معروف" : "Unknown question type"}</p>;
    }
  };

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${isRTL ? "rtl" : "ltr"}`}>
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{isRTL ? "حدث خطأ" : "Error"}</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => setLocation("/surveys")}>
              {isRTL ? "العودة للاستطلاعات" : "Back to Surveys"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completion state
  if (isCompleted && completionResult) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${isRTL ? "rtl" : "ltr"}`}>
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {isRTL ? "تم إكمال الاستطلاع!" : "Survey Completed!"}
            </h2>
            <p className="text-gray-600 mb-6">
              {isRTL ? "شكراً لمشاركتك" : "Thank you for your participation"}
            </p>
            
            <div className="bg-primary/10 rounded-lg p-6 mb-6">
              <Gift className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                {isRTL ? "لقد ربحت" : "You earned"}
              </p>
              <p className="text-3xl font-bold text-primary">
                {completionResult.reward} EGP
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
              <span>{isRTL ? "نقاط الجودة" : "Quality Score"}:</span>
              <Badge variant={completionResult.qualityScore >= 0.8 ? "default" : "secondary"}>
                {(completionResult.qualityScore * 100).toFixed(0)}%
              </Badge>
            </div>

            <Button onClick={() => setLocation("/surveys")} className="w-full">
              {isRTL ? "استكشاف المزيد من الاستطلاعات" : "Explore More Surveys"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (!currentQuestion) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${isRTL ? "rtl" : "ltr"}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{isRTL ? "جاري تحميل الاستطلاع..." : "Loading survey..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/surveys")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {isRTL ? "خروج" : "Exit"}
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>
                {isRTL ? "السؤال" : "Question"} {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-2xl mx-auto p-4">
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="shrink-0">
                {currentQuestionIndex + 1}
              </Badge>
              <CardTitle className="text-xl leading-relaxed">
                {isRTL && currentQuestion.questionTextAr 
                  ? currentQuestion.questionTextAr 
                  : currentQuestion.questionText}
                {currentQuestion.isRequired && <span className="text-red-500 ml-1">*</span>}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {currentQuestion.mediaUrl && (
              <img 
                src={currentQuestion.mediaUrl} 
                alt="Question media" 
                className="w-full rounded-lg mb-4"
              />
            )}
            {renderQuestion()}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isRTL ? "السابق" : "Previous"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || submitAnswer.isPending || completeSurvey.isPending}
            >
              {currentQuestionIndex === questions.length - 1 ? (
                <>
                  {completeSurvey.isPending 
                    ? (isRTL ? "جاري الإرسال..." : "Submitting...") 
                    : (isRTL ? "إنهاء" : "Finish")}
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  {isRTL ? "التالي" : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

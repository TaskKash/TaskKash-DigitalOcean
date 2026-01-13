import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useApp } from "../contexts/AppContext";
import { trpc } from "../lib/trpc";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Vote, ChevronLeft, ChevronRight, Check, Gift, Clock, Image as ImageIcon } from "lucide-react";

interface VoteOption {
  id: number;
  optionOrder: number;
  optionText: string;
  optionTextAr: string;
  imageUrl: string;
}

interface VoteQuestion {
  id: number;
  questionOrder: number;
  questionType: 'single_choice' | 'multiple_choice' | 'ranking' | 'slider';
  questionText: string;
  questionTextAr: string;
  sectionTitle: string;
  sectionTitleAr: string;
  maxSelections: number;
  options: VoteOption[];
}

export default function TakeVote() {
  const { t, i18n } = useTranslation();
  const { user } = useApp();
  const [, setLocation] = useLocation();
  const params = useParams();
  const voteId = parseInt(params.id || "0");
  const campaignId = parseInt(params.campaignId || "0");
  const isRtl = i18n.language === 'ar';

  // State
  const [responseId, setResponseId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<VoteQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [completed, setCompleted] = useState(false);
  const [reward, setReward] = useState(0);

  // Start vote mutation
  const startVoteMutation = trpc["userVote.startVote"].useMutation();
  const submitAnswerMutation = trpc["userVote.submitAnswer"].useMutation();
  const completeVoteMutation = trpc["userVote.completeVote"].useMutation();

  // Start the vote on mount
  useEffect(() => {
    const startVote = async () => {
      try {
        const result = await startVoteMutation.mutateAsync({ voteId, campaignId });
        setResponseId(result.responseId);
        if (result.questions) {
          setQuestions(result.questions);
        }
      } catch (error) {
        console.error("Failed to start vote:", error);
      }
    };

    startVote();
  }, [voteId, campaignId]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleSelectOption = (optionId: number) => {
    if (!currentQuestion) return;

    const currentAnswers = answers[currentQuestion.id] || [];
    
    if (currentQuestion.questionType === 'single_choice') {
      setAnswers({ ...answers, [currentQuestion.id]: [optionId] });
    } else if (currentQuestion.questionType === 'multiple_choice') {
      if (currentAnswers.includes(optionId)) {
        setAnswers({ 
          ...answers, 
          [currentQuestion.id]: currentAnswers.filter(id => id !== optionId) 
        });
      } else if (currentAnswers.length < currentQuestion.maxSelections) {
        setAnswers({ 
          ...answers, 
          [currentQuestion.id]: [...currentAnswers, optionId] 
        });
      }
    }
  };

  const isOptionSelected = (optionId: number) => {
    if (!currentQuestion) return false;
    return (answers[currentQuestion.id] || []).includes(optionId);
  };

  const handleNext = async () => {
    if (!responseId || !currentQuestion) return;

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const selectedOptions = answers[currentQuestion.id] || [];

    // Submit answer
    try {
      await submitAnswerMutation.mutateAsync({
        responseId,
        questionId: currentQuestion.id,
        selectedOptionIds: selectedOptions,
        timeSpentSeconds: timeSpent,
        openFeedback: feedback[currentQuestion.id] || undefined,
      });

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuestionStartTime(Date.now());
      } else {
        // Complete the vote
        const result = await completeVoteMutation.mutateAsync({ responseId });
        setReward(result.reward);
        setCompleted(true);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
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
    const selectedOptions = answers[currentQuestion.id] || [];
    return selectedOptions.length > 0;
  };

  if (startVoteMutation.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{isRtl ? 'جاري تحميل التصويت...' : 'Loading vote...'}</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <div className="p-6 bg-green-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <Check className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-4">
          {isRtl ? 'شكراً لمشاركتك!' : 'Thank You for Voting!'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {isRtl ? 'تم إضافة المكافأة إلى رصيدك' : 'Your reward has been added to your balance'}
        </p>
        <div className="flex items-center justify-center gap-2 text-3xl font-bold text-green-600 mb-8">
          <Gift className="h-8 w-8" />
          +{reward} EGP
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => setLocation('/votes')}>
            {isRtl ? 'المزيد من التصويتات' : 'More Votes'}
          </Button>
          <Button onClick={() => setLocation('/home')}>
            {isRtl ? 'الرئيسية' : 'Home'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vote className="h-6 w-6 text-purple-600" />
              <span className="font-semibold">{isRtl ? 'تصويت' : 'Vote'}</span>
            </div>
            <Badge variant="outline">
              {currentQuestionIndex + 1}/{questions.length}
            </Badge>
          </div>
          <Progress value={progress} className="mt-3 h-2" />
        </div>
      </div>

      {/* Question Content */}
      {currentQuestion && (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Section Title */}
          {currentQuestion.sectionTitle && (
            <Badge variant="secondary" className="mb-4">
              {isRtl ? currentQuestion.sectionTitleAr || currentQuestion.sectionTitle : currentQuestion.sectionTitle}
            </Badge>
          )}

          {/* Question Text */}
          <h2 className="text-xl font-semibold mb-6">
            {isRtl ? currentQuestion.questionTextAr || currentQuestion.questionText : currentQuestion.questionText}
          </h2>

          {/* Question Type Hint */}
          {currentQuestion.questionType === 'multiple_choice' && (
            <p className="text-sm text-muted-foreground mb-4">
              {isRtl 
                ? `اختر حتى ${currentQuestion.maxSelections} خيارات`
                : `Select up to ${currentQuestion.maxSelections} options`}
            </p>
          )}

          {/* Options Grid - Visual First */}
          <div className={`grid gap-4 ${
            currentQuestion.options.some(o => o.imageUrl) 
              ? 'grid-cols-2' 
              : 'grid-cols-1'
          }`}>
            {currentQuestion.options.map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isOptionSelected(option.id) 
                    ? 'ring-2 ring-purple-600 bg-purple-50' 
                    : 'hover:border-purple-300'
                }`}
                onClick={() => handleSelectOption(option.id)}
              >
                <CardContent className="p-4">
                  {/* Image if available */}
                  {option.imageUrl ? (
                    <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={option.imageUrl} 
                        alt={option.optionText}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af">No Image</text></svg>';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isOptionSelected(option.id) 
                          ? 'border-purple-600 bg-purple-600' 
                          : 'border-gray-300'
                      }`}>
                        {isOptionSelected(option.id) && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Option Text */}
                  <p className={`font-medium ${option.imageUrl ? 'text-center' : ''}`}>
                    {isRtl ? option.optionTextAr || option.optionText : option.optionText}
                  </p>

                  {/* Selection indicator for image options */}
                  {option.imageUrl && isOptionSelected(option.id) && (
                    <div className="absolute top-2 right-2 p-1 bg-purple-600 rounded-full">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Optional Feedback */}
          <div className="mt-6">
            <Textarea
              placeholder={isRtl ? 'أضف تعليقاً (اختياري)' : 'Add a comment (optional)'}
              value={feedback[currentQuestion.id] || ''}
              onChange={(e) => setFeedback({ ...feedback, [currentQuestion.id]: e.target.value })}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {isRtl ? 'السابق' : 'Previous'}
            </Button>

            <Button 
              onClick={handleNext}
              disabled={!canProceed() || submitAnswerMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {submitAnswerMutation.isPending ? (
                <span className="animate-spin">⏳</span>
              ) : currentQuestionIndex === questions.length - 1 ? (
                <>
                  {isRtl ? 'إنهاء' : 'Finish'}
                  <Check className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  {isRtl ? 'التالي' : 'Next'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

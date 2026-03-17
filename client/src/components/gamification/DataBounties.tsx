import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Target, Clock, DollarSign, Users, TrendingUp, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrency } from "@/contexts/CurrencyContext";

interface DataBounty {
  id: number;
  bountyKey: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  questionEn: string;
  questionAr: string;
  answerType: 'text' | 'single_choice' | 'multiple_choice' | 'boolean' | 'number';
  answerOptions: string[] | null;
  rewardAmount: string;
  targetResponses: number;
  currentResponses: number;
  startTime: string;
  endTime: string;
  status: string;
}

interface DataBountiesProps {
  userId: number;
  language?: 'en' | 'ar';
}

export default function DataBounties({ userId, language = 'en' }: DataBountiesProps) {
  const { currency, symbol, formatAmount } = useCurrency();
  const [bounties, setBounties] = useState<DataBounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBounty, setSelectedBounty] = useState<DataBounty | null>(null);
  const [answer, setAnswer] = useState<any>('');
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  // Using sonner toast

  useEffect(() => {
    fetchDataBounties();
  }, [userId]);

  const fetchDataBounties = async () => {
    try {
      const response = await fetch(`/api/gamification/data-bounties/user/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setBounties(data.bounties);
      }
    } catch (error) {
      console.error('Error fetching data bounties:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitBountyResponse = async () => {
    if (!selectedBounty) return;

    const finalAnswer = selectedBounty.answerType === 'multiple_choice' 
      ? multipleChoiceAnswers 
      : answer;

    if (!finalAnswer || (Array.isArray(finalAnswer) && finalAnswer.length === 0)) {
      toast.error(language === 'ar' ? 'الرجاء تقديم إجابة' : 'Please provide an answer');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/gamification/data-bounties/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          bountyId: selectedBounty.id,
          answer: finalAnswer
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(language === 'ar' 
          ? `🎉 تم الإرسال بنجاح! حصلت على ${data.rewardAwarded} جنيه!`
          : `🎉 Response Submitted! You earned ${data.rewardAwarded} {symbol}!`);
        setSelectedBounty(null);
        setAnswer('');
        setMultipleChoiceAnswers([]);
        fetchDataBounties();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error submitting bounty response:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return language === 'ar' ? 'منتهي' : 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return language === 'ar' ? `${days} يوم` : `${days} day${days > 1 ? 's' : ''}`;
    }
    
    return language === 'ar' 
      ? `${hours} ساعة ${minutes} دقيقة`
      : `${hours}h ${minutes}m`;
  };

  const renderAnswerInput = (bounty: DataBounty) => {
    switch (bounty.answerType) {
      case 'single_choice':
        return (
          <RadioGroup value={answer} onValueChange={setAnswer}>
            {bounty.answerOptions?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {bounty.answerOptions?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id={`option-${index}`}
                  checked={multipleChoiceAnswers.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setMultipleChoiceAnswers([...multipleChoiceAnswers, option]);
                    } else {
                      setMultipleChoiceAnswers(multipleChoiceAnswers.filter(a => a !== option));
                    }
                  }}
                />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
      
      case 'boolean':
        return (
          <RadioGroup value={answer} onValueChange={setAnswer}>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes" className="cursor-pointer">
                {language === 'ar' ? 'نعم' : 'Yes'}
              </Label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no" className="cursor-pointer">
                {language === 'ar' ? 'لا' : 'No'}
              </Label>
            </div>
          </RadioGroup>
        );
      
      default:
        return (
          <input 
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder={language === 'ar' ? 'اكتب إجابتك هنا...' : 'Type your answer here...'}
          />
        );
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (bounties.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {language === 'ar' ? 'لا توجد مكافآت متاحة حالياً' : 'No Bounties Available'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'ar' 
            ? 'تحقق مرة أخرى قريباً للحصول على فرص جديدة للربح!'
            : 'Check back soon for new earning opportunities!'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-orange-500" />
              {language === 'ar' ? 'مكافآت البيانات' : 'Data Bounties'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'ar' 
                ? 'أجب على أسئلة سريعة واحصل على مكافآت فورية'
                : 'Answer quick questions and earn instant rewards'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-orange-500">{bounties.length}</div>
            <div className="text-xs text-muted-foreground">
              {language === 'ar' ? 'متاح الآن' : 'Available Now'}
            </div>
          </div>
        </div>
      </Card>

      {/* Bounties List */}
      <div className="space-y-4">
        {bounties.map((bounty) => {
          const progress = (bounty.currentResponses / bounty.targetResponses) * 100;
          
          return (
            <Card 
              key={bounty.id}
              className="p-5 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedBounty(bounty)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {language === 'ar' ? bounty.titleAr : bounty.titleEn}
                      </h3>
                      <Badge variant="outline" className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                        <Zap className="w-3 h-3 mr-1" />
                        {language === 'ar' ? 'سريع' : 'Quick'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {language === 'ar' ? bounty.descriptionAr : bounty.descriptionEn}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-green-600">
                      {bounty.rewardAmount} {language === 'ar' ? symbol : currency}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {getTimeRemaining(bounty.endTime)}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {bounty.currentResponses}/{bounty.targetResponses} {language === 'ar' ? 'إجابات' : 'responses'}
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    {progress.toFixed(0)}% {language === 'ar' ? 'مكتمل' : 'complete'}
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBounty(bounty);
                  }}
                >
                  {language === 'ar' ? 'الإجابة الآن' : 'Answer Now'} • +{bounty.rewardAmount} {language === 'ar' ? symbol : currency}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Bounty Response Dialog */}
      <Dialog open={!!selectedBounty} onOpenChange={() => {
        setSelectedBounty(null);
        setAnswer('');
        setMultipleChoiceAnswers([]);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-500" />
              {selectedBounty && (language === 'ar' ? selectedBounty.titleAr : selectedBounty.titleEn)}
            </DialogTitle>
            <DialogDescription>
              {selectedBounty && (language === 'ar' ? selectedBounty.descriptionAr : selectedBounty.descriptionEn)}
            </DialogDescription>
          </DialogHeader>

          {selectedBounty && (
            <div className="space-y-4">
              <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">
                    {language === 'ar' ? 'المكافأة:' : 'Reward:'}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    +{selectedBounty.rewardAmount} {language === 'ar' ? symbol : currency}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{language === 'ar' ? 'الوقت المتبقي:' : 'Time Remaining:'}</span>
                  <span>{getTimeRemaining(selectedBounty.endTime)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  {language === 'ar' ? selectedBounty.questionAr : selectedBounty.questionEn}
                </Label>
                {renderAnswerInput(selectedBounty)}
              </div>

              <DialogFooter>
                <Button 
                  onClick={submitBountyResponse}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting 
                    ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...') 
                    : (language === 'ar' ? 'إرسال الإجابة' : 'Submit Answer')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

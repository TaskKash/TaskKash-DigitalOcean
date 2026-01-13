import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLocation } from 'wouter';
import { Play, Pause, Volume2, CheckCircle2 } from 'lucide-react';
import { useNavigationWarning } from '@/hooks/useNavigationWarning';
import { toast } from 'sonner';

export default function VideoTask() {
  const [, setLocation] = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasWatched, setHasWatched] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoDuration = 30; // seconds
  const progress = (currentTime / videoDuration) * 100;

  // Navigation warning when task is in progress
  const isTaskInProgress = isPlaying || (currentTime > 0 && !hasWatched);
  useNavigationWarning(isTaskInProgress, 'You have an active task in progress. Are you sure you want to leave?');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < videoDuration) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= videoDuration) {
            setIsPlaying(false);
            setHasWatched(true);
            toast.success('رائع! أكملت مشاهدة الفيديو');
            return videoDuration;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime]);

  const handlePlayPause = () => {
    if (currentTime >= videoDuration) {
      setCurrentTime(0);
      setHasWatched(false);
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (!answer) {
      toast.error('الرجاء الإجابة على السؤال');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('تم إكمال المهمة! حصلت على 5 ج.م');
      setLocation('/tasks');
    }, 1500);
  };

  return (
    <MobileLayout title="مشاهدة فيديو" showBack>
      <div className="p-4 space-y-4">
        {/* Video Player Card */}
        <Card className="p-0 overflow-hidden">
          {/* Video Thumbnail/Player */}
          <div className="relative bg-gradient-to-br from-primary to-secondary aspect-video flex items-center justify-center">
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className="relative z-10 w-20 h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all transform hover:scale-110"
            >
              {isPlaying ? (
                <Pause className="w-10 h-10 text-primary" />
              ) : (
                <Play className="w-10 h-10 text-primary mr-1" />
              )}
            </button>

            {/* Video Info Overlay */}
            <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {formatTime(currentTime)} / {formatTime(videoDuration)}
            </div>

            {hasWatched && (
              <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                مكتمل
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="p-4">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
              <span>تقدم المشاهدة</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </Card>

        {/* Video Info */}
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-2">تطبيق التسوق الجديد</h3>
          <p className="text-sm text-muted-foreground mb-3">
            شاهد هذا الفيديو التعريفي القصير عن تطبيق التسوق الإلكتروني الجديد واكتشف المميزات الرائعة التي يقدمها.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <span>مدة الفيديو: 30 ثانية</span>
            </div>
          </div>
        </Card>

        {/* Question Card */}
        {hasWatched && (
          <Card className="p-6 animate-fade-in">
            <h3 className="font-semibold mb-4">سؤال سريع:</h3>
            <p className="mb-4">ما هي الميزة الرئيسية التي ذكرها الفيديو؟</p>
            
            <RadioGroup value={answer} onValueChange={setAnswer}>
              <div className="space-y-3">
                {[
                  'توصيل مجاني لجميع الطلبات',
                  'خصومات تصل إلى 50%',
                  'تطبيق سهل الاستخدام',
                  'دفع آمن ومتعدد الخيارات'
                ].map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 space-x-reverse p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                      answer === option
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setAnswer(option)}
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                    {answer === option && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>
        )}

        {/* Submit Button */}
        {hasWatched && (
          <Button
            onClick={handleSubmit}
            disabled={!answer || isSubmitting}
            className="w-full h-12"
          >
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال الإجابة'}
          </Button>
        )}

        {/* Reward Card */}
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <span className="text-2xl">💰</span>
            <div>
              <p className="font-semibold">ستحصل على 5 ج.م</p>
              <p className="text-sm">بعد مشاهدة الفيديو والإجابة على السؤال</p>
            </div>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}


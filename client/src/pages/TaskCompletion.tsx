import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Play, CheckCircle, XCircle, Clock, Award } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import MobileLayout from '../components/layout/MobileLayout';

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
  passingScore: number;
  minWatchPercentage: number;
  taskData: any;
  questions: Question[];
  advertiserName: string;
  advertiserLogo: string;
}

interface Question {
  id: number;
  questionText: string;
  questionTextAr?: string;
  questionOrder: number;
  questionType: string;
  optionA: string;
  optionAAr?: string;
  optionB: string;
  optionBAr?: string;
  optionC: string;
  optionCAr?: string;
  optionD: string;
  optionDAr?: string;
  imageUrl?: string;
}

type Step = 'intro' | 'video' | 'questions' | 'result';

export default function TaskCompletion() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const { user, refreshUser, refreshTransactions } = useApp();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('intro');
  const [watchTime, setWatchTime] = useState(0);
  const [actualVideoDuration, setActualVideoDuration] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

  const videoRef = useRef<HTMLIFrameElement>(null);
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch task details
  useEffect(() => {
    fetchTask();
  }, [id]);

  // Fetch actual video duration from YouTube using IFrame Player API
  useEffect(() => {
    if (step === 'video' && task?.taskData?.videoUrl) {
      // Load YouTube IFrame API
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // YouTube API ready callback
      (window as any).onYouTubeIframeAPIReady = () => {
        const videoId = task.taskData.videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/)?.[1];
        if (videoId) {
          const player = new (window as any).YT.Player('youtube-player', {
            events: {
              'onReady': (event: any) => {
                const duration = event.target.getDuration();
                if (duration && duration > 0) {
                  setActualVideoDuration(Math.floor(duration));
                  console.log('Actual video duration:', Math.floor(duration), 'seconds');
                }
              }
            }
          });
        }
      };

      // If API is already loaded
      if ((window as any).YT && (window as any).YT.Player) {
        (window as any).onYouTubeIframeAPIReady();
      }
    }
  }, [step, task]);

  // Watch time tracker for video tasks
  useEffect(() => {
    if (step === 'video' && task?.type === 'video') {
      watchTimerRef.current = setInterval(() => {
        setWatchTime(prev => {
          // Stop counting when we reach the video duration
          const maxDuration = actualVideoDuration || (task.duration * 60);
          if (prev >= maxDuration) {
            if (watchTimerRef.current) {
              clearInterval(watchTimerRef.current);
            }
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);

      return () => {
        if (watchTimerRef.current) {
          clearInterval(watchTimerRef.current);
        }
      };
    }
  }, [step, task, actualVideoDuration]);

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

  const startTask = async () => {
    try {
      await fetch(`/api/tasks/${id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (task?.type === 'video') {
        setStep('video');
      } else if (task?.type === 'quiz') {
        setStep('questions');
      }
    } catch (error) {
      console.error('Error starting task:', error);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const submitTask = async () => {
    if (!task) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.values(answers),
          watchTime: task.type === 'video' ? watchTime : undefined
        })
      });

      if (!response.ok) {
        console.error('Submit failed:', response.status, response.statusText);
        const errorData = await response.json();
        console.error('Error data:', errorData);
        alert(`Submission failed: ${errorData.error || 'Unknown error'}`);
        return;
      }

      const data = await response.json();
      console.log('Submit response:', data);
      
      if (!data || typeof data.score === 'undefined') {
        console.error('Invalid response data:', data);
        alert('Received invalid response from server');
        return;
      }
      
      setResult(data);
      setStep('result');
      setRating(0);
      setIsRatingSubmitted(false);
      // Refresh user data and transactions after successful task completion
      await refreshUser();
      await refreshTransactions();
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const submitRating = async (selectedRating: number) => {
    if (!task || !result || !result.taskCompletionId || isRatingSubmitted) return;
    
    try {
      setRating(selectedRating);
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskCompletionId: result.taskCompletionId,
          campaignId: task.id,
          rating: selectedRating
        })
      });
      
      if (res.ok) {
        setIsRatingSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const canProceedFromVideo = () => {
    if (!task) return false;
    const requiredWatchTime = (task.duration * 60 * task.minWatchPercentage) / 100;
    return watchTime >= requiredWatchTime;
  };

  const allQuestionsAnswered = () => {
    if (!task) return false;
    return task.questions.every((_, index) => answers[index] !== undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">{t('tasks.notFound')}</p>
          <button
            onClick={() => setLocation('/tasks')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-lg"
          >
            {t('tasks.backToTasks')}
          </button>
        </div>
      </div>
    );
  }

  const title = language === 'ar' ? task.titleAr || task.titleEn : task.titleEn;
  const description = language === 'ar' ? task.descriptionAr || task.descriptionEn : task.descriptionEn;

  // Step 1: Introduction
  if (step === 'intro') {
    return (
      <MobileLayout title={task.advertiserName}>
        <div className="p-4">

          <div className="bg-card dark:bg-card rounded-xl shadow-lg p-8">
            {/* Task Info */}
            <h1 className="text-3xl font-bold text-card-foreground dark:text-card-foreground mb-4 text-start">{title}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-start">{description}</p>

            {/* Task Details - Horizontal Layout */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 rounded-lg px-4 py-3 flex-1 min-w-[140px]">
                <Award className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('tasks.reward')}</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{task.reward} {t('currency')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-3 flex-1 min-w-[140px]">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('tasks.duration')}</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{task.duration} {t('time.minutes')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg px-4 py-3 flex-1 min-w-[140px]">
                <div className="w-6 h-6 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-lg flex-shrink-0">★</div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('tasks.difficulty')}</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400 capitalize">{t(`difficulty.${task.difficulty}`)}</p>
                </div>
              </div>

              {task.questions.length > 0 && (
              <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg px-4 py-3 flex-1 min-w-[140px]">
                <div className="w-6 h-6 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-xl flex-shrink-0">?</div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('tasks.questions')}</p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{task.questions.length}</p>
                </div>
              </div>
              )}
            </div>

            {/* Requirements */}
            <div className="bg-muted dark:bg-muted rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-card-foreground dark:text-card-foreground mb-4">{t('tasks.requirements')}</h3>
              <ul className="space-y-2">
                {task.type === 'video' && (
                  <>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {t('tasks.watchMinimum', { percentage: task.minWatchPercentage })}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {t('tasks.answerQuestions', { count: task.questions.length })}
                      </span>
                    </li>
                  </>
                )}
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {t('tasks.passingScore', { score: task.passingScore })}
                  </span>
                </li>
              </ul>
            </div>

            {/* Start Button */}
            <button
              onClick={startTask}
              className="w-full py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Play className="w-5 h-5" />
              {t('tasks.startTask')}
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Step 2: Video Viewing (for video tasks)
  if (step === 'video' && task.type === 'video') {
    // Use actual video duration if available, otherwise fall back to task.duration
    // For watch requirement, use minWatchPercentage of the estimated duration
    const estimatedDuration = task.duration * 60; // Convert minutes to seconds
    const requiredWatchTime = (estimatedDuration * task.minWatchPercentage) / 100;
    
    // For display, show actual watch time vs required time
    const displayTotalTime = actualVideoDuration || estimatedDuration;
    
    // Fix: Progress should be calculated based on the required watch time
    // but we also need to ensure it hits 100% when the video is finished
    let progress = Math.min((watchTime / requiredWatchTime) * 100, 100);
    
    // If video is finished (watchTime >= displayTotalTime), force 100%
    // Also ensure progress is 100% if watchTime is within 2 seconds of total time to handle small sync issues
    if ((watchTime >= displayTotalTime || (displayTotalTime - watchTime <= 2)) && displayTotalTime > 0) {
      progress = 100;
    }
    
    const canContinue = canProceedFromVideo() || progress >= 100;

    return (
      <MobileLayout title={title}>
        {/* Full-width Video Player - No padding for maximum size */}
        <div className="bg-black">
          <div className="w-full aspect-video">
            {task.taskData?.videoUrl && (
              <video autoPlay playsInline
                ref={videoRef as any}
                className="w-full h-full"
                controls
                onLoadedMetadata={(e) => {
                  const duration = (e.target as HTMLVideoElement).duration;
                  if (duration && duration > 0) {
                    setActualVideoDuration(Math.floor(duration));
                  }
                }}
              >
                <source src={task.taskData.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>

        {/* Content below video - Full width to match video player */}
        <div className="bg-card dark:bg-card shadow-lg p-6">
            <h2 className="text-xl font-bold text-card-foreground dark:text-card-foreground mb-4">{title}</h2>

            {/* Watch Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tasks.watchProgress')}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {Math.floor(watchTime / 60)}:{(watchTime % 60).toString().padStart(2, '0')} / {Math.floor(displayTotalTime / 60)}:{Math.floor(displayTotalTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              {/* Green Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <style>{`.w-dyn-prog { width: ${progress}%; }`}</style>
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2 w-dyn-prog">
                  {progress > 10 && (
                    <span className="text-xs font-bold text-white">
                      {Math.round(progress)}%
                    </span>
                  )}
                </div>
              </div>
              {!canContinue && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {t('tasks.keepWatching')}
                </p>
              )}
              {canContinue && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-semibold">
                  ✓ {language === 'ar' ? 'يمكنك المتابعة الآن!' : 'You can continue now!'}
                </p>
              )}
            </div>

            {/* Continue Button */}
            <button
              onClick={() => setStep('questions')}
              disabled={!canContinue}
              className={`w-full py-4 rounded-lg font-semibold transition-colors ${
                canContinue
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {canContinue ? t('tasks.continueToQuestions') : t('tasks.watchMoreToUnlock')}
            </button>
        </div>
      </MobileLayout>
    );
  }

  // Step 3: Questions
  if (step === 'questions') {
    return (
      <MobileLayout title={title}>
        <div className="p-4">
          <div className="bg-card dark:bg-card rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-card-foreground dark:text-card-foreground mb-2">{t('tasks.verificationQuestions')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t('tasks.answerAllQuestions')} ({task.questions.length} {t('tasks.questions')})
            </p>

            {/* Questions */}
            <div className="space-y-8">
              {task.questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 dark:border-gray-700 pb-8 last:border-0">
                  <p className="font-semibold text-card-foreground dark:text-card-foreground mb-4">
                    {index + 1}. {language === 'ar' && question.questionTextAr ? question.questionTextAr : question.questionText}
                  </p>

                  {question.imageUrl && (
                    <img
                      src={question.imageUrl}
                      alt="Question"
                      className="w-full max-w-md rounded-lg mb-4"
                    />
                  )}

                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map(option => {
                      const optionTextEn = question[`option${option}` as keyof Question];
                      const optionTextAr = question[`option${option}Ar` as keyof Question];
                      const optionText = language === 'ar' && optionTextAr ? optionTextAr : optionTextEn;
                      if (!optionTextEn) return null;

                      return (
                        <label
                          key={option}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            answers[index] === option
                              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={answers[index] === option}
                            onChange={() => handleAnswerChange(index, option)}
                            className="w-5 h-5 text-primary-600"
                          />
                          <span className="text-card-foreground dark:text-card-foreground">
                            {option}. {optionText}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={submitTask}
              disabled={!allQuestionsAnswered() || submitting}
              className={`w-full mt-8 py-4 rounded-lg font-semibold transition-colors ${
                allQuestionsAnswered() && !submitting
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? t('common.submitting') : t('tasks.submitAnswers')}
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Step 4: Result
  if (step === 'result' && result) {
    return (
      <MobileLayout title={title}>
        <div className="p-4">
          <div className="bg-card dark:bg-card rounded-xl shadow-lg p-8 text-center">
            {result.passed ? (
              <>
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-card-foreground dark:text-card-foreground mb-4">
                  {t('tasks.congratulations')}
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                  {t('tasks.taskCompleted')}
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-3xl font-bold text-card-foreground dark:text-card-foreground mb-4">
                  {t('tasks.notPassed')}
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                  {result.message}
                </p>
              </>
            )}

            {/* Score */}
            <div className="bg-muted dark:bg-muted rounded-lg p-6 mb-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('tasks.yourScore')}</p>
                  <p className="text-3xl font-bold text-card-foreground dark:text-card-foreground">{result.score}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('tasks.correctAnswers')}</p>
                  <p className="text-3xl font-bold text-card-foreground dark:text-card-foreground">
                    {result.correctAnswers}/{result.totalQuestions}
                  </p>
                </div>
              </div>

              {result.passed && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-bold text-card-foreground dark:text-card-foreground mb-4">
                    {language === 'ar' ? 'تفاصيل المكافأة' : 'Reward Breakdown'}
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'ar' ? 'قيمة المهمة الأساسية' : 'Gross Reward'}
                      </span>
                      <span className="font-semibold">{result.reward || 0} ج.م</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-red-500">
                      <span className="text-sm">
                        {language === 'ar' ? 'عمولة المنصة' : 'Platform Commission'} 
                        ({user?.tier === 'bronze' ? '5%' : user?.tier === 'silver' ? '10%' : '20%'} - {language === 'ar' ? 'باقة ' : 'Tier '}{user?.tier || 'bronze'})
                      </span>
                      <span className="font-semibold">
                        -{((result.reward || 0) * (user?.tier === 'bronze' ? 0.05 : user?.tier === 'silver' ? 0.10 : 0.20)).toFixed(2)} ج.م
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {language === 'ar' ? 'الصافي المضاف لمحفظتك' : 'Net Added to Wallet'}
                      </span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {((result.reward || 0) * (1 - (user?.tier === 'bronze' ? 0.05 : user?.tier === 'silver' ? 0.10 : 0.20))).toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rating Prompt */}
              {result.passed && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600 flex flex-col items-center">
                  <h3 className="text-lg font-bold text-card-foreground dark:text-card-foreground mb-3">
                    {language === 'ar' ? 'كيف كانت تجربتك مع هذه المهمة؟' : 'How was your experience with this task?'}
                  </h3>
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        disabled={isRatingSubmitted}
                        onClick={() => submitRating(star)}
                        onMouseEnter={() => !isRatingSubmitted && setHoverRating(star)}
                        onMouseLeave={() => !isRatingSubmitted && setHoverRating(0)}
                        className={`text-4xl transition-colors ${
                          (hoverRating || rating) >= star 
                            ? 'text-yellow-400' 
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {isRatingSubmitted && (
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {language === 'ar' ? 'شكراً لتقييمك!' : 'Thank you for your rating!'}
                    </p>
                  )}
                </div>
              )}

              {!result.passed && result.attemptNumber && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('tasks.attempt')}: {result.attemptNumber} / {result.maxAttempts}
                  </p>
                </div>
              )}
            </div>

            {/* Answer Review - Show for failed attempts */}
            {!result.passed && result.answerResults && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-card-foreground dark:text-card-foreground mb-4">
                  {language === 'ar' ? 'مراجعة الإجابات' : 'Answer Review'}
                </h3>
                <div className="space-y-4">
                  {result.answerResults.map((answer: any, index: number) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        answer.isCorrect
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {answer.isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-card-foreground dark:text-card-foreground mb-2">
                            {language === 'ar' ? 'السؤال' : 'Question'} {index + 1}: {answer.questionText}
                          </p>
                          {!answer.isCorrect && (
                            <>
                              <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                                <span className="font-semibold">{language === 'ar' ? 'إجابتك:' : 'Your answer:'}</span> {answer.userAnswer}
                              </p>
                              <p className="text-sm text-green-600 dark:text-green-400">
                                <span className="font-semibold">{language === 'ar' ? 'الإجابة الصحيحة:' : 'Correct answer:'}</span> {answer.correctAnswer}
                              </p>
                            </>
                          )}
                          {answer.isCorrect && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                              ✓ {language === 'ar' ? 'إجابة صحيحة!' : 'Correct!'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {!result.passed && result.canRetry ? (
                <>
                  <button
                    onClick={() => setLocation('/tasks')}
                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-card-foreground dark:text-card-foreground rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    {t('tasks.backToTasks')}
                  </button>
                  <button
                    onClick={() => {
                      // Reset state and go back to intro
                      setAnswers({});
                      setWatchTime(0);
                      setResult(null);
                      setStep('intro');
                    }}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 shadow-lg flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    {language === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setLocation('/tasks')}
                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-card-foreground dark:text-card-foreground rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    {t('tasks.backToTasks')}
                  </button>
                  {result.passed && (
                    <button
                      onClick={() => setLocation('/wallet')}
                      className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 shadow-lg"
                    >
                      {t('tasks.viewWallet')}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return null;
}

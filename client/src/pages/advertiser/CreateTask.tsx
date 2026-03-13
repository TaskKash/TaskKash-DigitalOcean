import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, Trash2, Eye, Save, Send } from 'lucide-react';

interface Question {
  questionText: string;
  questionType: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
}

export default function CreateTask() {
  const [, setLocation] = useLocation();
  
  const [step, setStep] = useState(1);
  const [taskType, setTaskType] = useState<'video' | 'quiz'>('video');
  
  // Basic Info
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [duration, setDuration] = useState(10);
  
  // Budget & Targeting
  const [reward, setReward] = useState(10);
  const [completionsNeeded, setCompletionsNeeded] = useState(100);
  const [targetAgeMin, setTargetAgeMin] = useState(18);
  const [targetAgeMax, setTargetAgeMax] = useState(65);
  const [targetGender, setTargetGender] = useState('all');
  
  // Restrictions
  const [allowMultipleCompletions, setAllowMultipleCompletions] = useState(false);
  const [dailyLimitPerUser, setDailyLimitPerUser] = useState(0);
  const [requiresMinimumTier, setRequiresMinimumTier] = useState('');
  
  // Video Specific
  const [videoUrl, setVideoUrl] = useState('');
  const [minWatchPercentage, setMinWatchPercentage] = useState(80);
  const [videoDuration, setVideoDuration] = useState(0);
  const [detectingDuration, setDetectingDuration] = useState(false);
  
  // Quiz Specific
  const [passingScore, setPassingScore] = useState(80);
  
  // Questions
  const [questions, setQuestions] = useState<Question[]>([
    {
      questionText: '',
      questionType: 'multiple_choice',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: ''
    }
  ]);
  
  const [submitting, setSubmitting] = useState(false);

  // Auto-detect YouTube video duration
  useEffect(() => {
    const detectYouTubeDuration = async () => {
      if (!videoUrl || !videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
        return;
      }

      setDetectingDuration(true);
      try {
        // Extract video ID from URL
        let videoId = '';
        if (videoUrl.includes('youtube.com/watch?v=')) {
          videoId = videoUrl.split('v=')[1]?.split('&')[0];
        } else if (videoUrl.includes('youtu.be/')) {
          videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        }

        if (!videoId) {
          setDetectingDuration(false);
          return;
        }

        // Use YouTube oEmbed API to get video info
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (response.ok) {
          // oEmbed doesn't give duration, so we'll use a different approach
          // For now, set a default based on typical video length
          // In production, you'd use YouTube Data API v3 with API key
          console.log('Video detected, using estimated duration');
          // Set default duration to 5 minutes for now
          // Advertiser can adjust manually
          if (duration === 10) { // Only auto-set if still at default
            setDuration(5);
          }
        }
      } catch (error) {
        console.error('Error detecting video duration:', error);
      } finally {
        setDetectingDuration(false);
      }
    };

    const timer = setTimeout(detectYouTubeDuration, 1000);
    return () => clearTimeout(timer);
  }, [videoUrl]);

  const addQuestion = () => {
    setQuestions([...questions, {
      questionText: '',
      questionType: 'multiple_choice',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: ''
    }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const calculateBudget = () => {
    const total = reward * completionsNeeded;
    const minimum = total * 0.2;
    return { total, minimum };
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      return titleEn && descriptionEn && duration > 0;
    }
    if (currentStep === 2) {
      if (taskType === 'video') {
        return videoUrl && questions.every(q => q.questionText && q.optionA && q.optionB && q.correctAnswer);
      }
      return questions.every(q => q.questionText && q.optionA && q.optionB && q.correctAnswer);
    }
    if (currentStep === 3) {
      return reward > 0 && completionsNeeded > 0;
    }
    return true;
  };

  const handleSubmit = async (publish: boolean) => {
    setSubmitting(true);
    
    try {
      const taskData = taskType === 'video' ? { videoUrl } : {};
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: taskType,
          titleEn,
          titleAr,
          descriptionEn,
          descriptionAr,
          reward,
          completionsNeeded,
          difficulty,
          duration,
          targetAgeMin,
          targetAgeMax,
          targetGender,
          allowMultipleCompletions,
          dailyLimitPerUser,
          requiresMinimumTier: requiresMinimumTier || null,
          passingScore,
          minWatchPercentage,
          taskData,
          questions
        })
      });

      const data = await response.json();

      if (data.success) {
        if (publish) {
          // Publish immediately
          await fetch(`/api/tasks/${data.taskId}/publish`, {
            method: 'POST'
          });
        }
        
        alert(publish ? 'Task published successfully!' : 'Task saved as draft!');
        setLocation('/advertiser/tasks');
      } else {
        alert('Error creating task: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const budget = calculateBudget();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setLocation('/advertiser/new-dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Task</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create a {taskType === 'video' ? 'video' : 'quiz'} task for users to complete
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">Basic Info</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Content</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Budget</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Review</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Basic Information</h2>

              {/* Task Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTaskType('video')}
                    className={`p-4 rounded-lg border-2 ${
                      taskType === 'video'
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-4xl mb-2">📹</div>
                    <div className="font-semibold">Video Task</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Watch video + answer questions</div>
                  </button>
                  <button
                    onClick={() => setTaskType('quiz')}
                    className={`p-4 rounded-lg border-2 ${
                      taskType === 'quiz'
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-4xl mb-2">❓</div>
                    <div className="font-semibold">Quiz Task</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Answer quiz questions</div>
                  </button>
                </div>
              </div>

              {/* Title English */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title (English) *
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Watch Our Product Demo"
                />
              </div>

              {/* Title Arabic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title (Arabic)
                </label>
                <input
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="مثال: شاهد عرض منتجنا"
                  dir="rtl"
                />
              </div>

              {/* Description English */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (English) *
                </label>
                <textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe what users need to do..."
                />
              </div>

              {/* Description Arabic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Arabic)
                </label>
                <textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="اكتب وصف المهمة..."
                  dir="rtl"
                />
              </div>

              {/* Difficulty & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estimated Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {taskType === 'video' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {detectingDuration ? '🔍 Detecting video duration...' : 'Include time for watching video + answering questions'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Content (Video URL or Questions) */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {taskType === 'video' ? 'Video & Questions' : 'Quiz Questions'}
              </h2>

              {/* Video URL (for video tasks) */}
              {taskType === 'video' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      YouTube Video URL *
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minimum Watch Percentage: {minWatchPercentage}%
                    </label>
                    <input
                      type="range"
                      value={minWatchPercentage}
                      onChange={(e) => setMinWatchPercentage(parseInt(e.target.value))}
                      min="50"
                      max="100"
                      step="5"
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Users must watch at least {minWatchPercentage}% of the video
                    </p>
                  </div>
                </>
              )}

              {/* Questions */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Verification Questions *
                  </label>
                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                </div>

                <div className="space-y-6">
                  {questions.map((q, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Question {index + 1}</h4>
                        {questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <input
                          type="text"
                          value={q.questionText}
                          onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter your question..."
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={q.optionA}
                            onChange={(e) => updateQuestion(index, 'optionA', e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Option A"
                          />
                          <input
                            type="text"
                            value={q.optionB}
                            onChange={(e) => updateQuestion(index, 'optionB', e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Option B"
                          />
                          <input
                            type="text"
                            value={q.optionC}
                            onChange={(e) => updateQuestion(index, 'optionC', e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Option C (optional)"
                          />
                          <input
                            type="text"
                            value={q.optionD}
                            onChange={(e) => updateQuestion(index, 'optionD', e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Option D (optional)"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Correct Answer
                          </label>
                          <select
                            value={q.correctAnswer}
                            onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            {q.optionC && <option value="C">C</option>}
                            {q.optionD && <option value="D">D</option>}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Passing Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Passing Score: {passingScore}%
                </label>
                <input
                  type="range"
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value))}
                  min="50"
                  max="100"
                  step="5"
                  className="w-full"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Users must score at least {passingScore}% to pass
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Targeting */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Budget & Targeting</h2>

              {/* Reward & Completions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reward per Completion (ج.م) *
                  </label>
                  <input
                    type="number"
                    value={reward}
                    onChange={(e) => setReward(parseFloat(e.target.value))}
                    min="1"
                    step="0.5"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Completions Needed *
                  </label>
                  <input
                    type="number"
                    value={completionsNeeded}
                    onChange={(e) => setCompletionsNeeded(parseInt(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Budget Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Budget Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Budget:</span>
                    <span className="font-semibold">{budget.total.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minimum Required (20%):</span>
                    <span className="font-semibold">{budget.minimum.toFixed(2)} ج.م</span>
                  </div>
                </div>
              </div>

              {/* Age Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Age Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={targetAgeMin}
                    onChange={(e) => setTargetAgeMin(parseInt(e.target.value))}
                    min="13"
                    max="100"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Min age"
                  />
                  <input
                    type="number"
                    value={targetAgeMax}
                    onChange={(e) => setTargetAgeMax(parseInt(e.target.value))}
                    min="13"
                    max="100"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Max age"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Gender
                </label>
                <select
                  value={targetGender}
                  onChange={(e) => setTargetGender(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Restrictions */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Task Restrictions</h4>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={allowMultipleCompletions}
                    onChange={(e) => setAllowMultipleCompletions(e.target.checked)}
                    className="w-5 h-5 text-primary-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Allow users to complete this task multiple times
                  </span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Daily Limit per User (0 = no limit)
                  </label>
                  <input
                    type="number"
                    value={dailyLimitPerUser}
                    onChange={(e) => setDailyLimitPerUser(parseInt(e.target.value))}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Tier Required
                  </label>
                  <select
                    value={requiresMinimumTier}
                    onChange={(e) => setRequiresMinimumTier(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">No restriction</option>
                    <option value="tier1">Bronze (Tier 1)</option>
                    <option value="tier2">Silver (Tier 2)</option>
                    <option value="tier3">Gold (Tier 3)</option>
                    <option value="tier4">Platinum (Tier 4)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Review & Publish</h2>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Task Details</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Type:</dt>
                      <dd className="font-medium capitalize">{taskType}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Title:</dt>
                      <dd className="font-medium">{titleEn}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Difficulty:</dt>
                      <dd className="font-medium capitalize">{difficulty}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Duration:</dt>
                      <dd className="font-medium">{duration} minutes</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Questions:</dt>
                      <dd className="font-medium">{questions.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Passing Score:</dt>
                      <dd className="font-medium">{passingScore}%</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Budget</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Reward:</dt>
                      <dd className="font-medium">{reward} ج.م</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Completions:</dt>
                      <dd className="font-medium">{completionsNeeded}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Total Budget:</dt>
                      <dd className="font-semibold text-lg">{budget.total.toFixed(2)} ج.م</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Targeting</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Age Range:</dt>
                      <dd className="font-medium">{targetAgeMin} - {targetAgeMax}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Gender:</dt>
                      <dd className="font-medium capitalize">{targetGender}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Multiple Completions:</dt>
                      <dd className="font-medium">{allowMultipleCompletions ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-8 border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 -mx-8 -mb-8 px-8 py-6 rounded-b-xl">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
            )}

            <div className="flex gap-4 ml-auto">
              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!validateStep(step)}
                  className={`px-6 py-3 rounded-lg font-semibold ${
                    validateStep(step)
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save as Draft
                  </button>
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={submitting}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Publish Task
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

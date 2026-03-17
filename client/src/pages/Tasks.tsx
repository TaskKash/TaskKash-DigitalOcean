import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';
import { Clock, Filter, CheckCircle, ListTodo } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import AdvancedFilters from '@/components/AdvancedFilters';
import { getAdvertiserId } from '@/lib/advertiserUtils';
import { useLocalizedFieldGetter } from '@/lib/languageUtils';

const taskTypeIcons: Record<string, string> = {
  survey: '📋',
  video: '🎥',
  app: '📱',
  social: '👥',
  quiz: '❓',
  photo: '📸',
  visit: '📍',
  vote: '☑️'
};

const taskTypesList = ['survey', 'video', 'app', 'social', 'quiz', 'photo', 'visit', 'vote'];

interface CompletedTask {
  id: string;
  taskId: number;
  title: string;
  titleEn: string;
  titleAr: string;
  type: string;
  reward: number;
  advertiser: string;
  advertiserLogo: string;
  status: string;
  score: number;
  completedAt: string;
}

export default function Tasks() {
  const { t } = useTranslation();
  const { tasks: contextTasks } = useApp();
  const getLocalizedField = useLocalizedFieldGetter();
  const [, setLocation] = useLocation();
  const [filterType, setFilterType] = useState<string[]>(['all']);
  const [tasks, setTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(true);
  const [advancedFilters, setAdvancedFilters] = useState<{
    category: string[];
    difficulty: string[];
    reward: { min: number; max: number };
    duration: { min: number; max: number };
    sortBy?: 'default' | 'value-high' | 'value-low' | 'duration' | 'difficulty';
    advertiserId?: number | null;
  }>({
    category: [],
    difficulty: [],
    reward: { min: 0, max: 1000 },
    duration: { min: 0, max: 120 },
    sortBy: 'default',
    advertiserId: null
  });

  // Fetch available tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const params = new URLSearchParams();
        if (advancedFilters.advertiserId) {
          params.append('advertiserId', advancedFilters.advertiserId.toString());
        }

        const response = await fetch(`/api/tasks?${params}`);
        if (response.ok) {
          const data = await response.json();
          console.log('[Tasks] API Response:', data);
          const transformedTasks = data.tasks.map((task: any) => ({
            id: task.id.toString(),
            title: task.titleEn || task.titleAr,
            titleEn: task.titleEn,
            titleAr: task.titleAr,
            description: task.descriptionEn || task.descriptionAr,
            descriptionEn: task.descriptionEn,
            descriptionAr: task.descriptionAr,
            reward: task.reward,
            duration: task.duration,
            difficulty: task.difficulty,
            type: task.type,
            status: task.isCompleted ? 'completed' : 'available',
            company: task.advertiserName || 'Samsung Egypt',
            companyLogo: task.advertiserLogo || '',
            advertiser: task.advertiserName || 'Samsung Egypt',
            advertiserLogo: task.advertiserLogo || '',
            advertiserId: task.advertiserId,
            requirements: task.requirements || [],
            steps: task.steps || [],
            category: task.category || 'technology',
            tags: task.tags || []
          }));
          console.log('[Tasks] Transformed tasks:', transformedTasks);
          setTasks(transformedTasks);
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        setTasks(contextTasks);
      }
    };

    fetchTasks();
  }, [advancedFilters.advertiserId]);

  // Fetch completed tasks from my-submissions endpoint
  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        setIsLoadingCompleted(true);
        const response = await fetch('/api/tasks/my-submissions');
        if (response.ok) {
          const data = await response.json();
          console.log('[Tasks] My submissions:', data);

          // Filter only approved/completed submissions and transform them
          const completedSubmissions = (data.submissions || [])
            .filter((sub: any) => sub.status === 'approved' || sub.status === 'completed')
            .map((sub: any) => ({
              id: sub.id.toString(),
              taskId: sub.taskId,
              title: sub.taskTitle || 'Completed Task',
              titleEn: sub.taskTitle,
              titleAr: sub.taskTitle,
              type: sub.taskType || 'task',
              reward: parseFloat(sub.rewardAmount) || 0,
              advertiser: sub.advertiserName || 'TaskKash',
              advertiserLogo: '',
              status: 'completed',
              score: sub.score || 0,
              completedAt: sub.completedAt || sub.createdAt
            }));

          setCompletedTasks(completedSubmissions);
        }
      } catch (error) {
        console.error('Failed to fetch completed tasks:', error);
        setCompletedTasks([]);
      } finally {
        setIsLoadingCompleted(false);
      }
    };

    fetchCompletedTasks();
  }, []);

  const availableTasks = tasks.filter(t => t.status === 'available' || t.status === 'active');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');

  // We no longer have a single 'filterType', we will have a multi-select state instead.
  // Wait, I will use advancedFilters.category instead of filterType. I will remove the old filterType logic.
  let filteredAvailableTasks = filterType === 'all'
    ? availableTasks
    : availableTasks.filter(t => filterType.includes(t.type));

  // Apply category filter from Advanced Filters
  if (advancedFilters.category && advancedFilters.category.length > 0) {
    filteredAvailableTasks = filteredAvailableTasks.filter(t => {
      // The task category from DB might be in English or missing. We do a loose match.
      const taskCat = (t.category || '').toLowerCase();
      return advancedFilters.category.some(c => {
        const lowerC = c.toLowerCase();
        // Match English directly
        if (taskCat.includes(lowerC)) return true;
        // Map Arabic categories to English equivalents for matching
        if (c === 'تطبيقات' && taskCat.includes('app')) return true;
        if (c === 'استبيانات' && taskCat.includes('survey')) return true;
        if (c === 'تسوق' && taskCat.includes('shop')) return true;
        if (c === 'تعليم' && taskCat.includes('education')) return true;
        if (c === 'ترفيه' && taskCat.includes('entertainment')) return true;
        return false;
      });
    });
  }

  // Apply difficulty filter from Advanced Filters
  if (advancedFilters.difficulty && advancedFilters.difficulty.length > 0) {
    filteredAvailableTasks = filteredAvailableTasks.filter(t =>
      advancedFilters.difficulty.includes(t.difficulty) ||
      advancedFilters.difficulty.includes(getDifficultyLabel(t.difficulty)) ||
      // Also match English names in case the filter uses them natively but data is different
      advancedFilters.difficulty.map(d => d.toLowerCase()).includes(t.difficulty.toLowerCase())
    );
  }

  // Apply sorting
  if (advancedFilters.sortBy && advancedFilters.sortBy !== 'default') {
    filteredAvailableTasks = [...filteredAvailableTasks].sort((a, b) => {
      switch (advancedFilters.sortBy) {
        case 'value-high':
          return b.reward - a.reward; // Highest value first
        case 'value-low':
          return a.reward - b.reward; // Lowest value first
        case 'duration':
          return a.duration - b.duration; // Shortest duration first
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) -
            (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0);
        default:
          return 0;
      }
    });
  }

  const getTaskTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      survey: t('tasks.types.survey'),
      video: t('tasks.types.video'),
      app: t('tasks.types.app'),
      social: t('tasks.types.social'),
      quiz: t('tasks.types.quiz'),
      photo: t('tasks.types.photo'),
      visit: t('tasks.types.visit'),
      vote: t('tasks.types.vote')
    };
    return typeMap[type] || type;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const diffMap: Record<string, string> = {
      easy: t('difficulty.easy'),
      medium: t('difficulty.medium'),
      hard: t('difficulty.hard'),
      advanced: t('difficulty.advanced')
    };
    return diffMap[difficulty] || difficulty;
  };

  const TaskCard = ({ task }: { task: typeof tasks[0] }) => (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => {
        // Redirect video, quiz, and survey tasks to new completion flow
        if (task.type === 'video' || task.type === 'quiz') {
          setLocation(`/tasks/${task.id}/complete`);
        } else if (task.type === 'survey') {
          setLocation(`/tasks/${task.id}/survey`);
        } else {
          setLocation(`/tasks/${task.id}`);
        }
      }}
    >
      <div className="flex items-start gap-3">
        {/* Advertiser Logo - Clickable */}
        <div
          className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer hover:border-primary transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            const advertiserId = getAdvertiserId(task.advertiser);
            setLocation(`/advertiser/${advertiserId}`);
          }}
        >
          <img
            src={task.advertiserLogo}
            alt={task.advertiser}
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const typeIcons: Record<string, string> = { survey: '📋', video: '🎥', app: '📱', social: '👥', quiz: '❓', photo: '📸', visit: '📍', vote: '☑️' };
              e.currentTarget.parentElement!.innerHTML = `<div class="text-2xl">${typeIcons[task.type] || '💼'}</div>`;
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm line-clamp-1">{getLocalizedField(task, 'title')}</h4>
            <Badge className="bg-primary text-white border-0 flex-shrink-0 font-bold">
              {task.reward} {t('currency')}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <p
              className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                const advertiserId = getAdvertiserId(task.advertiser);
                setLocation(`/advertiser/${advertiserId}`);
              }}
            >
              {getLocalizedField(task, 'advertiser')}
            </p>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {getLocalizedField(task, 'description')}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.duration} {t('time.minutes')}
            </span>
            <Badge variant="outline" className="text-xs">
              {getTaskTypeName(task.type)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getDifficultyLabel(task.difficulty)}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );

  // Completed Task Card component
  const CompletedTaskCard = ({ task }: { task: CompletedTask }) => (
    <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-800 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm line-clamp-1">{task.title}</h4>
            <Badge className="bg-green-600 text-white border-0 flex-shrink-0 font-bold">
              +{task.reward} {t('currency')}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground mb-2">
            {task.advertiser}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-700">
              {getTaskTypeName(task.type)}
            </Badge>
            {task.score > 0 && (
              <span className="text-green-600 dark:text-green-400 font-medium">
                Score: {task.score}%
              </span>
            )}
            <span className="text-muted-foreground">
              {new Date(task.completedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );

  const taskTypeNames = useMemo(() => ({
    survey: t('tasks.types.survey'),
    video: t('tasks.types.video'),
    app: t('tasks.types.app'),
    social: t('tasks.types.social'),
    quiz: t('tasks.types.quiz'),
    photo: t('tasks.types.photo'),
    visit: t('tasks.types.visit'),
    vote: t('tasks.types.vote')
  }), [t]);

  return (
    <MobileLayout title={t('tasks.title')}>
      <div className="p-4">
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="available">
              {t('tasks.tabs.available')} ({availableTasks.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              {t('tasks.tabs.inProgress')} ({inProgressTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              {t('tasks.tabs.completed')} ({isLoadingCompleted ? '...' : completedTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {/* Filter Checkboxes */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Filter className="w-4 h-4 text-primary" /> تصفية حسب نوع المهمة</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                  <Checkbox 
                    checked={filterType.includes('all')} 
                    onCheckedChange={(checked) => {
                      if (checked) setFilterType(['all']);
                      else setFilterType([]);
                    }}
                  />
                  <span className="text-sm">{t('all')}</span>
                </label>
                {taskTypesList.map((type) => (
                  <label key={type} className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                    <Checkbox
                      checked={filterType.includes(type) && !filterType.includes('all')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const newFilter = filterType.filter(f => f !== 'all');
                          setFilterType([...newFilter, type]);
                        } else {
                          const newFilter = filterType.filter(f => f !== type && f !== 'all');
                          setFilterType(newFilter.length === 0 ? ['all'] : newFilter);
                        }
                      }}
                    />
                    <span className="text-sm flex items-center gap-1.5">
                      <span>{taskTypeIcons[type as keyof typeof taskTypeIcons]}</span>
                      <span>{taskTypeNames[type as keyof typeof taskTypeNames]}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Advanced Filters */}
            <AdvancedFilters
              activeFilters={advancedFilters}
              onFilterChange={setAdvancedFilters}
            />

            <div className="space-y-3">
              {filteredAvailableTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              {filteredAvailableTasks.length === 0 && (
                <Card className="p-10 text-center border-dashed border-2 bg-muted/30">
                  <ListTodo className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="font-medium text-foreground mb-1">{t('tasks.empty.available') || 'لا توجد مهام حالياً'}</p>
                  <p className="text-sm text-muted-foreground">جرب تغيير عوامل التصفية لعرض المهام</p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-3">
            {inProgressTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {inProgressTasks.length === 0 && (
              <Card className="p-10 text-center border-dashed border-2 bg-muted/30">
                <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="font-medium text-foreground mb-1">{t('tasks.empty.inProgress') || 'لا يوجد مهام قيد التنفيذ'}</p>
                <p className="text-sm text-muted-foreground">قم ببدء مهمة لتظهر هنا</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3">
            {isLoadingCompleted ? (
              <Card className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-muted-foreground">Loading completed tasks...</p>
              </Card>
            ) : completedTasks.length > 0 ? (
              completedTasks.map(task => (
                <CompletedTaskCard key={task.id} task={task} />
              ))
            ) : (
              <Card className="p-10 text-center border-dashed border-2 bg-muted/30">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="font-medium text-foreground mb-1">{t('tasks.empty.completed') || 'لم تكمل أي مهام بعد'}</p>
                <p className="text-sm text-muted-foreground">أكمل المزيد من المهام لزيادة أرباحك!</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}

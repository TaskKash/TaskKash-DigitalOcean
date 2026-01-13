import React, { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useLocalizedFieldGetter } from '@/lib/languageUtils';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, Heart, Share2, MessageCircle, Star, Award,
  TrendingUp, Users, DollarSign, Play, Clock, Target
} from 'lucide-react';
import { toast } from 'sonner';

interface Advertiser {
  id: number;
  nameEn: string;
  nameAr: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  descriptionEn: string;
  descriptionAr: string;
  stats: {
    activeCampaigns: number;
    totalTasks: number;
    totalUsers: number;
    totalCompletions: number;
    totalPaid: number;
    avgRating: number;
    reviewsCount: number;
    completionRate: number;
    paymentRate: number;
  };
  tasks: Task[];
}

interface Task {
  id: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  type: string;
  reward: number;
  duration: number | null;
  difficulty: string | null;
  status: string;
  completionsCount: number;
  completionsNeeded: number;
  completionRate: number;
  taskData: any;
}

export default function AdvertiserPageDynamic() {
  const { t } = useTranslation();
  const getLocalizedField = useLocalizedFieldGetter();
  const [, params] = useRoute('/advertiser/:slug');
  const slug = params?.slug || '';
  
  const [advertiser, setAdvertiser] = useState<Advertiser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvertiser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/advertisers/${slug}`);
        
        if (!response.ok) {
          throw new Error('Advertiser not found');
        }
        
        const data = await response.json();
        setAdvertiser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load advertiser');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchAdvertiser();
    }
  }, [slug]);

  if (loading) {
    return (
      <MobileLayout title={t('loading')}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('advertiser.loading')}</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (error || !advertiser) {
    return (
      <MobileLayout title={t('error')}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card className="p-8 text-center">
            <p className="text-lg text-muted-foreground mb-4">{error || t('advertiser.notFound')}</p>
            <Link href="/tasks">
              <Button>{t('advertiser.backToTasks')}</Button>
            </Link>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  const activeTasks = advertiser.tasks.filter(t => t.status === 'active');
  const completedTasks = advertiser.tasks.filter(t => t.completionsCount > 0);

  return (
    <MobileLayout title={getLocalizedField(advertiser, 'name')}>
      <div className="space-y-4">
        {/* Profile Card */}
        <Card className="p-4">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-xl bg-white p-2 shadow-md border-2 border-background">
                <img 
                  src={advertiser.logoUrl || '/placeholder-logo.png'} 
                  alt={advertiser.nameAr}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-logo.png';
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-xl font-bold">{getLocalizedField(advertiser, 'name')}</h2>
                <Badge className="gap-1 bg-primary text-xs h-5">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  {t('verified')}
                </Badge>
              </div>
              
              <p className="text-sm text-foreground/80 mb-3 line-clamp-2">
                {getLocalizedField(advertiser, 'description')}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" className="gap-1 h-8 text-xs">
                  <Heart className="h-3 w-3" />
                  {t('follow')}
                </Button>
                <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
                  <Share2 className="h-3 w-3" />
                  {t('share')}
                </Button>
                {advertiser.websiteUrl && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 h-8 text-xs"
                    onClick={() => window.open(advertiser.websiteUrl!, '_blank')}
                  >
                    <MessageCircle className="h-3 w-3" />
                    {t('advertiser.website')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="text-2xl font-bold text-primary">{advertiser.stats.activeCampaigns}</div>
            <div className="text-xs text-muted-foreground">{t('activeCampaigns')}</div>
          </Card>
          <Card className="p-3 text-center bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <div className="text-2xl font-bold text-secondary">
              {advertiser.stats.totalUsers >= 1000 
                ? `${(advertiser.stats.totalUsers / 1000).toFixed(0)}K+`
                : advertiser.stats.totalUsers}
            </div>
            <div className="text-xs text-muted-foreground">{t('activeUsers')}</div>
          </Card>
          <Card className="p-3 text-center bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <div className="text-2xl font-bold text-green-600">{advertiser.stats.paymentRate}%</div>
            <div className="text-xs text-muted-foreground">{t('paymentRate')}</div>
          </Card>
          <Card className="p-3 text-center bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              {advertiser.stats.avgRating.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              {advertiser.stats.reviewsCount >= 1000
                ? `${(advertiser.stats.reviewsCount / 1000).toFixed(1)}K ${t('reviews')}`
                : `${advertiser.stats.reviewsCount} ${t('reviews')}`}
            </div>
          </Card>
        </div>

        {/* Impact Banner */}
        <Card className="p-4 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                <Award className="h-5 w-5" />
                {t('socialImpact')}
              </h3>
              <p className="text-sm text-white/90">
                {t('paidTo', {
                  amount: `${(advertiser.stats.totalPaid / 1000).toFixed(1)}K ${t('currency')}`,
                  users: advertiser.stats.totalUsers >= 1000
                    ? `${(advertiser.stats.totalUsers / 1000).toFixed(0)}K`
                    : advertiser.stats.totalUsers
                })}
              </p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </Card>

        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {t('advertiser.availableTasks')} ({activeTasks.length})
            </h3>
            <div className="space-y-3">
              {activeTasks.map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-primary/10 flex-shrink-0 flex items-center justify-center">
                        <Play className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-sm line-clamp-2">{getLocalizedField(task, 'title')}</h4>
                          <Badge className="bg-primary text-white flex-shrink-0">
                            {task.reward} {t('currency')}
                          </Badge>
                        </div>
                        <p className="text-xs text-foreground/70 mb-2 line-clamp-1">
                          {getLocalizedField(task, 'description')}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.duration || 2} {t('time.minutes')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {task.completionsCount}/{task.completionsNeeded}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${task.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t('lastCompletedTasks')}
            </h3>
            <div className="space-y-3">
              {completedTasks.slice(0, 3).map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-2 mb-1">{getLocalizedField(task, 'title')}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {t('advertiser.completedBy', { count: task.completionsCount })}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {task.reward} {t('currency')}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                          {task.completionRate.toFixed(0)}% {t('advertiser.completed')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Tasks Message */}
        {advertiser.tasks.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">{t('advertiser.noTasks')}</p>
            <p className="text-sm text-muted-foreground mt-2">{t('advertiser.followForUpdates')}</p>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}

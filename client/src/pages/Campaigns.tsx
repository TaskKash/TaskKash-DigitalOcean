import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowRight, 
  ArrowLeft,
  Target, 
  Gift, 
  Clock, 
  CheckCircle2, 
  Users,
  ChevronRight,
  Play,
  Star,
  Trophy,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import MobileLayout from '@/components/layout/MobileLayout';

interface Campaign {
  id: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  reward: number;
  currency: string;
  totalTasks: number;
  completions: number;
  advertiserName: string;
  advertiserNameAr: string;
  advertiserLogo: string;
  coverImage: string;
  status: string;
  userProgress?: {
    status: string;
    tasksCompleted: number;
    totalTasks: number;
    currentSequence: number;
  } | null;
}

export default function Campaigns() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const isRTL = i18n.language === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Fetch campaigns
  const { data: campaigns, isLoading, error } = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/campaigns', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      return response.json();
    }
  });

  const getLocalizedText = (en: string, ar: string) => {
    return i18n.language === 'ar' ? ar : en;
  };

  const getProgressPercentage = (progress: Campaign['userProgress']) => {
    if (!progress) return 0;
    return Math.round((progress.tasksCompleted / progress.totalTasks) * 100);
  };

  const getStatusBadge = (campaign: Campaign) => {
    if (!campaign.userProgress) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <Sparkles className="w-3 h-3 mr-1" />
          {t('campaigns.new', 'New')}
        </Badge>
      );
    }
    
    switch (campaign.userProgress.status) {
      case 'completed':
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <Trophy className="w-3 h-3 mr-1" />
            {t('campaigns.completed', 'Completed')}
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Play className="w-3 h-3 mr-1" />
            {t('campaigns.inProgress', 'In Progress')}
          </Badge>
        );
      case 'disqualified':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            {t('campaigns.disqualified', 'Not Eligible')}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <MobileLayout title={t('campaigns.title', 'Campaigns')} showBack>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout title={t('campaigns.title', 'Campaigns')} showBack>
        <div className="p-4 text-center">
          <p className="text-red-500">{t('campaigns.error', 'Failed to load campaigns')}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            {t('common.retry', 'Retry')}
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={t('campaigns.title', 'Campaigns')} showBack>
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">{t('campaigns.heroTitle', 'Multi-Task Campaigns')}</h2>
        </div>
        <p className="text-purple-100 text-sm mb-4">
          {t('campaigns.heroDescription', 'Complete a series of tasks to earn bigger rewards. Each campaign is a journey with multiple steps.')}
        </p>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Gift className="w-4 h-4" />
            <span>{t('campaigns.higherRewards', 'Higher Rewards')}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('campaigns.multipleSteps', 'Multiple Steps')}</span>
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="p-4 space-y-4">
        {campaigns && campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <Card 
              key={campaign.id} 
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setLocation(`/campaigns/${campaign.id}`)}
            >
              {/* Campaign Cover Image */}
              <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                {campaign.coverImage ? (
                  <img 
                    src={campaign.coverImage} 
                    alt={getLocalizedText(campaign.titleEn, campaign.titleAr)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Target className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                
                {/* Advertiser Logo */}
                {campaign.advertiserLogo && (
                  <div className="absolute top-3 left-3 bg-white rounded-lg p-2 shadow-md">
                    <img 
                      src={campaign.advertiserLogo} 
                      alt={getLocalizedText(campaign.advertiserName, campaign.advertiserNameAr)}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(campaign)}
                </div>
                
                {/* Reward Badge */}
                <div className="absolute bottom-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {campaign.reward} {campaign.currency}
                </div>
              </div>

              <CardContent className="p-4">
                {/* Campaign Title */}
                <h3 className="font-bold text-lg mb-1">
                  {getLocalizedText(campaign.titleEn, campaign.titleAr)}
                </h3>
                
                {/* Advertiser Name */}
                <p className="text-sm text-gray-500 mb-2">
                  {t('campaigns.by', 'By')} {getLocalizedText(campaign.advertiserName, campaign.advertiserNameAr)}
                </p>
                
                {/* Campaign Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {getLocalizedText(campaign.descriptionEn, campaign.descriptionAr)}
                </p>
                
                {/* Campaign Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{campaign.totalTasks} {t('campaigns.tasks', 'Tasks')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{campaign.completions} {t('campaigns.completions', 'Completions')}</span>
                  </div>
                </div>
                
                {/* Progress Bar (if in progress) */}
                {campaign.userProgress && campaign.userProgress.status === 'in_progress' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{t('campaigns.progress', 'Progress')}</span>
                      <span className="font-medium">{getProgressPercentage(campaign.userProgress)}%</span>
                    </div>
                    <Progress value={getProgressPercentage(campaign.userProgress)} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {campaign.userProgress.tasksCompleted} / {campaign.userProgress.totalTasks} {t('campaigns.tasksCompleted', 'tasks completed')}
                    </p>
                  </div>
                )}
                
                {/* Action Button */}
                <Button 
                  className="w-full"
                  variant={campaign.userProgress?.status === 'completed' ? 'outline' : 'default'}
                  disabled={campaign.userProgress?.status === 'disqualified'}
                >
                  {campaign.userProgress?.status === 'completed' ? (
                    <>
                      <Trophy className="w-4 h-4 mr-2" />
                      {t('campaigns.viewResults', 'View Results')}
                    </>
                  ) : campaign.userProgress?.status === 'in_progress' ? (
                    <>
                      {t('campaigns.continue', 'Continue Campaign')}
                      <ArrowIcon className="w-4 h-4 ml-2" />
                    </>
                  ) : campaign.userProgress?.status === 'disqualified' ? (
                    t('campaigns.notEligible', 'Not Eligible')
                  ) : (
                    <>
                      {t('campaigns.start', 'Start Campaign')}
                      <ArrowIcon className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">{t('campaigns.noCampaigns', 'No Campaigns Available')}</h3>
            <p className="text-gray-500 text-sm">
              {t('campaigns.noCampaignsDescription', 'Check back soon for new multi-task campaigns with bigger rewards!')}
            </p>
          </Card>
        )}
      </div>

    </MobileLayout>
  );
}

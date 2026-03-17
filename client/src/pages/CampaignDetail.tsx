import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowRight, 
  ArrowLeft,
  Target, 
  Gift, 
  Clock, 
  CheckCircle2, 
  Circle,
  Lock,
  Play,
  Video,
  FileQuestion,
  ClipboardList,
  MapPin,
  Trophy,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Users,
  Share2,
  Facebook,
  Twitter,
  Copy,
  Link as LinkIcon,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import MobileLayout from '@/components/layout/MobileLayout';
import { useAuth } from '@/_core/hooks/useAuth';

import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CampaignTask {
  campaignTaskId: number;
  sequence: number;
  gatingRules: any;
  isRequired: boolean;
  id: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  type: string;
  reward: number;
}

interface Campaign {
  id: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  reward: number;
  currency: string;
  coverImage: string;
  advertiserName: string;
  advertiserNameAr: string;
  advertiserLogo: string;
  advertiserDescription: string;
  advertiserDescriptionAr: string;
  tasks: CampaignTask[];
  personas: any[];
  qualifications: any[];
  advertiserId: number;
  userProgress?: {
    status: string;
    tasksCompleted: number;
    totalTasks: number;
    currentSequence: number;
    currentTaskId: number;
    personaId: number;
  } | null;
}

export default function CampaignDetail() {
  const [match, params] = useRoute('/campaigns/:id');
  const id = params?.id;
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const isRTL = i18n.language === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const { user: authUser } = useAuth();

  // Fetch campaign details
  const { data: campaign, isLoading, error } = useQuery<Campaign>({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${id}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch campaign');
      }
      return response.json();
    },
    enabled: !!id
  });

  const isOwner = authUser?.role === 'advertiser' && campaign?.advertiserId === authUser?.id;

  // Fetch advertiser analytics (if owner)
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['campaign-analytics', id],
    queryFn: async () => {
      const response = await fetch(`/api/advertiser/campaigns/${id}/report`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: !!id && !!isOwner
  });

  // Start campaign mutation
  const startCampaignMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/campaigns/${id}/start`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start campaign');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(t('campaigns.started', 'Campaign Started!'));
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      // Navigate to the first task
      if (data.currentTask) {
        navigateToTask(data.currentTask);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || t('campaigns.startError', 'Cannot Start Campaign'));
    }
  });

  const getLocalizedText = (en: string, ar: string) => {
    return i18n.language === 'ar' ? ar : en;
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'survey':
        return <ClipboardList className="w-5 h-5" />;
      case 'quiz':
        return <FileQuestion className="w-5 h-5" />;
      case 'visit':
        return <MapPin className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getTaskStatus = (task: CampaignTask) => {
    if (!campaign?.userProgress) return 'locked';
    
    const currentSequence = campaign.userProgress.currentSequence;
    
    if (task.sequence < currentSequence) return 'completed';
    if (task.sequence === currentSequence) return 'current';
    return 'locked';
  };

  const navigateToTask = (task: CampaignTask) => {
    // Navigate to the appropriate task completion page based on task type
    switch (task.type) {
      case 'video':
        setLocation(`/tasks/${task.id}/complete?campaignId=${id}`);
        break;
      case 'survey':
        setLocation(`/tasks/${task.id}/complete?campaignId=${id}`);
        break;
      case 'quiz':
        setLocation(`/tasks/${task.id}/complete?campaignId=${id}`);
        break;
      case 'visit':
        setLocation(`/tasks/${task.id}/complete?campaignId=${id}`);
        break;
      default:
        setLocation(`/tasks/${task.id}/complete?campaignId=${id}`);
    }
  };

  const handleStartOrContinue = () => {
    if (!campaign) return;

    if (!campaign.userProgress) {
      // Start the campaign
      startCampaignMutation.mutate();
    } else if (campaign.userProgress.status === 'in_progress') {
      // Continue to current task
      const currentTask = campaign.tasks.find(t => t.sequence === campaign.userProgress!.currentSequence);
      if (currentTask) {
        navigateToTask(currentTask);
      }
    }
  };

  if (isLoading) {
    return (
      <MobileLayout title={t('campaigns.loading', 'Loading...')} showBack>
        <div className="p-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </MobileLayout>
    );
  }

  if (error || !campaign) {
    return (
      <MobileLayout title={t('campaigns.error', 'Error')} showBack>
        <div className="p-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{t('campaigns.loadError', 'Failed to load campaign')}</p>
          <Button onClick={() => setLocation('/campaigns')}>
            {t('campaigns.backToList', 'Back to Campaigns')}
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const progressPercentage = campaign.userProgress 
    ? Math.round((campaign.userProgress.tasksCompleted / campaign.userProgress.totalTasks) * 100)
    : 0;

  return (
    <MobileLayout 
      title={getLocalizedText(campaign.titleEn, campaign.titleAr)} 
      showBack
    >
      <div className="pb-24">

      {/* Campaign Cover */}
      <div className="relative h-48 bg-gradient-to-br from-purple-600 to-indigo-700">
        {campaign.coverImage ? (
          <img 
            src={campaign.coverImage} 
            alt={getLocalizedText(campaign.titleEn, campaign.titleAr)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Target className="w-20 h-20 text-white/30" />
          </div>
        )}
        
        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Advertiser Logo */}
        {campaign.advertiserLogo && (
          <div className="absolute top-4 left-4 bg-white rounded-lg p-2 shadow-lg">
            <img 
              src={campaign.advertiserLogo} 
              alt={getLocalizedText(campaign.advertiserName, campaign.advertiserNameAr)}
              className="w-12 h-12 object-contain"
            />
          </div>
        )}
        
        {/* Reward Badge */}
        <div className="absolute bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
          <Gift className="w-5 h-5" />
          {campaign.reward} {campaign.currency}
        </div>
        
        {/* Status Badge */}
        {campaign.userProgress?.status === 'completed' && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-purple-500 text-white px-3 py-1">
              <Trophy className="w-4 h-4 mr-1" />
              {t('campaigns.completed', 'Completed')}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Campaign Info */}
        <Card>
          <CardContent className="p-4">
            <h1 className="text-xl font-bold mb-2">
              {getLocalizedText(campaign.titleEn, campaign.titleAr)}
            </h1>
            <p className="text-sm text-gray-500 mb-3">
              {t('campaigns.by', 'By')} {getLocalizedText(campaign.advertiserName, campaign.advertiserNameAr)}
            </p>
            <p className="text-gray-600 mb-4">
              {getLocalizedText(campaign.descriptionEn, campaign.descriptionAr)}
            </p>
            
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-500">
                <CheckCircle2 className="w-4 h-4" />
                <span>{campaign.tasks.length} {t('campaigns.tasks', 'Tasks')}</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <Gift className="w-4 h-4" />
                <span>{campaign.reward} {campaign.currency}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Card (if started) */}
        {campaign.userProgress && campaign.userProgress.status === 'in_progress' && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-blue-800">{t('campaigns.yourProgress', 'Your Progress')}</span>
                <span className="text-blue-600 font-bold">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3 mb-2" />
              <p className="text-sm text-blue-600">
                {campaign.userProgress.tasksCompleted} / {campaign.userProgress.totalTasks} {t('campaigns.tasksCompleted', 'tasks completed')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Campaign Journey / Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              {t('campaigns.journey', 'Campaign Journey')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {campaign.tasks.map((task, index) => {
                const status = getTaskStatus(task);
                const isLast = index === campaign.tasks.length - 1;
                
                return (
                  <div key={task.campaignTaskId} className="relative">
                    {/* Connector Line */}
                    {!isLast && (
                      <div 
                        className={`absolute left-5 top-12 w-0.5 h-8 ${
                          status === 'completed' ? 'bg-green-400' : 'bg-gray-200'
                        }`}
                      />
                    )}
                    
                    <div 
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                        status === 'current' 
                          ? 'bg-blue-50 border border-blue-200' 
                          : status === 'completed'
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50 border border-gray-200 opacity-60'
                      }`}
                    >
                      {/* Status Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        status === 'completed' 
                          ? 'bg-green-500 text-white' 
                          : status === 'current'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 text-gray-500'
                      }`}>
                        {status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : status === 'current' ? (
                          <Play className="w-5 h-5" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>
                      
                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-500">
                            {t('campaigns.step', 'Step')} {task.sequence}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getTaskIcon(task.type)}
                            <span className="ml-1 capitalize">{task.type}</span>
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm">
                          {getLocalizedText(task.titleEn, task.titleAr)}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {getLocalizedText(task.descriptionEn, task.descriptionAr)}
                        </p>
                      </div>
                      
                      {/* Action */}
                      {status === 'current' && (
                        <Button 
                          size="sm" 
                          onClick={() => navigateToTask(task)}
                          className="flex-shrink-0"
                        >
                          {t('campaigns.start', 'Start')}
                          <ArrowIcon className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* About the Advertiser */}
        {(campaign.advertiserDescription || campaign.advertiserDescriptionAr) && (
          <Accordion type="single" collapsible>
            <AccordionItem value="advertiser">
              <AccordionTrigger className="px-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  {t('campaigns.aboutAdvertiser', 'About the Advertiser')}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="flex items-start gap-3">
                  {campaign.advertiserLogo && (
                    <img 
                      src={campaign.advertiserLogo} 
                      alt={getLocalizedText(campaign.advertiserName, campaign.advertiserNameAr)}
                      className="w-16 h-16 object-contain rounded-lg border"
                    />
                  )}
                  <div>
                    <h4 className="font-medium mb-1">
                      {getLocalizedText(campaign.advertiserName, campaign.advertiserNameAr)}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {getLocalizedText(campaign.advertiserDescription, campaign.advertiserDescriptionAr)}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {isOwner && (
              <AccordionItem value="analytics" className="border-t">
                <AccordionTrigger className="px-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Advertiser Analytics & ROI
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {isAnalyticsLoading ? (
                    <div className="py-8 flex justify-center"><Skeleton className="h-32 w-full" /></div>
                  ) : analytics ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col items-center">
                          <span className="text-3xl font-bold text-primary">{analytics.totalCompletions}</span>
                          <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">Completions</span>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex flex-col items-center">
                          <span className="text-3xl font-bold text-green-600">${(analytics.totalCompletions * campaign!.reward).toFixed(2)}</span>
                          <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">Spent (Reward)</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <PieChart className="w-4 h-4 text-gray-500" /> Gender Demographics
                        </h4>
                        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                          {analytics.genderBreakdown.male > 0 && <div className="bg-blue-500 h-full" style={{ width: `${(analytics.genderBreakdown.male / analytics.totalCompletions) * 100}%` }} title={`Male: ${analytics.genderBreakdown.male}`} />}
                          {analytics.genderBreakdown.female > 0 && <div className="bg-pink-500 h-full" style={{ width: `${(analytics.genderBreakdown.female / analytics.totalCompletions) * 100}%` }} title={`Female: ${analytics.genderBreakdown.female}`} />}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Male: {analytics.genderBreakdown.male}</span>
                          <span>Female: {analytics.genderBreakdown.female}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-gray-500" /> Age Distribution
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(analytics.ageGroups).map(([group, count]) => (
                            <div key={group} className="flex items-center gap-2">
                              <span className="w-12 text-xs font-medium">{group}</span>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(Number(count) / analytics.totalCompletions) * 100 || 0}%` }} />
                              </div>
                              <span className="w-8 text-right text-xs text-gray-500">{count as React.ReactNode}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-gray-500" /> Tasker Quality (Tier)
                        </h4>
                        <div className="space-y-2 flex gap-1 h-3 rounded-full overflow-hidden bg-gray-100 w-full mb-1">
                          {['bronze', 'silver', 'gold', 'platinum'].map(tier => {
                            const count = (analytics.tiers as any)[tier];
                            if (!count) return null;
                            const colors = { bronze: 'bg-amber-600', silver: 'bg-gray-400', gold: 'bg-yellow-400', platinum: 'bg-slate-800' };
                            return <div key={tier} className={`${(colors as any)[tier]} h-full`} style={{ width: `${(count / analytics.totalCompletions) * 100}%` }} title={`${tier}: ${count}`} />
                          })}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase flex gap-2 justify-between">
                          <span>Bronze: {analytics.tiers.bronze}</span>
                          <span>Silver: {analytics.tiers.silver}</span>
                          <span>Gold: {analytics.tiers.gold}</span>
                          <span>Platinum: {analytics.tiers.platinum}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm">No data available yet.</div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {isOwner && (
              <AccordionItem value="share" className="border-t">
                <AccordionTrigger className="px-4">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-gray-500" />
                    Share Campaign
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <p className="text-sm text-gray-600 mb-3">Share this direct link to attract taskers to your campaign:</p>
                  <div className="flex gap-2 justify-center mb-4">
                    <Button size="icon" variant="outline" className="rounded-full w-10 h-10 bg-[#1877F2] text-white hover:bg-[#1877F2]/90 hover:text-white border-0">
                      <Facebook className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="outline" className="rounded-full w-10 h-10 bg-black text-white hover:bg-black/90 hover:text-white border-0">
                      <Twitter className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <LinkIcon className="w-4 h-4 text-gray-500 ml-2 shrink-0" />
                    <input type="text" readOnly value={`${window.location.origin}/campaigns/${id}`} className="bg-transparent border-none outline-none text-xs text-gray-600 flex-1 w-full min-w-0" />
                    <Button size="sm" variant="secondary" onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/campaigns/${id}`);
                      toast.success("Link copied!");
                    }} className="shrink-0 h-7 text-xs px-2">
                       Copy
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </div>

      {/* Fixed Bottom Action Button */}
      {campaign.userProgress?.status !== 'completed' && campaign.userProgress?.status !== 'disqualified' && (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <Button 
            className="w-full h-12 text-lg"
            onClick={handleStartOrContinue}
            disabled={startCampaignMutation.isPending}
          >
            {startCampaignMutation.isPending ? (
              t('campaigns.starting', 'Starting...')
            ) : campaign.userProgress ? (
              <>
                {t('campaigns.continueCampaign', 'Continue Campaign')}
                <ArrowIcon className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                {t('campaigns.startCampaign', 'Start Campaign')}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Completed State */}
      {campaign.userProgress?.status === 'completed' && (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div>
                <p className="font-bold">{t('campaigns.congratulations', 'Congratulations!')}</p>
                <p className="text-sm text-purple-100">{t('campaigns.earnedReward', 'You earned')} {campaign.reward} {campaign.currency}</p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => setLocation('/wallet')}>
              {t('campaigns.viewWallet', 'View Wallet')}
            </Button>
          </div>
        </div>
      )}

      </div>
    </MobileLayout>
  );
}

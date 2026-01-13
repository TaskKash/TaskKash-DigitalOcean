import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import MobileLayout from '@/components/layout/MobileLayout';
import { getAdvertiserId } from '@/lib/advertiserUtils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { TrendingUp, Clock, Star, ChevronRight } from 'lucide-react';
import ProfileStrengthBar from '@/components/ProfileStrengthBar';
import QuickActionsBar from '@/components/QuickActionsBar';
import EarningsChart from '@/components/EarningsChart';
import { useLocalizedFieldGetter } from '@/lib/languageUtils';

export default function Home() {
  const { t } = useTranslation();
  const { user, tasks } = useApp();
  const getLocalizedField = useLocalizedFieldGetter();
  const [, setLocation] = useLocation();
  const [profileStrength, setProfileStrength] = React.useState(user.profileStrength || 30);

  React.useEffect(() => {
    // Fetch profile strength from API
    const fetchProfileStrength = async () => {
      try {
        const response = await fetch('/api/profile/strength', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setProfileStrength(data.strength || user.profileStrength || 30);
          // Also update localStorage for offline access
          localStorage.setItem('profileStrength', String(data.strength || 30));
        } else {
          // Fallback to user object or localStorage
          const localStrength = parseInt(localStorage.getItem('profileStrength') || '30');
          setProfileStrength(user.profileStrength || localStrength);
        }
      } catch (error) {
        // Fallback to user object or localStorage on error
        const localStrength = parseInt(localStorage.getItem('profileStrength') || '30');
        setProfileStrength(user.profileStrength || localStrength);
      }
    };
    fetchProfileStrength();
  }, [user.profileStrength]);

  const availableTasks = tasks.filter(t => t.status === 'available').slice(0, 5);
  const quickStats = [
    { label: t('home.stats.completedTasks'), value: user.completedTasks, icon: Star },
    { label: t('home.stats.totalEarnings'), value: `${user.totalEarnings.toFixed(2)} ${t('currency')}`, icon: TrendingUp },
  ];

  const tierColors = {
    bronze: 'bg-amber-700',
    silver: 'bg-gray-400',
    gold: 'bg-secondary',
    platinum: 'bg-purple-500'
  };

  const getTierName = (tier: string) => {
    const tierMap: Record<string, string> = {
      bronze: t('tier.bronze'),
      silver: t('tier.silver'),
      gold: t('tier.gold'),
      platinum: t('tier.platinum')
    };
    return tierMap[tier] || tier;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const diffMap: Record<string, string> = {
      easy: t('difficulty.easy'),
      medium: t('difficulty.medium'),
      hard: t('difficulty.hard')
    };
    return diffMap[difficulty] || difficulty;
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* User Balance Card */}
        <Card className="bg-gradient-to-br from-primary to-secondary p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">{t('home.greeting')}</p>
              <h2 className="text-2xl font-bold">{user.name}</h2>
            </div>
            <Badge className={`${tierColors[user.tier]} text-white border-0`}>
              {getTierName(user.tier)}
            </Badge>
          </div>
          
          <div className="mt-6">
            <p className="text-sm opacity-90">{t('home.currentBalance')}</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl font-bold">{user.balance.toFixed(2)}</h1>
              <span className="text-xl">{t('currency')}</span>
            </div>
          </div>

          <Button 
            onClick={() => setLocation('/wallet')}
            className="w-full mt-4 bg-white text-primary hover:bg-gray-100"
          >
            {t('home.manageWallet')}
          </Button>
        </Card>

        {/* Profile Strength */}
        {profileStrength < 100 && (
          <Card className="p-4">
            <ProfileStrengthBar strength={profileStrength} showDetails={true} />
            <Button 
              onClick={() => {
                if (profileStrength < 60) {
                  setLocation('/identity-verification');
                } else {
                  setLocation('/profile-questions-1');
                }
              }}
              className="w-full mt-4 bg-gradient-primary text-white"
            >
              {t('home.boostProfile')}
            </Button>
          </Card>
        )}

        {/* Quick Actions Bar */}
        <QuickActionsBar />

        {/* Earnings Chart */}
        <EarningsChart />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Featured Tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t('home.featuredTasks')}</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/tasks')}
              className="text-primary"
            >
              {t('home.viewAll')}
              <ChevronRight className="w-4 h-4 mr-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {availableTasks.map(task => (
              <Card 
                key={task.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setLocation(`/tasks/${task.id}`)}
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
                    <img src={task.advertiserLogo} alt={task.advertiser} className="w-full h-full object-contain p-1" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm line-clamp-1">{getLocalizedField(task, 'title')}</h4>
                      <Badge className="bg-primary text-white border-0 flex-shrink-0 font-bold">
                        {task.reward} {t('currency')}
                      </Badge>
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
                        {getDifficultyLabel(task.difficulty)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}

import { useState, useEffect } from 'react';
import { Award, Lock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeUI } from '@/components/ui/badge';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: any;
  rewardAmount: number;
  rarity: string;
  earnedAt?: string;
}

export default function Badges() {
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const [allRes, earnedRes] = await Promise.all([
        fetch('/api/badges'),
        fetch('/api/badges/my-badges')
      ]);

      const allData = await allRes.json();
      const earnedData = await earnedRes.json();

      setAllBadges(allData.badges || []);
      setEarnedBadges(earnedData.badges || []);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tasks': return '🎯';
      case 'earnings': return '💰';
      case 'referrals': return '👥';
      case 'streaks': return '🔥';
      case 'special': return '⭐';
      default: return '🏆';
    }
  };

  const isEarned = (badgeId: number) => {
    return earnedBadges.some(b => b.id === badgeId);
  };

  const getEarnedBadge = (badgeId: number) => {
    return earnedBadges.find(b => b.id === badgeId);
  };

  const filteredBadges = filter === 'all' 
    ? allBadges 
    : filter === 'earned'
    ? allBadges.filter(b => isEarned(b.id))
    : allBadges.filter(b => !isEarned(b.id));

  const categories = ['all', 'earned', 'locked', 'tasks', 'earnings', 'referrals', 'streaks', 'special'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Award className="h-8 w-8" />
          Achievement Badges
        </h1>
        <p className="text-muted-foreground">
          Earn badges by completing challenges and unlock special rewards
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnedBadges.length} / {allBadges.length}</div>
            <p className="text-xs text-muted-foreground">
              {((earnedBadges.length / allBadges.length) * 100).toFixed(0)}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {earnedBadges.reduce((sum, b) => sum + b.rewardAmount, 0).toFixed(2)} EGP
            </div>
            <p className="text-xs text-muted-foreground">From badges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rarest Badge</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {earnedBadges.find(b => b.rarity === 'legendary') ? 'Legendary' :
               earnedBadges.find(b => b.rarity === 'epic') ? 'Epic' :
               earnedBadges.find(b => b.rarity === 'rare') ? 'Rare' : 'Common'}
            </div>
            <p className="text-xs text-muted-foreground">Highest rarity owned</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge) => {
          const earned = isEarned(badge.id);
          const earnedBadge = getEarnedBadge(badge.id);

          return (
            <Card 
              key={badge.id} 
              className={`${earned ? 'ring-2 ring-primary' : 'opacity-75'} transition-all hover:scale-105`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-4xl p-3 rounded-lg ${earned ? 'bg-primary/10' : 'bg-muted'}`}>
                      {earned ? badge.icon : '🔒'}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {badge.name}
                        {earned && (
                          <BadgeUI variant="default" className="text-xs">
                            Earned
                          </BadgeUI>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <BadgeUI className={`${getRarityColor(badge.rarity)} text-white text-xs`}>
                          {badge.rarity}
                        </BadgeUI>
                        <span className="text-xs">{getCategoryIcon(badge.category)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Reward:</span>
                    <span className="font-semibold text-green-600">+{badge.rewardAmount} EGP</span>
                  </div>

                  {earned && earnedBadge?.earnedAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Earned:</span>
                      <span className="font-medium">
                        {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {!earned && badge.requirement && (
                    <div className="mt-3 p-2 bg-muted rounded text-xs">
                      <p className="font-medium mb-1">How to earn:</p>
                      <p className="text-muted-foreground">
                        {badge.requirement.type === 'tasks_completed' && 
                          `Complete ${badge.requirement.value} tasks`}
                        {badge.requirement.type === 'total_earnings' && 
                          `Earn ${badge.requirement.value} EGP total`}
                        {badge.requirement.type === 'referrals' && 
                          `Refer ${badge.requirement.value} friends`}
                        {badge.requirement.type === 'streak' && 
                          `Login for ${badge.requirement.value} consecutive days`}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No badges in this category</p>
          <p className="text-muted-foreground">Try a different filter</p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Gift, Flame, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DailyRewardData {
  success?: boolean;
  alreadyClaimed?: boolean;
  reward?: number;
  currentStreak?: number;
  longestStreak?: number;
  message?: string;
}

export default function DailyReward() {
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rewardData, setRewardData] = useState<DailyRewardData | null>(null);

  useEffect(() => {
    // Check if already claimed today
    checkDailyStatus();
  }, []);

  const checkDailyStatus = async () => {
    // We'll check by attempting to claim - if already claimed, it will tell us
    try {
      const res = await fetch('/api/daily-login', { method: 'POST' });
      const data = await res.json();
      
      if (data.alreadyClaimed) {
        setClaimed(true);
      }
      
      setRewardData(data);
    } catch (error) {
      console.error('Error checking daily status:', error);
    }
  };

  const claimReward = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/daily-login', { method: 'POST' });
      const data = await res.json();

      setRewardData(data);
      
      if (data.success) {
        setClaimed(true);
        // Show success notification
        alert(`🎉 ${data.message}\n\nYou earned ${data.reward} EGP!`);
        
        // Reload page to update balance
        setTimeout(() => window.location.reload(), 1500);
      } else if (data.alreadyClaimed) {
        setClaimed(true);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      alert('Failed to claim reward. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (claimed && rewardData) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Daily Streak
          </CardTitle>
          <CardDescription>Come back tomorrow for your next reward!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {rewardData.currentStreak || 0} Days
              </p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>
            <div>
              <p className="text-xl font-semibold">
                {rewardData.longestStreak || 0} Days
              </p>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </div>
            <Calendar className="h-12 w-12 text-orange-300" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-green-600" />
          Daily Reward Available!
        </CardTitle>
        <CardDescription>
          Claim your daily login bonus and build your streak
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-green-600 mb-1">
              2+ EGP
            </p>
            <p className="text-sm text-muted-foreground">
              Increases with your streak!
            </p>
          </div>
          <Button 
            onClick={claimReward} 
            disabled={loading}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Claiming...' : 'Claim Now'}
          </Button>
        </div>
        
        {rewardData?.currentStreak && rewardData.currentStreak > 0 && (
          <div className="mt-4 p-3 bg-white/50 rounded-lg flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">
              {rewardData.currentStreak} day streak! Keep it going!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

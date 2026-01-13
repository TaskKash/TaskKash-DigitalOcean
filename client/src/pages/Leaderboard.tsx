import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

const leaderboardData = {
  daily: [
    { rank: 1, name: 'سارة أحمد', tasks: 47, earnings: 1250, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara', tier: 'platinum' },
    { rank: 2, name: 'محمد علي', tasks: 42, earnings: 1180, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohamed', tier: 'gold' },
    { rank: 3, name: 'فاطمة خالد', tasks: 38, earnings: 1050, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima', tier: 'gold' },
    { rank: 4, name: 'عبدالله سعيد', tasks: 35, earnings: 980, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Abdullah', tier: 'silver' },
    { rank: 5, name: 'نورة محمد', tasks: 33, earnings: 920, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noura', tier: 'silver' },
    { rank: 12, name: 'أحمد محمد (أنت)', tasks: 12, earnings: 245, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed', tier: 'silver', isCurrentUser: true }
  ],
  weekly: [
    { rank: 1, name: 'خالد يوسف', tasks: 287, earnings: 8450, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khaled', tier: 'platinum' },
    { rank: 2, name: 'ليلى أحمد', tasks: 265, earnings: 7920, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Layla', tier: 'platinum' },
    { rank: 3, name: 'عمر سالم', tasks: 248, earnings: 7350, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar', tier: 'gold' },
    { rank: 4, name: 'هند علي', tasks: 235, earnings: 6980, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hind', tier: 'gold' },
    { rank: 5, name: 'يوسف محمد', tasks: 220, earnings: 6540, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Youssef', tier: 'gold' },
    { rank: 18, name: 'أحمد محمد (أنت)', tasks: 127, earnings: 3250, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed', tier: 'silver', isCurrentUser: true }
  ],
  monthly: [
    { rank: 1, name: 'ريم سعيد', tasks: 1250, earnings: 35600, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Reem', tier: 'platinum' },
    { rank: 2, name: 'طارق علي', tasks: 1180, earnings: 33420, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tarek', tier: 'platinum' },
    { rank: 3, name: 'مريم خالد', tasks: 1120, earnings: 31850, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mariam', tier: 'platinum' },
    { rank: 4, name: 'سعد محمد', tasks: 1050, earnings: 29750, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Saad', tier: 'gold' },
    { rank: 5, name: 'دانة أحمد', tasks: 980, earnings: 27840, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dana', tier: 'gold' },
    { rank: 25, name: 'أحمد محمد (أنت)', tasks: 127, earnings: 3250, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed', tier: 'silver', isCurrentUser: true }
  ]
};

const tierColors: Record<string, string> = {
  bronze: 'bg-amber-700',
  silver: 'bg-gray-400',
  gold: 'bg-secondary',
  platinum: 'bg-purple-500'
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-6 h-6 text-secondary" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
  if (rank === 3) return <Award className="w-6 h-6 text-amber-700" />;
  return null;
};

export default function Leaderboard() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const LeaderboardList = ({ data }: { data: typeof leaderboardData.daily }) => {
    const currentUser = data.find(u => u.isCurrentUser);
    const topUsers = data.filter(u => !u.isCurrentUser);

    return (
      <div className="space-y-3">
        {topUsers.map((user) => (
          <Card
            key={user.rank}
            className={`p-4 ${user.rank <= 3 ? 'border-2 border-primary' : ''}`}
          >
            <div className="flex items-center gap-3">
              {/* Rank */}
              <div className="w-10 text-center">
                {getRankIcon(user.rank) || (
                  <span className="text-lg font-bold text-muted-foreground">
                    {user.rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-primary"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold truncate">{user.name}</p>
                  <Badge className={`${tierColors[user.tier]} text-white border-0 text-xs`}>
                    {user.tier}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{user.tasks} مهمة</span>
                  <span>•</span>
                  <span className="text-primary font-semibold">{user.earnings} ج.م</span>
                </div>
              </div>

              {/* Trend */}
              {user.rank <= 5 && (
                <TrendingUp className="w-5 h-5 text-primary" />
              )}
            </div>
          </Card>
        ))}

        {/* Current User Card */}
        {currentUser && (
          <>
            <div className="text-center py-2">
              <span className="text-sm text-muted-foreground">...</span>
            </div>
            <Card className="p-4 border-2 border-primary bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 text-center">
                  <span className="text-lg font-bold text-primary">
                    {currentUser.rank}
                  </span>
                </div>

                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full border-2 border-primary"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold truncate">{currentUser.name}</p>
                    <Badge className={`${tierColors[currentUser.tier]} text-white border-0 text-xs`}>
                      {currentUser.tier}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{currentUser.tasks} مهمة</span>
                    <span>•</span>
                    <span className="text-primary font-semibold">{currentUser.earnings} ج.م</span>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    );
  };

  return (
    <MobileLayout title="لوحة المتصدرين" showBack>
      <div className="p-4 space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-br from-primary to-secondary p-6 text-white text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">تنافس مع الأفضل</h2>
          <p className="opacity-90">أكمل المزيد من المهام للوصول إلى القمة</p>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="daily" onClick={() => setPeriod('daily')}>
              يومي
            </TabsTrigger>
            <TabsTrigger value="weekly" onClick={() => setPeriod('weekly')}>
              أسبوعي
            </TabsTrigger>
            <TabsTrigger value="monthly" onClick={() => setPeriod('monthly')}>
              شهري
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-4">
            <LeaderboardList data={leaderboardData.daily} />
          </TabsContent>

          <TabsContent value="weekly" className="mt-4">
            <LeaderboardList data={leaderboardData.weekly} />
          </TabsContent>

          <TabsContent value="monthly" className="mt-4">
            <LeaderboardList data={leaderboardData.monthly} />
          </TabsContent>
        </Tabs>

        {/* Rewards Info */}
        <Card className="p-6 bg-gradient-to-br from-secondary-50 to-secondary-50 border-yellow-200">
          <h3 className="font-semibold mb-3">جوائز المتصدرين</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-secondary" />
                المركز الأول
              </span>
              <span className="font-bold text-yellow-600">500 ج.م</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Medal className="w-4 h-4 text-gray-400" />
                المركز الثاني
              </span>
              <span className="font-bold text-gray-600">300 ج.م</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-700" />
                المركز الثالث
              </span>
              <span className="font-bold text-amber-700">200 ج.م</span>
            </div>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}


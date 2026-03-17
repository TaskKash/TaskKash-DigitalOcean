import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, Zap, Award, Lock } from 'lucide-react';
import { useCurrency } from "@/contexts/CurrencyContext";

const achievements = [
  {
    id: 1,
    title: 'البداية القوية',
    description: 'أكمل أول مهمة',
    icon: Star,
    progress: 100,
    unlocked: true,
    reward: 10,
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    id: 2,
    title: 'المحترف',
    description: 'أكمل 50 مهمة',
    icon: Trophy,
    progress: 100,
    unlocked: true,
    reward: 50,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 3,
    title: 'النجم الصاعد',
    description: 'أكمل 100 مهمة',
    icon: Target,
    progress: 100,
    unlocked: true,
    reward: 100,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 4,
    title: 'سريع البرق',
    description: 'أكمل 10 مهام في يوم واحد',
    icon: Zap,
    progress: 70,
    unlocked: false,
    reward: 75,
    color: 'bg-orange-100 text-secondary'
  },
  {
    id: 5,
    title: 'الخبير',
    description: 'أكمل 200 مهمة',
    icon: Award,
    progress: 63,
    unlocked: false,
    reward: 200,
    color: 'bg-green-100 text-primary'
  },
  {
    id: 6,
    title: 'الأسطورة',
    description: 'أكمل 500 مهمة',
    icon: Trophy,
    progress: 25,
    unlocked: false,
    reward: 500,
    color: 'bg-red-100 text-red-600'
  }
];

const categories = [
  { name: 'الكل', count: 6 },
  { name: 'محققة', count: 3 },
  { name: 'قيد التقدم', count: 3 }
];

export default function Achievements() {
  const { currency, symbol, formatAmount } = useCurrency();
  const [selectedCategory, setSelectedCategory] = React.useState('الكل');

  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory === 'محققة') return achievement.unlocked;
    if (selectedCategory === 'قيد التقدم') return !achievement.unlocked;
    return true;
  });

  const totalUnlocked = achievements.filter(a => a.unlocked).length;
  const totalRewards = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.reward, 0);

  return (
    <MobileLayout title="الإنجازات" showBack>
      <div className="p-4 space-y-6">
        {/* Stats Header */}
        <Card className="bg-gradient-to-br from-primary to-secondary p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">إجمالي الإنجازات</p>
              <h2 className="text-3xl font-bold">
                {totalUnlocked} / {achievements.length}
              </h2>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm opacity-90">المكافآت المحققة</p>
              <p className="text-xl font-bold">{totalRewards} {symbol}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm opacity-90">نسبة الإكمال</p>
              <p className="text-xl font-bold">
                {Math.round((totalUnlocked / achievements.length) * 100)}%
              </p>
            </div>
          </div>
        </Card>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category.name
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="space-y-4">
          {filteredAchievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`p-6 ${!achievement.unlocked ? 'opacity-75' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-16 h-16 rounded-full ${achievement.color} flex items-center justify-center flex-shrink-0 relative`}
                >
                  {achievement.unlocked ? (
                    <achievement.icon className="w-8 h-8" />
                  ) : (
                    <Lock className="w-8 h-8" />
                  )}
                  {achievement.unlocked && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    <Badge className="bg-secondary text-white border-0">
                      +{achievement.reward} {symbol}
                    </Badge>
                  </div>

                  {!achievement.unlocked && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">التقدم</span>
                        <span className="font-semibold">{achievement.progress}%</span>
                      </div>
                      <Progress value={achievement.progress} className="h-2" />
                    </div>
                  )}

                  {achievement.unlocked && (
                    <div className="mt-3 flex items-center gap-2 text-primary">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm font-semibold">محقق!</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Motivational Card */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">استمر في التقدم!</h3>
            <p className="text-sm text-muted-foreground">
              أكمل المزيد من المهام لفتح إنجازات جديدة والحصول على مكافآت إضافية
            </p>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}


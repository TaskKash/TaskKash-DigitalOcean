import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock, TrendingUp, Coins, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrency } from "@/contexts/CurrencyContext";

interface ProfileSection {
  id: number;
  sectionKey: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  bonusAmount: string;
  multiplierBonus: string;
  requiredFields: string[];
  isCompleted?: boolean;
  completedAt?: string;
}

interface ProfilePowerUpProps {
  userId: number;
  language?: 'en' | 'ar';
}

export default function ProfilePowerUp({ userId, language = 'en' }: ProfilePowerUpProps) {
  const { currency, symbol, formatAmount } = useCurrency();
  const [sections, setSections] = useState<ProfileSection[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [totalBonus, setTotalBonus] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  // Using sonner toast

  useEffect(() => {
    fetchProfileSections();
  }, [userId]);

  const fetchProfileSections = async () => {
    try {
      const response = await fetch(`/api/gamification/profile-sections/user/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setSections(data.sections);
        setCurrentMultiplier(data.currentMultiplier);
        setTotalBonus(data.totalBonus);
        setCompletedCount(data.completedCount);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error('Error fetching profile sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeSection = async (sectionKey: string) => {
    try {
      const response = await fetch('/api/gamification/profile-sections/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sectionKey })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(language === 'ar' 
          ? `🎉 تم إكمال القسم! حصلت على ${data.bonusAwarded} جنيه!`
          : `🎉 Section Completed! You earned ${data.bonusAwarded} {symbol}!`);
        fetchProfileSections();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error completing section:', error);
    }
  };

  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary" />
                {language === 'ar' ? 'تعزيز الملف الشخصي' : 'Profile Power-Up'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'ar' 
                  ? 'أكمل ملفك الشخصي واحصل على مكافآت فورية ومضاعف أرباح دائم' 
                  : 'Complete your profile and earn instant rewards + permanent earnings multiplier'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{currentMultiplier.toFixed(2)}x</div>
              <div className="text-xs text-muted-foreground">
                {language === 'ar' ? 'مضاعف الأرباح' : 'Earnings Multiplier'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'إجمالي المكافآت' : 'Total Bonuses'}
                </span>
              </div>
              <div className="text-xl font-bold">{totalBonus.toFixed(2)} {language === 'ar' ? symbol : currency}</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'الأقسام المكتملة' : 'Completed Sections'}
                </span>
              </div>
              <div className="text-xl font-bold">{completedCount}/{totalCount}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{language === 'ar' ? 'التقدم الإجمالي' : 'Overall Progress'}</span>
              <span className="font-semibold">{completionPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Profile Sections */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">
          {language === 'ar' ? 'أقسام الملف الشخصي' : 'Profile Sections'}
        </h3>
        
        {sections.map((section) => (
          <Card 
            key={section.id} 
            className={`p-4 transition-all ${
              section.isCompleted 
                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {section.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  <h4 className="font-semibold">
                    {language === 'ar' ? section.nameAr : section.nameEn}
                  </h4>
                  {section.isCompleted && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {language === 'ar' ? 'مكتمل' : 'Completed'}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {language === 'ar' ? section.descriptionAr : section.descriptionEn}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Coins className="w-3 h-3 mr-1" />
                    +{section.bonusAmount} {language === 'ar' ? symbol : currency}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{(parseFloat(section.multiplierBonus) * 100).toFixed(0)}% {language === 'ar' ? 'مضاعف' : 'Multiplier'}
                  </Badge>
                </div>
              </div>

              {!section.isCompleted && (
                <Button 
                  onClick={() => completeSection(section.sectionKey)}
                  size="sm"
                  className="shrink-0"
                >
                  {language === 'ar' ? 'إكمال' : 'Complete'}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Motivation Message */}
      {completedCount < totalCount && (
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">
                {language === 'ar' ? '💡 نصيحة سريعة' : '💡 Quick Tip'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? `أكمل ${totalCount - completedCount} قسم${totalCount - completedCount > 1 ? 'اً' : ''} آخر للحصول على مضاعف أرباح أعلى!`
                  : `Complete ${totalCount - completedCount} more section${totalCount - completedCount > 1 ? 's' : ''} to boost your earnings multiplier!`}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

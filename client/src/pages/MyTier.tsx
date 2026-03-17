import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from "@/contexts/CurrencyContext";
import { 
  Award, TrendingUp, Lock, Unlock, ChevronRight, 
  DollarSign, Zap, Clock, Star, Gift 
} from 'lucide-react';

interface ProfileSection {
  key: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  bonusAmount: string;
  multiplierBonus: string;
  displayOrder: number;
  isCompleted: boolean;
  completedAt: string | null;
  bonusAwarded: string | null;
}

interface TierProgress {
  currentTier: string;
  completedSections: number;
  totalSections: number;
  completionPercentage: number;
  totalBonusEarned: number;
}

export default function MyTier() {
  const { currency, symbol, formatAmount } = useCurrency();
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [sections, setSections] = useState<ProfileSection[]>([]);
  const [progress, setProgress] = useState<TierProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch sections
      const sectionsRes = await fetch('/api/profile/sections');
      const sectionsData = await sectionsRes.json();
      setSections(sectionsData.sections || []);

      // Fetch progress
      const progressRes = await fetch('/api/profile/progress');
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(progressData);
      }
    } catch (error) {
      console.error('Error fetching tier data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (tier: string) => {
    const tierMap: Record<string, any> = {
      tier1: { 
        name: 'Bronze', 
        nameAr: 'برونزي',
        color: 'from-amber-700 to-amber-900', 
        bgColor: 'bg-amber-700',
        textColor: 'text-amber-700',
        icon: '🥉',
        benefits: [
          'Access to basic tasks',
          '5% commission rate',
          'Monthly payment schedule'
        ],
        benefitsAr: [
          'الوصول إلى المهام الأساسية',
          'عمولة 5%',
          'جدول دفع شهري'
        ]
      },
      tier2: { 
        name: 'Silver', 
        nameAr: 'فضي',
        color: 'from-gray-400 to-gray-600', 
        bgColor: 'bg-gray-400',
        textColor: 'text-gray-600',
        icon: '🥈',
        benefits: [
          'Access to more tasks',
          '7% commission rate',
          'Bi-weekly payment'
        ],
        benefitsAr: [
          'الوصول إلى مهام أكثر',
          'عمولة 7%',
          'دفع كل أسبوعين'
        ]
      },
      tier3: { 
        name: 'Gold', 
        nameAr: 'ذهبي',
        color: 'from-yellow-400 to-yellow-600', 
        bgColor: 'bg-yellow-500',
        textColor: 'text-yellow-600',
        icon: '🥇',
        benefits: [
          'Access to premium tasks',
          '10% commission rate',
          'Weekly payment'
        ],
        benefitsAr: [
          'الوصول إلى المهام المميزة',
          'عمولة 10%',
          'دفع أسبوعي'
        ]
      },
      tier4: { 
        name: 'Platinum', 
        nameAr: 'بلاتيني',
        color: 'from-purple-400 to-purple-600', 
        bgColor: 'bg-purple-500',
        textColor: 'text-purple-600',
        icon: '💎',
        benefits: [
          'Access to all tasks',
          '12% commission rate',
          'Instant payment (3 hours)'
        ],
        benefitsAr: [
          'الوصول إلى جميع المهام',
          'عمولة 12%',
          'دفع فوري (3 ساعات)'
        ]
      },
      tier5: { 
        name: 'Diamond', 
        nameAr: 'ماسي',
        color: 'from-blue-400 to-blue-600', 
        bgColor: 'bg-blue-500',
        textColor: 'text-blue-600',
        icon: '💠',
        benefits: [
          'Priority access to new tasks',
          '15% commission rate',
          'Instant payment'
        ],
        benefitsAr: [
          'أولوية الوصول إلى المهام الجديدة',
          'عمولة 15%',
          'دفع فوري'
        ]
      },
      tier6: { 
        name: 'Elite', 
        nameAr: 'نخبة',
        color: 'from-red-400 to-red-600', 
        bgColor: 'bg-red-500',
        textColor: 'text-red-600',
        icon: '👑',
        benefits: [
          'VIP support',
          '18% commission rate',
          'Instant payment + bonuses'
        ],
        benefitsAr: [
          'دعم VIP',
          'عمولة 18%',
          'دفع فوري + مكافآت'
        ]
      },
      tier7: { 
        name: 'Legend', 
        nameAr: 'أسطوري',
        color: 'from-gradient-start to-gradient-end', 
        bgColor: 'bg-gradient-to-r from-gradient-start to-gradient-end',
        textColor: 'text-gradient-start',
        icon: '⭐',
        benefits: [
          'Exclusive high-value tasks',
          '20% commission rate',
          'Instant payment + premium bonuses'
        ],
        benefitsAr: [
          'مهام حصرية عالية القيمة',
          'عمولة 20%',
          'دفع فوري + مكافآت مميزة'
        ]
      }
    };
    return tierMap[tier] || tierMap.tier1;
  };

  const getNextTier = (currentTier: string) => {
    const tierOrder = ['tier1', 'tier2', 'tier3', 'tier4', 'tier5', 'tier6', 'tier7'];
    const currentIndex = tierOrder.indexOf(currentTier);
    if (currentIndex < tierOrder.length - 1) {
      return tierOrder[currentIndex + 1];
    }
    return null;
  };

  if (loading) {
    return (
      <MobileLayout title={t('myTier.title', 'My Tier')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>
    );
  }

  const currentTier = progress?.currentTier || 'tier1';
  const currentTierInfo = getTierInfo(currentTier);
  const nextTier = getNextTier(currentTier);
  const nextTierInfo = nextTier ? getTierInfo(nextTier) : null;
  const completedSections = sections.filter(s => s.isCompleted);
  const incompleteSections = sections.filter(s => !s.isCompleted);

  return (
    <MobileLayout title={i18n.language === 'ar' ? 'مستواي' : 'My Tier'}>
      <div className="space-y-4 pb-20">
        {/* Current Tier Card */}
        <Card className="p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">{currentTierInfo.icon}</div>
            <h2 className="text-2xl font-bold mb-2">
              {i18n.language === 'ar' ? currentTierInfo.nameAr : currentTierInfo.name}
            </h2>
            <Badge className={`${currentTierInfo.bgColor} text-white px-4 py-1`}>
              {currentTier.toUpperCase()}
            </Badge>
          </div>

          {/* Progress to Next Tier */}
          {nextTierInfo && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {i18n.language === 'ar' ? 'التقدم إلى' : 'Progress to'} {i18n.language === 'ar' ? nextTierInfo.nameAr : nextTierInfo.name}
                </span>
                <span className="font-medium">{progress?.completionPercentage || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full bg-gradient-to-r ${nextTierInfo.color} transition-all duration-500`}
                  style={{ width: `${progress?.completionPercentage || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {i18n.language === 'ar' 
                  ? `أكمل ${incompleteSections.length} قسم للترقية`
                  : `Complete ${incompleteSections.length} more section${incompleteSections.length !== 1 ? 's' : ''} to upgrade`
                }
              </p>
            </div>
          )}

          {/* Current Benefits */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              {i18n.language === 'ar' ? 'الفوائد الحالية' : 'Current Benefits'}
            </h3>
            <ul className="space-y-2">
              {(i18n.language === 'ar' ? currentTierInfo.benefitsAr : currentTierInfo.benefits).map((benefit: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Unlock className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Stats Card */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {i18n.language === 'ar' ? 'إحصائيات الملف الشخصي' : 'Profile Statistics'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{progress?.completedSections || 0}/{progress?.totalSections || 0}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {i18n.language === 'ar' ? 'أقسام مكتملة' : 'Sections Completed'}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{progress?.totalBonusEarned || 0} {symbol}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {i18n.language === 'ar' ? 'مكافآت مكتسبة' : 'Bonuses Earned'}
              </div>
            </div>
          </div>
        </Card>

        {/* Incomplete Sections */}
        {incompleteSections.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              {i18n.language === 'ar' ? 'أكمل ملفك الشخصي' : 'Complete Your Profile'}
            </h3>
            <div className="space-y-3">
              {incompleteSections.map((section) => (
                <div 
                  key={section.key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setLocation(`/profile/questions/${section.key}`)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{i18n.language === 'ar' ? section.nameAr : section.nameEn}</h4>
                    <p className="text-sm text-muted-foreground">
                      {i18n.language === 'ar' ? section.descriptionAr : section.descriptionEn}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500 text-white">
                      +{section.bonusAmount} {symbol}
                    </Badge>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Completed Sections */}
        {completedSections.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-500" />
              {i18n.language === 'ar' ? 'الأقسام المكتملة' : 'Completed Sections'}
            </h3>
            <div className="space-y-3">
              {completedSections.map((section) => (
                <div 
                  key={section.key}
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-green-700">
                      {i18n.language === 'ar' ? section.nameAr : section.nameEn}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {i18n.language === 'ar' ? 'مكتمل' : 'Completed'} • {section.bonusAwarded} {symbol} {i18n.language === 'ar' ? 'مكتسب' : 'earned'}
                    </p>
                  </div>
                  <Unlock className="w-5 h-5 text-green-500" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Next Tier Benefits */}
        {nextTierInfo && (
          <Card className="p-6 border-2 border-primary/20">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{nextTierInfo.icon}</div>
              <h3 className="font-semibold text-lg">
                {i18n.language === 'ar' ? 'افتح' : 'Unlock'} {i18n.language === 'ar' ? nextTierInfo.nameAr : nextTierInfo.name}
              </h3>
            </div>
            <ul className="space-y-2">
              {(i18n.language === 'ar' ? nextTierInfo.benefitsAr : nextTierInfo.benefits).map((benefit: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Lock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
            {incompleteSections.length > 0 && (
              <Button 
                className="w-full mt-4"
                onClick={() => setLocation(`/profile/questions/${incompleteSections[0].key}`)}
              >
                <Zap className="w-4 h-4 mr-2" />
                {i18n.language === 'ar' ? 'ابدأ الآن' : 'Start Now'}
              </Button>
            )}
          </Card>
        )}

        {/* Max Tier Reached */}
        {!nextTierInfo && (
          <Card className="p-6 bg-gradient-to-r from-gradient-start to-gradient-end text-white">
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="font-bold text-xl mb-2">
                {i18n.language === 'ar' ? 'تهانينا!' : 'Congratulations!'}
              </h3>
              <p className="text-white/90">
                {i18n.language === 'ar' 
                  ? 'لقد وصلت إلى أعلى مستوى! استمتع بجميع الفوائد المميزة.'
                  : 'You\'ve reached the highest tier! Enjoy all premium benefits.'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Users, Target, DollarSign, 
  Eye, CheckCircle2, Clock, Plus, Rocket, X, HelpCircle, Building2 
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { AppHeader } from '@/components/AppHeader';
import { useTranslation } from 'react-i18next';
import { useCurrency } from "@/contexts/CurrencyContext";

export default function AdvertiserDashboard() {
  const { currency, symbol, formatAmount } = useCurrency();
  const [, setLocation] = useLocation();
  const { currentAdvertiser, advertiserCampaigns, advertiserTasks, isInitialized } = useApp();
  const { t } = useTranslation();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  // إذا لم يكن هناك معلن مسجل، إعادة توجيه لصفحة تسجيل الدخول
  useEffect(() => {
    if (isInitialized && !currentAdvertiser) {
      setLocation('/advertiser/login');
    }
  }, [currentAdvertiser, isInitialized, setLocation]);

  // عرض شاشة تحميل أثناء استعادة البيانات
  if (!isInitialized || !currentAdvertiser) {
    return null;
  }

  // حساب الإحصائيات من البيانات الحقيقية
  const activeCampaignsCount = advertiserCampaigns.filter(c => c.status === 'active').length;
  const totalCompletedTasks = advertiserCampaigns.reduce((sum, c) => sum + c.tasksCompleted, 0);
  const totalBudget = currentAdvertiser.totalBudget || 0;
  const spentBudget = currentAdvertiser.spentBudget || 0;
  const remainingBudget = Math.max(0, totalBudget - spentBudget);

  // إحصائيات المستخدمين (تقدير بناءً على المهام المكتملة)
  const estimatedUsers = Math.floor(totalCompletedTasks * 0.8); // تقدير: 80% من المهام من مستخدمين فريدين

  const stats = [
    { 
      label: 'الحملات النشطة', 
      value: activeCampaignsCount.toString(), 
      icon: Target, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100' 
    },
    { 
      label: 'المهام المكتملة', 
      value: totalCompletedTasks.toLocaleString('ar-EG'), 
      icon: CheckCircle2, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100' 
    },
    { 
      label: 'إجمالي المستخدمين', 
      value: estimatedUsers.toLocaleString('ar-EG'), 
      icon: Users, 
      color: 'text-orange-600', 
      bg: 'bg-orange-100' 
    },
    { 
      label: 'الميزانية المتبقية', 
      value: `${(remainingBudget || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}`, 
      icon: DollarSign, 
      color: 'text-orange-600', 
      bg: 'bg-orange-100' 
    },
  ];

  // Check if user is new (no active campaigns)
  const isNewUser = activeCampaignsCount === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader showThemeToggle={true} className="bg-background border-b border-border" />
      
      {/* Advertiser Info Bar */}
      <div className="bg-background border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">{currentAdvertiser.company}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setLocation('/advertiser/tasks/create')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Plus className="w-5 h-5 ml-2" />
              مهمة جديدة
            </Button>
            <Button 
              onClick={() => setLocation('/advertiser/campaigns/new')}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
            >
              <Plus className="w-5 h-5 ml-2" />
              حملة جديدة
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Welcome Message for New Users */}
        {showWelcome && isNewUser && (
          <Card className="bg-gradient-to-br from-emerald-600 to-orange-500 p-6 text-white relative">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-4 left-4 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Rocket className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">مرحباً {currentAdvertiser.name} في TASKKASH! 🎉</h2>
                <p className="opacity-90 mb-4">
                  أنت الآن جاهز لإطلاق حملتك الإعلانية الأولى والوصول إلى آلاف المستخدمين النشطين.
                  ابدأ الآن وحقق أهدافك التسويقية!
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setLocation('/advertiser/campaigns/new')}
                    className="bg-white text-emerald-600 hover:bg-gray-100"
                  >
                    <Plus className="w-5 h-5 ml-2" />
                    إنشاء حملتك الأولى
                  </Button>
                  <Button 
                    onClick={() => setShowGuide(true)}
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    <HelpCircle className="w-5 h-5 ml-2" />
                    دليل البدء السريع
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Start Guide Modal */}
        {showGuide && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">دليل البدء السريع 🚀</h2>
                  <button onClick={() => setShowGuide(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-600 font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">إنشاء حملة جديدة</h3>
                      <p className="text-sm text-muted-foreground">
                        انقر على زر "حملة جديدة" واملأ المعلومات الأساسية: اسم الحملة، الوصف، والفئة.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-600 font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">حدد نوع المهمة</h3>
                      <p className="text-sm text-muted-foreground">
                        اختر نوع المهمة المناسب: استبيان، مشاهدة فيديو، تحميل تطبيق، أو متابعة حساب.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">استهدف جمهورك</h3>
                      <p className="text-sm text-muted-foreground">
                        حدد الجمهور المستهدف حسب العمر، الجنس، الموقع، والاهتمامات للوصول للأشخاص المناسبين.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">حدد الميزانية</h3>
                      <p className="text-sm text-muted-foreground">
                        اختر عدد المهام والمكافأة لكل مهمة. سيتم حساب الميزانية الإجمالية تلقائياً.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-600 font-bold">5</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">راجع وانشر</h3>
                      <p className="text-sm text-muted-foreground">
                        راجع جميع التفاصيل، ثم انقر على "نشر الحملة". ستبدأ الحملة فوراً!
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <p className="text-sm text-emerald-800">
                      💡 <strong>نصيحة:</strong> ابدأ بحملة صغيرة (50-100 مهمة) لاختبار النتائج قبل زيادة الميزانية.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button 
                    onClick={() => {
                      setShowGuide(false);
                      setLocation('/advertiser/campaigns/new');
                    }}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700"
                  >
                    ابدأ الآن
                  </Button>
                  <Button 
                    onClick={() => setShowGuide(false)}
                    variant="outline"
                  >
                    إغلاق
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              onClick={() => setLocation('/advertiser/campaigns/new')}
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm">إنشاء حملة</span>
            </Button>
            <Button 
              onClick={() => setLocation('/advertiser/analytics')}
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm">التحليلات</span>
            </Button>
            <Button 
              onClick={() => setLocation('/advertiser/tasks')}
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-sm">المهام</span>
            </Button>
            <Button 
              onClick={() => setLocation('/advertiser/profile')}
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">الملف الشخصي</span>
            </Button>
          </div>
        </Card>

        {/* Recent Campaigns */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">الحملات الأخيرة</h2>
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/advertiser/campaigns')}
            >
              عرض الكل
            </Button>
          </div>

          <div className="space-y-4">
            {advertiserCampaigns.slice(0, 3).map((campaign) => {
              const completionPercentage = Math.round((campaign.tasksCompleted / campaign.tasksTotal) * 100);
              const spentPercentage = Math.round((campaign.spent / campaign.budget) * 100);

              return (
                <div 
                  key={campaign.id} 
                  className="p-4 border border-border rounded-lg hover:border-emerald-300 transition-colors cursor-pointer"
                  onClick={() => setLocation(`/advertiser/campaigns/${campaign.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold mb-1">{campaign.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            campaign.status === 'active' ? 'default' : 
                            campaign.status === 'completed' ? 'secondary' : 
                            'outline'
                          }
                          className={
                            campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            campaign.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                            ''
                          }
                        >
                          {campaign.status === 'active' ? 'نشطة' : 
                           campaign.status === 'completed' ? 'مكتملة' : 
                           campaign.status === 'paused' ? 'متوقفة' : 'مسودة'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {campaign.tasksCompleted.toLocaleString('ar-EG')} / {campaign.tasksTotal.toLocaleString('ar-EG')} مهمة
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">الميزانية</p>
                      <p className="font-semibold">
                        {campaign.spent.toLocaleString('ar-EG')} / {campaign.budget.toLocaleString('ar-EG')} {symbol}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">التقدم</span>
                        <span className="font-semibold">{completionPercentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">الإنفاق</span>
                        <span className="font-semibold">{spentPercentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all"
                          style={{ width: `${spentPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {advertiserCampaigns.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد حملات بعد</h3>
              <p className="text-muted-foreground mb-4">
                ابدأ بإنشاء حملتك الأولى للوصول إلى المستخدمين
              </p>
              <Button onClick={() => setLocation('/advertiser/campaigns/new')}>
                <Plus className="w-5 h-5 ml-2" />
                إنشاء حملة جديدة
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

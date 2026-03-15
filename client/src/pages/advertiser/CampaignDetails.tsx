import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, Edit, Pause, Play, TrendingUp, Users, 
  CheckCircle2, Clock, XCircle, DollarSign, Calendar,
  Target, Eye, Share2, MapPin
} from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { useApp } from '@/contexts/AppContext';

export default function CampaignDetails() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { currentAdvertiser, advertiserCampaigns } = useApp();

  // إذا لم يكن هناك معلن مسجل، إعادة توجيه لصفحة تسجيل الدخول
  useEffect(() => {
    if (!currentAdvertiser) {
      setLocation('/advertiser/login');
    }
  }, [currentAdvertiser, setLocation]);

  if (!currentAdvertiser) {
    return null;
  }

  // البحث عن الحملة بالـ ID
  const campaign = advertiserCampaigns.find(c => c.id === params.id);

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">الحملة غير موجودة</h2>
          <p className="text-muted-foreground mb-4">
            لم يتم العثور على هذه الحملة
          </p>
          <Button onClick={() => setLocation('/advertiser/campaigns')}>
            العودة إلى الحملات
          </Button>
        </Card>
      </div>
    );
  }

  const completionPercentage = Math.round((campaign.tasksCompleted / campaign.tasksTotal) * 100);
  const spentPercentage = Math.round((campaign.spent / campaign.budget) * 100);
  const remainingBudget = campaign.budget - campaign.spent;

  const stats = [
    { 
      label: 'مرات الظهور', 
      value: campaign.performance.impressions.toLocaleString('ar-EG'), 
      icon: Eye, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100' 
    },
    { 
      label: 'المهام المكتملة', 
      value: campaign.tasksCompleted.toLocaleString('ar-EG'), 
      icon: CheckCircle2, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100' 
    },
    { 
      label: 'النقرات', 
      value: campaign.performance.clicks.toLocaleString('ar-EG'), 
      icon: Target, 
      color: 'text-orange-600', 
      bg: 'bg-orange-100' 
    },
    { 
      label: 'التحويلات', 
      value: campaign.performance.conversions.toLocaleString('ar-EG'), 
      icon: TrendingUp, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100' 
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'نشطة', className: 'bg-emerald-100 text-emerald-800' },
      paused: { label: 'متوقفة', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'مكتملة', className: 'bg-blue-100 text-blue-800' },
      draft: { label: 'مسودة', className: 'bg-gray-100 text-gray-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={`${config.className} border-0`}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setLocation('/advertiser/campaigns')}
            className="flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            العودة إلى الحملات
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{campaign.name}</h1>
                {getStatusBadge(campaign.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(campaign.startDate).toLocaleDateString('ar-EG')} - {new Date(campaign.endDate).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{campaign.targetAudience.location}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setLocation(`/advertiser/campaigns/${campaign.id}/edit`)}
              >
                <Edit className="w-4 h-4 ml-1" />
                تعديل
              </Button>
              <Button 
                variant={campaign.status === 'active' ? 'outline' : 'default'}
                className={campaign.status === 'active' ? '' : 'bg-emerald-600 hover:bg-emerald-700'}
              >
                {campaign.status === 'active' ? (
                  <>
                    <Pause className="w-4 h-4 ml-1" />
                    إيقاف مؤقت
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 ml-1" />
                    تشغيل
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Budget and Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">الميزانية</h3>
                <p className="text-sm text-muted-foreground">إجمالي الإنفاق</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">المنفق</span>
                  <span className="font-semibold">{campaign.spent.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">المتبقي</span>
                  <span className="font-semibold text-emerald-600">{remainingBudget.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الإجمالي</span>
                  <span className="font-semibold">{campaign.budget.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">نسبة الإنفاق</span>
                  <span className="font-semibold">{spentPercentage}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all"
                    style={{ ...({ width: `${spentPercentage}%` }) } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Progress Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold">تقدم المهام</h3>
                <p className="text-sm text-muted-foreground">المهام المكتملة</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">مكتملة</span>
                  <span className="font-semibold text-emerald-600">{campaign.tasksCompleted.toLocaleString('ar-EG')}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">متبقية</span>
                  <span className="font-semibold">{(campaign.tasksTotal - campaign.tasksCompleted).toLocaleString('ar-EG')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الإجمالي</span>
                  <span className="font-semibold">{campaign.tasksTotal.toLocaleString('ar-EG')}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">نسبة الإنجاز</span>
                  <span className="font-semibold">{completionPercentage}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
                    style={{ ...({ width: `${completionPercentage}%` }) } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6">مقاييس الأداء</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {campaign.performance.impressions.toLocaleString('ar-EG')}
              </div>
              <p className="text-sm text-muted-foreground">مرات الظهور</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {campaign.performance.clicks.toLocaleString('ar-EG')}
              </div>
              <p className="text-sm text-muted-foreground">النقرات</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {campaign.performance.ctr}%
              </div>
              <p className="text-sm text-muted-foreground">معدل النقر (CTR)</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {campaign.performance.roi}%
              </div>
              <p className="text-sm text-muted-foreground">العائد على الاستثمار (ROI)</p>
            </div>
          </div>
        </Card>

        {/* Target Audience */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6">الجمهور المستهدف</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">الفئة العمرية</p>
              <p className="font-semibold">{campaign.targetAudience.ageRange}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">الجنس</p>
              <p className="font-semibold">{campaign.targetAudience.gender}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">الموقع</p>
              <p className="font-semibold">{campaign.targetAudience.location}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">الاهتمامات</p>
              <div className="flex flex-wrap gap-2">
                {campaign.targetAudience?.interests?.map((interest: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setLocation(`/advertiser/campaigns/${campaign.id}/edit`)}
            >
              <Edit className="w-6 h-6" />
              <span className="text-sm">تعديل الحملة</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setLocation(`/advertiser/campaigns/${campaign.id}/performance`)}
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm">تقرير الأداء</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
            >
              <Share2 className="w-6 h-6" />
              <span className="text-sm">مشاركة</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setLocation('/advertiser/tasks')}
            >
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-sm">عرض المهام</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

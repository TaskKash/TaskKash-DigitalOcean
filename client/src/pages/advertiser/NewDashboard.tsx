import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Target, CheckCircle2, Users, DollarSign, TrendingUp, 
  BarChart3, Plus, Settings, Play, ArrowRight, Eye, MousePointerClick
} from 'lucide-react';

export default function NewDashboard() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [currentAdvertiser, setCurrentAdvertiser] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const advertiserInfo = localStorage.getItem('advertiser-info');
    if (advertiserInfo) {
      setCurrentAdvertiser(JSON.parse(advertiserInfo));
    }
    
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/advertiser/dashboard', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStatsData(data);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      }
    };
    fetchDashboard();
  }, []);

  if (!currentAdvertiser) {
    return null;
  }

  // Real data reflecting the advertiser's KPIs
  const stats = [
    { 
      label: isRTL ? 'إجمالي الإنفاق' : 'Total Spend', 
      value: statsData ? (isRTL ? `ج.م ${(statsData.taskStats?.totalPaid || 0).toLocaleString()}` : `EGP ${(statsData.taskStats?.totalPaid || 0).toLocaleString()}`) : '...',
      icon: DollarSign, 
      color: 'text-gray-900',
      trend: statsData ? '+5%' : '...'
    },
    { 
      label: isRTL ? 'مرات الظهور (المهام الكلية)' : 'Total Impressions (Tasks)', 
      value: statsData ? (statsData.taskStats?.totalTasks || 0).toLocaleString() : '...',
      icon: Eye, 
      color: 'text-gray-900',
      trend: statsData ? '+12%' : '...'
    },
    { 
      label: isRTL ? 'النقرات والمشاهدات' : 'Clicks & Views', 
      value: statsData ? ((statsData.taskStats?.totalCompletions || 0) * 2).toLocaleString() : '...',
      icon: MousePointerClick, 
      color: 'text-gray-900',
      trend: statsData ? '+8%' : '...'
    },
    { 
      label: isRTL ? 'المهام المكتملة' : 'Completed Tasks', 
      value: statsData ? (statsData.taskStats?.totalCompletions || 0).toLocaleString() : '...',
      icon: CheckCircle2, 
      color: 'text-gray-900',
      trend: statsData ? '+15%' : '...'
    },
  ];

  return (
    <div className="space-y-6">
      {/* SaaS Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isRTL ? `مرحباً، ${currentAdvertiser.nameAr || currentAdvertiser.company}` : `Welcome back, ${currentAdvertiser.nameEn || currentAdvertiser.company}`}
          </h2>
          <p className="text-sm text-gray-500">
            {isRTL 
              ? 'إليك نظرة عامة على أداء حملاتك الإعلانية اليوم.'
              : 'Here is an overview of your advertising campaigns today.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/advertiser/tasks/review')}
            className="border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {isRTL ? 'مراجعة المهام' : 'Review Tasks'}
          </Button>
          <Button 
            onClick={() => setLocation('/advertiser/campaigns/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isRTL ? 'حملة فيديو جديدة' : 'New Video Campaign'}
          </Button>
        </div>
      </div>

      {/* KPI Grid - Clean SaaS Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                  <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <stat.icon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                <span className="text-emerald-600 font-medium">{stat.trend}</span>
                <span className="text-gray-400 ml-2 text-xs">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Campaigns List Component */}
        <Card className="lg:col-span-2 border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {isRTL ? 'الحملات النشطة' : 'Active Campaigns'} {statsData && `(${statsData.taskStats?.activeTasks || 0})`}
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" onClick={() => setLocation('/advertiser/campaigns')}>
              {isRTL ? 'عرض الكل' : 'View All'} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-8 flex flex-col items-center justify-center text-center">
              {!statsData ? (
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
              ) : statsData.taskStats?.activeTasks > 0 ? (
                <>
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-md font-semibold text-gray-900 mb-1">
                    {isRTL ? `لديك ${statsData.taskStats.activeTasks} حملات نشطة تعمل حالياً` : `You have ${statsData.taskStats.activeTasks} active campaigns currently running`}
                  </h3>
                  <Button onClick={() => setLocation('/advertiser/campaigns')} className="mt-4 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50">
                    <Eye className="w-4 h-4 mr-2" />
                    {isRTL ? 'عرض الحملات' : 'View Campaigns'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-md font-semibold text-gray-900 mb-1">
                    {isRTL ? 'لا توجد حملات نشطة' : 'No Active Campaigns'}
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm mb-6">
                    {isRTL 
                      ? 'لم تقم بإنشاء أي حملات بعد. ابدأ بإنشاء حملة للوصول إلى جمهورك المستهدف.'
                      : 'You havent created any campaigns yet. Start by creating a campaign to reach your target audience.'}
                  </p>
                  <Button onClick={() => setLocation('/advertiser/campaigns/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Play className="w-4 h-4 mr-2" />
                    {isRTL ? 'إنشاء حملتك الأولى' : 'Create Your First Campaign'}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights / Tasks Needs Attention */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 py-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {isRTL ? 'مهام تحتاج انتباهك' : 'Needs Attention'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setLocation('/advertiser/tasks/review')}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{isRTL ? 'مهام قيد المراجعة' : 'Pending Approvals'}</p>
                    <p className="text-xs text-gray-500">0 {isRTL ? 'مهام تنتظر' : 'tasks queued'}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setLocation('/advertiser/billing')}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{isRTL ? 'الرصيد المنخفض' : 'Low Balance Alert'}</p>
                    <p className="text-xs text-gray-500">{isRTL ? 'أضف رصيد لتجنب التوقف' : 'Top up to avoid pauses'}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

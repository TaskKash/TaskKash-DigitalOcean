import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, Users, Eye, CheckCircle2, 
  Clock, DollarSign, Target, BarChart3, Building2 
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';

export default function Analytics() {
  const [, setLocation] = useLocation();
  const { currentAdvertiser, advertiserCampaigns } = useApp();

  // إخفاء مؤقت إذا لم يكن هناك معلن
  if (!currentAdvertiser) {
    return null;
  }
  
  const [performance, setPerformance] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('30');
  
  useEffect(() => {
    fetch(`/api/advertiser/analytics/performance?days=${timeRange}`)
      .then(r => r.json())
      .then(setPerformance)
      .catch(console.error);
  }, [timeRange]);

  // حساب الإحصائيات من البيانات الحقيقية
  const totalViews = advertiserCampaigns.reduce((sum, c) => sum + c.performance.impressions, 0);
  const totalClicks = advertiserCampaigns.reduce((sum, c) => sum + c.performance.clicks, 0);
  const totalCompletions = advertiserCampaigns.reduce((sum, c) => sum + c.tasksCompleted, 0);
  const totalSpent = advertiserCampaigns.reduce((sum, c) => sum + c.spent, 0);
  const avgCompletionRate = advertiserCampaigns.length > 0 
    ? Math.round(advertiserCampaigns.reduce((sum, c) => sum + (c.tasksCompleted / c.tasksTotal * 100), 0) / advertiserCampaigns.length)
    : 0;
  const avgCostPerCompletion = totalCompletions > 0 ? Math.round(totalSpent / totalCompletions) : 0;

  const metrics = [
    { 
      label: 'إجمالي المشاهدات', 
      value: totalViews.toLocaleString('ar-EG'), 
      change: '+12.5%', 
      trend: 'up',
      icon: Eye,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    { 
      label: 'معدل الإكمال', 
      value: `${avgCompletionRate}%`, 
      change: '+5.2%', 
      trend: 'up',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100'
    },
    { 
      label: 'إجمالي النقرات', 
      value: totalClicks.toLocaleString('ar-EG'), 
      change: '+8.3%', 
      trend: 'up',
      icon: Target,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    { 
      label: 'تكلفة الإكمال', 
      value: `${avgCostPerCompletion} ج.م`, 
      change: '-2.3%', 
      trend: 'down',
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    }
  ];

  // بيانات ديموغرافية نسبة لإجمالي الإكمالات
  const demographicsData = [
    { age: '18-24', percentage: 35, count: Math.round(totalCompletions * 0.35) },
    { age: '25-34', percentage: 42, count: Math.round(totalCompletions * 0.42) },
    { age: '35-44', percentage: 18, count: Math.round(totalCompletions * 0.18) },
    { age: '45+', percentage: 5, count: Math.round(totalCompletions * 0.05) }
  ];

  const locationData = [
    { city: 'القاهرة', percentage: 38, count: Math.round(totalCompletions * 0.38) },
    { city: 'الإسكندرية', percentage: 28, count: Math.round(totalCompletions * 0.28) },
    { city: 'الجيزة', percentage: 15, count: Math.round(totalCompletions * 0.15) },
    { city: 'محافظات أخرى', percentage: 19, count: Math.round(totalCompletions * 0.19) }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">التحليلات</h1>
              <p className="text-sm text-muted-foreground">نظرة شاملة على أداء حملاتك</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">{currentAdvertiser.company}</span>
            </div>
          </div>
          <Button variant="outline">
            <BarChart3 className="w-5 h-5 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-full ${metric.bg} flex items-center justify-center`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {metric.change}
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns">أداء الحملات</TabsTrigger>
            <TabsTrigger value="performance">أداء الأيام</TabsTrigger>
            <TabsTrigger value="demographics">الديموغرافيا</TabsTrigger>
            <TabsTrigger value="locations">المواقع</TabsTrigger>
          </TabsList>

          {/* Campaign Performance Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">أداء الحملات</h2>
              <div className="space-y-4">
                {advertiserCampaigns.map((campaign) => {
                  const completionRate = Math.round((campaign.tasksCompleted / campaign.tasksTotal) * 100);
                  return (
                    <div key={campaign.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold mb-1">{campaign.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{campaign.performance.impressions.toLocaleString('ar-EG')} مشاهدة</span>
                            <span>{campaign.tasksCompleted.toLocaleString('ar-EG')} إكمال</span>
                            <span>{completionRate}% معدل</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-muted-foreground">الإنفاق</p>
                          <p className="font-semibold">{campaign.spent.toLocaleString('ar-EG')} ج.م</p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">التقدم</span>
                          <span className="font-semibold">{completionRate}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">CTR</p>
                          <p className="font-semibold text-sm">{campaign.performance.ctr}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">التحويلات</p>
                          <p className="font-semibold text-sm">{campaign.performance.conversions.toLocaleString('ar-EG')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">ROI</p>
                          <p className="font-semibold text-sm text-emerald-600">{campaign.performance.roi}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">النقرات</p>
                          <p className="font-semibold text-sm">{campaign.performance.clicks.toLocaleString('ar-EG')}</p>
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
                    ابدأ بإنشاء حملتك الأولى لرؤية التحليلات
                  </p>
                  <Button onClick={() => setLocation('/advertiser/campaigns/new')}>
                    إنشاء حملة جديدة
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Daily Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">الأداء اليومي (أخر {timeRange} يوم)</h2>
                <select 
                  className="border rounded p-1 text-sm bg-white" 
                  value={timeRange} 
                  onChange={e => setTimeRange(e.target.value)}
                >
                  <option value="7">أخر 7 أيام</option>
                  <option value="30">أخر 30 يوم</option>
                  <option value="90">أخر 90 يوم</option>
                </select>
              </div>
              <div className="space-y-4">
                {performance.map((day, i) => {
                  const maxCompletions = Math.max(1, Math.max(...performance.map(p => p.completions)));
                  const percent = (day.completions / maxCompletions) * 100;
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 w-20">{day.date}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full flex items-center pr-2 transition-all"
                          style={{ width: `${Math.max(5, percent)}%` }}
                        >
                          <span className="text-xs text-white font-medium pr-2 text-right w-full">{day.completions}</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold w-24 text-left">{day.spent} ج.م</span>
                    </div>
                  );
                })}
                {performance.length === 0 && (
                  <div className="text-center py-8 text-gray-500">لا توجد بيانات للأداء في هذه الفترة.</div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Demographics Tab */}
          <TabsContent value="demographics" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">التوزيع العمري</h2>
              <div className="space-y-4">
                {demographicsData.map((item) => (
                  <div key={item.age}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.age} سنة</span>
                      <span className="text-sm text-muted-foreground">
                        {item.count.toLocaleString('ar-EG')} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">التوزيع حسب الجنس</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <div className="text-4xl font-bold text-blue-600">52%</div>
                  </div>
                  <p className="font-semibold">ذكور</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(totalCompletions * 0.52).toLocaleString('ar-EG')} مستخدم
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
                    <div className="text-4xl font-bold text-pink-600">48%</div>
                  </div>
                  <p className="font-semibold">إناث</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(totalCompletions * 0.48).toLocaleString('ar-EG')} مستخدم
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">التوزيع الجغرافي</h2>
              <div className="space-y-4">
                {locationData.map((item, index) => (
                  <div key={item.city}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                        <span className="text-sm font-medium">{item.city}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.count.toLocaleString('ar-EG')} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold mb-1">{totalCompletions.toLocaleString('ar-EG')}</p>
                  <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold mb-1">5</p>
                  <p className="text-sm text-muted-foreground">المدن المستهدفة</p>
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold mb-1">38%</p>
                  <p className="text-sm text-muted-foreground">أعلى تركيز</p>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

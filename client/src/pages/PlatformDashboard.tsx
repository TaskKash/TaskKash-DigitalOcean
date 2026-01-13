import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Building2, CheckCircle2, DollarSign, TrendingUp,
  Target, Clock, Star, ArrowUp, ArrowDown
} from 'lucide-react';

const stats = {
  users: {
    total: 125430,
    active: 98234,
    growth: '+15.3%',
    trend: 'up'
  },
  advertisers: {
    total: 2847,
    active: 2156,
    growth: '+8.7%',
    trend: 'up'
  },
  tasks: {
    total: 458920,
    completed: 423156,
    growth: '+22.4%',
    trend: 'up'
  },
  revenue: {
    total: 4582340,
    monthly: 382695,
    growth: '+18.9%',
    trend: 'up'
  }
};

const recentActivity = [
  { type: 'user', action: 'مستخدم جديد انضم', time: 'منذ دقيقتين', icon: Users },
  { type: 'task', action: 'مهمة جديدة تم نشرها', time: 'منذ 5 دقائق', icon: Target },
  { type: 'advertiser', action: 'معلن جديد سجل', time: 'منذ 12 دقيقة', icon: Building2 },
  { type: 'task', action: '50 مهمة تم إكمالها', time: 'منذ 18 دقيقة', icon: CheckCircle2 },
  { type: 'revenue', action: 'دفعة جديدة: 15,000 ج.م', time: 'منذ 25 دقيقة', icon: DollarSign }
];

const topCategories = [
  { name: 'استبيانات', tasks: 145230, percentage: 32 },
  { name: 'مشاهدة فيديو', tasks: 128450, percentage: 28 },
  { name: 'تطبيقات', tasks: 95680, percentage: 21 },
  { name: 'مواقع التواصل', tasks: 56340, percentage: 12 },
  { name: 'أخرى', tasks: 33220, percentage: 7 }
];

const monthlyData = [
  { month: 'يناير', users: 85000, revenue: 285000 },
  { month: 'فبراير', users: 92000, revenue: 312000 },
  { month: 'مارس', users: 98000, revenue: 345000 },
  { month: 'أبريل', users: 105000, revenue: 368000 },
  { month: 'مايو', users: 112000, revenue: 392000 },
  { month: 'يونيو', users: 125430, revenue: 458234 }
];

export default function PlatformDashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">لوحة معلومات المنصة</h1>
          <p className="text-lg opacity-90">نظرة شاملة على أداء TASKKASH</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Users */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <Badge className={`${stats.users.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} border-0`}>
                {stats.users.trend === 'up' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />}
                {stats.users.growth}
              </Badge>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.users.total.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mb-2">إجمالي المستخدمين</p>
            <p className="text-xs text-muted-foreground">
              {stats.users.active.toLocaleString()} نشط
            </p>
          </Card>

          {/* Advertisers */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <Badge className={`${stats.advertisers.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} border-0`}>
                {stats.advertisers.trend === 'up' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />}
                {stats.advertisers.growth}
              </Badge>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.advertisers.total.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mb-2">إجمالي المعلنين</p>
            <p className="text-xs text-muted-foreground">
              {stats.advertisers.active.toLocaleString()} نشط
            </p>
          </Card>

          {/* Tasks */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <Badge className={`${stats.tasks.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} border-0`}>
                {stats.tasks.trend === 'up' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />}
                {stats.tasks.growth}
              </Badge>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.tasks.total.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mb-2">إجمالي المهام</p>
            <p className="text-xs text-muted-foreground">
              {stats.tasks.completed.toLocaleString()} مكتملة
            </p>
          </Card>

          {/* Revenue */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-secondary" />
              </div>
              <Badge className={`${stats.revenue.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} border-0`}>
                {stats.revenue.trend === 'up' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />}
                {stats.revenue.growth}
              </Badge>
            </div>
            <p className="text-3xl font-bold mb-1">{(stats.revenue.total / 1000000).toFixed(1)}M ج.م</p>
            <p className="text-sm text-muted-foreground mb-2">إجمالي الإيرادات</p>
            <p className="text-xs text-muted-foreground">
              {stats.revenue.monthly.toLocaleString()} ج.م شهرياً
            </p>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Growth */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">النمو الشهري</h2>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{data.month}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-blue-600">{data.users.toLocaleString()} مستخدم</span>
                      <span className="text-primary">{data.revenue.toLocaleString()} ج.م</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-2 rounded-full bg-blue-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${(data.users / 125430) * 100}%` }}
                      />
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-green-100">
                      <div
                        className="h-full rounded-full bg-green-600"
                        style={{ width: `${(data.revenue / 458234) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Categories */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">أكثر الفئات طلباً</h2>
            <div className="space-y-4">
              {topCategories.map((category, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {category.tasks.toLocaleString()} مهمة ({category.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">النشاط الأخير</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'user' ? 'bg-blue-100' :
                  activity.type === 'advertiser' ? 'bg-purple-100' :
                  activity.type === 'task' ? 'bg-green-100' :
                  'bg-orange-100'
                }`}>
                  <activity.icon className={`w-5 h-5 ${
                    activity.type === 'user' ? 'text-blue-600' :
                    activity.type === 'advertiser' ? 'text-purple-600' :
                    activity.type === 'task' ? 'text-primary' :
                    'text-secondary'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold mb-2">4.8/5</p>
            <p className="text-sm text-muted-foreground">متوسط التقييم</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <p className="text-3xl font-bold mb-2">4.2 دقيقة</p>
            <p className="text-sm text-muted-foreground">متوسط وقت المهمة</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold mb-2">92%</p>
            <p className="text-sm text-muted-foreground">معدل إكمال المهام</p>
          </Card>
        </div>
      </div>
    </div>
  );
}


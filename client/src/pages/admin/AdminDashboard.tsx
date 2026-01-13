import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Building2, CheckCircle2, DollarSign, AlertTriangle,
  TrendingUp, Activity, Clock, Shield
} from 'lucide-react';
import { useLocation } from 'wouter';
import { ThemeToggle } from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const stats = [
  { icon: Users, label: 'إجمالي المستخدمين', value: '125,430', change: '+15.3%', color: 'blue' },
  { icon: Building2, label: 'إجمالي المعلنين', value: '2,847', change: '+8.7%', color: 'purple' },
  { icon: CheckCircle2, label: 'المهام المكتملة', value: '458,920', change: '+22.4%', color: 'green' },
  { icon: DollarSign, label: 'الإيرادات (ج.م)', value: '4.58M', change: '+18.9%', color: 'orange' },
  { icon: AlertTriangle, label: 'البلاغات المعلقة', value: '23', change: '-12%', color: 'red' },
  { icon: Activity, label: 'المستخدمون النشطون', value: '98,234', change: '+11.2%', color: 'cyan' }
];

const recentUsers = [
  { name: 'أحمد محمد', email: 'ahmed@example.com', date: 'منذ 5 دقائق', status: 'active' },
  { name: 'سارة أحمد', email: 'sara@example.com', date: 'منذ 12 دقيقة', status: 'active' },
  { name: 'محمد علي', email: 'mohammed@example.com', date: 'منذ 18 دقيقة', status: 'pending' },
  { name: 'فاطمة حسن', email: 'fatima@example.com', date: 'منذ 25 دقيقة', status: 'active' }
];

const recentReports = [
  { type: 'spam', user: 'أحمد محمد', reason: 'محتوى غير لائق', date: 'منذ 10 دقائق', status: 'pending' },
  { type: 'fraud', user: 'سارة أحمد', reason: 'محاولة احتيال', date: 'منذ 30 دقيقة', status: 'reviewing' },
  { type: 'abuse', user: 'محمد علي', reason: 'إساءة استخدام', date: 'منذ ساعة', status: 'resolved' }
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">لوحة تحكم المدير</h1>
              <p className="text-lg opacity-90">إدارة شاملة لمنصة TASKKASH</p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <ThemeToggle />
              <Shield className="w-12 h-12 opacity-50" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'purple' ? 'bg-purple-100' :
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'orange' ? 'bg-orange-100' :
                  stat.color === 'red' ? 'bg-red-100' :
                  'bg-cyan-100'
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'purple' ? 'text-purple-600' :
                    stat.color === 'green' ? 'text-primary' :
                    stat.color === 'orange' ? 'text-secondary' :
                    stat.color === 'red' ? 'text-red-600' :
                    'text-cyan-600'
                  }`} />
                </div>
                <Badge className={`${
                  stat.change.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                } border-0`}>
                  {stat.change}
                </Badge>
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
            <Button variant="outline" onClick={() => setLocation('/admin/users-manage')}>
              <Users className="w-4 h-4 ml-2" />
              Manage Users
            </Button>
            <Button variant="outline" onClick={() => setLocation('/admin/advertisers-manage')}>
              <Building2 className="w-4 h-4 ml-2" />
              Manage Advertisers
            </Button>
            <Button variant="outline" onClick={() => setLocation('/admin/reports')}>
              <AlertTriangle className="w-4 h-4 ml-2" />
              البلاغات
            </Button>
            <Button variant="outline" onClick={() => setLocation('/admin/settings')}>
              <Shield className="w-4 h-4 ml-2" />
              الإعدادات
            </Button>
          </div>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">المستخدمون الجدد</h2>
              <Button variant="ghost" size="sm" onClick={() => setLocation('/admin/users')}>
                عرض الكل
              </Button>
            </div>
            <div className="space-y-4">
              {recentUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <Badge className={`${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    } border-0 mb-1`}>
                      {user.status === 'active' ? 'نشط' : 'معلق'}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{user.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Reports */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">البلاغات الأخيرة</h2>
              <Button variant="ghost" size="sm" onClick={() => setLocation('/admin/reports')}>
                عرض الكل
              </Button>
            </div>
            <div className="space-y-4">
              {recentReports.map((report, index) => (
                <div key={index} className="p-3 rounded-lg hover:bg-muted/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <p className="font-medium">{report.user}</p>
                    </div>
                    <Badge className={`${
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'reviewing' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    } border-0`}>
                      {report.status === 'pending' ? 'معلق' :
                       report.status === 'reviewing' ? 'قيد المراجعة' : 'تم الحل'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{report.reason}</p>
                  <p className="text-xs text-muted-foreground">{report.date}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* System Health */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">صحة النظام</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">أداء الخادم</span>
                <span className="text-sm text-primary">ممتاز</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full rounded-full bg-green-600" style={{ width: '95%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">استخدام قاعدة البيانات</span>
                <span className="text-sm text-blue-600">جيد</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full rounded-full bg-blue-600" style={{ width: '68%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">وقت الاستجابة</span>
                <span className="text-sm text-primary">سريع</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full rounded-full bg-green-600" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


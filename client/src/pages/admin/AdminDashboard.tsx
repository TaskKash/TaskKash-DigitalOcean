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
import { useCurrency } from "@/contexts/CurrencyContext";

const stats = [
  { icon: Users, label: 'Active Users Now', value: '4,231', change: '+5.2%', color: 'blue' },
  { icon: Building2, label: 'New Advertisers (Today)', value: '12', change: '+20%', color: 'purple' },
  { icon: CheckCircle2, label: 'Tasks Completed (Today)', value: '15,892', change: '+12.4%', color: 'green' },
  { icon: DollarSign, label: 'Revenue (Today)', value: '84,500 {symbol}', change: '+18.9%', color: 'orange' },
  { icon: AlertTriangle, label: 'Action Required', value: '38', change: '+5', color: 'red' },
  { icon: Activity, label: 'System Load', value: '42%', change: '-3%', color: 'cyan' }
];

const actionQueue = [
  { id: '1', type: 'withdrawal', user: 'ahmed@example.com', amount: '1,500 {symbol}', urgency: 'high', time: '10 mins ago' },
  { id: '2', type: 'report', user: 'sara@example.com', reason: 'Spam task', urgency: 'medium', time: '25 mins ago' },
  { id: '3', type: 'kyc', user: 'mohammed@example.com', reason: 'ID Verification', urgency: 'low', time: '1 hour ago' },
  { id: '4', type: 'campaign', user: 'brand@company.com', reason: 'Video format review', urgency: 'high', time: '2 mins ago' },
];

export default function AdminDashboard() {
  const { currency, symbol, formatAmount } = useCurrency();
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

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action Required Queue */}
          <Card className="p-6 col-span-1 lg:col-span-2 border-red-200 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-600 w-5 h-5" />
                <h2 className="text-lg font-semibold text-red-700">Action Required Queue</h2>
              </div>
              <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">38 Pending Items</Badge>
            </div>
            <div className="space-y-3">
              {actionQueue.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    <div className={`p-2 rounded-full flex-shrink-0 ${
                      item.type === 'withdrawal' ? 'bg-orange-100 text-orange-600' :
                      item.type === 'report' ? 'bg-red-100 text-red-600' :
                      item.type === 'kyc' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {item.type === 'withdrawal' ? <DollarSign className="w-5 h-5" /> :
                       item.type === 'report' ? <AlertTriangle className="w-5 h-5" /> :
                       item.type === 'kyc' ? <Users className="w-5 h-5" /> :
                       <Building2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        <span className="capitalize">{item.type}</span>
                        {item.urgency === 'high' && <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">Urgent</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.user} - {item.amount || item.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:w-auto w-full justify-between sm:justify-end">
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                    <Button size="sm" onClick={() => setLocation(
                      item.type === 'withdrawal' ? '/admin/withdrawals' :
                      item.type === 'report' ? '/admin/reports' :
                      item.type === 'kyc' ? '/admin/users' : '/admin/advertisers'
                    )}>
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="ghost" className="text-muted-foreground w-full">View All Pending Actions</Button>
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
                <style>{`.w-dyn-sys-1 { width: 95%; }`}</style>
                <div className="h-full rounded-full bg-green-600 w-dyn-sys-1" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">استخدام قاعدة البيانات</span>
                <span className="text-sm text-blue-600">جيد</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <style>{`.w-dyn-sys-2 { width: 68%; }`}</style>
                <div className="h-full rounded-full bg-blue-600 w-dyn-sys-2" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">وقت الاستجابة</span>
                <span className="text-sm text-primary">سريع</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <style>{`.w-dyn-sys-3 { width: 92%; }`}</style>
                <div className="h-full rounded-full bg-green-600 w-dyn-sys-3" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


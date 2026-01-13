import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/AppHeader';
import { 
  Plus, Target, CheckCircle2, Users, DollarSign, TrendingUp, 
  BarChart3, PieChart, Settings, HelpCircle, Rocket, X, Building2,
  Eye, Clock, ArrowRight, Calendar, Filter, RefreshCw, Download
} from 'lucide-react';

export default function NewDashboard() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentAdvertiser, setCurrentAdvertiser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    // Load advertiser info from localStorage
    const advertiserInfo = localStorage.getItem('advertiser-info');
    if (advertiserInfo) {
      setCurrentAdvertiser(JSON.parse(advertiserInfo));
    } else {
      // Redirect to login if not authenticated
      setLocation('/advertiser/login');
      return;
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!currentAdvertiser) {
    return null;
  }

  const stats = [
    { 
      label: isRTL ? 'الحملات النشطة' : 'Active Campaigns', 
      value: '0', 
      icon: Target, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100',
      trend: '+12%'
    },
    { 
      label: isRTL ? 'المهام المكتملة' : 'Completed Tasks', 
      value: '0', 
      icon: CheckCircle2, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100',
      trend: '+8%'
    },
    { 
      label: isRTL ? 'إجمالي المستخدمين' : 'Total Users Reached', 
      value: '0', 
      icon: Users, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100',
      trend: '+25%'
    },
    { 
      label: isRTL ? 'الميزانية المتبقية' : 'Remaining Budget', 
      value: isRTL ? 'ج.م 0.00' : 'EGP 0.00', 
      icon: DollarSign, 
      color: 'text-orange-600', 
      bg: 'bg-orange-100',
      trend: null
    },
  ];

  const quickActions = [
    { 
      label: isRTL ? 'إنشاء حملة' : 'Create Campaign', 
      icon: Plus, 
      path: '/advertiser/campaign-builder',
      color: 'bg-emerald-500 hover:bg-emerald-600'
    },
    { 
      label: isRTL ? 'التحليلات' : 'Analytics', 
      icon: BarChart3, 
      path: '/advertiser/analytics',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      label: isRTL ? 'المهام' : 'Tasks', 
      icon: CheckCircle2, 
      path: '/advertiser/tasks',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    { 
      label: isRTL ? 'الملف الشخصي' : 'Profile', 
      icon: Settings, 
      path: '/advertiser/profile',
      color: 'bg-gray-500 hover:bg-gray-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <AppHeader showThemeToggle={true} className="bg-white border-b shadow-sm" />
      
      {/* Advertiser Info Bar */}
      <div className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">{currentAdvertiser.company || currentAdvertiser.name}</span>
            </div>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full capitalize">
              {currentAdvertiser.tier || 'Basic'} {isRTL ? 'الباقة' : 'Tier'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setLocation('/advertiser/tasks/create')}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isRTL ? 'مهمة جديدة' : 'New Task'}
            </Button>
            <Button 
              onClick={() => setLocation('/advertiser/campaign-builder')}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isRTL ? 'حملة جديدة' : 'New Campaign'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Banner */}
        {showWelcome && (
          <Card className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white relative overflow-hidden">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Rocket className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {isRTL ? `مرحباً في TASKKASH! 🎉` : `Welcome to TASKKASH! 🎉`}
                  </h2>
                  <p className="opacity-90 mb-4">
                    {isRTL 
                      ? 'أنت الآن جاهز لإطلاق حملتك الإعلانية الأولى والوصول إلى آلاف المستخدمين النشطين. ابدأ الآن وحقق أهدافك التسويقية!'
                      : 'You are now ready to launch your first advertising campaign and reach thousands of active users. Start now and achieve your marketing goals!'
                    }
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setLocation('/advertiser/campaign-builder')}
                      className="bg-white text-emerald-600 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isRTL ? 'إنشاء حملتك الأولى' : 'Create Your First Campaign'}
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      {isRTL ? 'دليل البدء السريع' : 'Quick Start Guide'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  {stat.trend && (
                    <span className="flex items-center text-sm text-green-600 font-medium">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {stat.trend}
                    </span>
                  )}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'إجراءات سريعة' : 'Quick Actions'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setLocation(action.path)}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-full ${action.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-gray-700">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{isRTL ? 'الحملات الأخيرة' : 'Recent Campaigns'}</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setLocation('/advertiser/campaigns')}>
              {isRTL ? 'عرض الكل' : 'View All'}
            </Button>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isRTL ? 'لا توجد حملات بعد' : 'No campaigns yet'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {isRTL 
                    ? 'ابدأ بإنشاء حملتك الأولى للوصول إلى جمهورك المستهدف'
                    : 'Start by creating your first campaign to reach your target audience'
                  }
                </p>
                <Button onClick={() => setLocation('/advertiser/campaign-builder')}>
                  <Plus className="w-4 h-4 mr-2" />
                  {isRTL ? 'إنشاء حملة جديدة' : 'Create New Campaign'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{campaign.name}</h4>
                      <p className="text-sm text-gray-500">{campaign.status}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Targeting Features Highlight */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {isRTL ? 'استهداف متقدم بـ 25+ طبقة بيانات' : 'Advanced Targeting with 25+ Data Layers'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isRTL 
                    ? 'استهدف جمهورك بدقة عالية باستخدام البيانات الديموغرافية، الاهتمامات، الأجهزة، الموقع، والمزيد.'
                    : 'Target your audience with high precision using demographics, interests, devices, location, and more.'
                  }
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Demographics', 'Interests', 'Device', 'Location', 'Income', 'Education'].map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

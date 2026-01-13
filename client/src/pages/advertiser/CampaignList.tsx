import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, Search, Filter, MoreVertical, Play, Pause, 
  Trash2, Edit, Eye, TrendingUp, Calendar, Target 
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';

export default function CampaignList() {
  const [, setLocation] = useLocation();
  const { currentAdvertiser, advertiserCampaigns } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // إذا لم يكن هناك معلن مسجل، إعادة توجيه لصفحة تسجيل الدخول
  useEffect(() => {
    if (!currentAdvertiser) {
      setLocation('/advertiser/login');
    }
  }, [currentAdvertiser, setLocation]);

  if (!currentAdvertiser) {
    return null;
  }

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

  const filteredCampaigns = advertiserCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // حساب الإحصائيات
  const stats = {
    total: advertiserCampaigns.length,
    active: advertiserCampaigns.filter(c => c.status === 'active').length,
    paused: advertiserCampaigns.filter(c => c.status === 'paused').length,
    completed: advertiserCampaigns.filter(c => c.status === 'completed').length,
    draft: advertiserCampaigns.filter(c => c.status === 'draft').length
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">الحملات الإعلانية</h1>
            <p className="text-sm text-muted-foreground">{currentAdvertiser.company}</p>
          </div>
          <Button 
            onClick={() => setLocation('/advertiser/campaigns/new')}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
          >
            <Plus className="w-5 h-5 ml-2" />
            حملة جديدة
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">إجمالي الحملات</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">نشطة</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">متوقفة</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.paused}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">مكتملة</p>
            <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">مسودات</p>
            <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="ابحث عن حملة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                الكل ({stats.total})
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
                className={filterStatus === 'active' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                نشطة ({stats.active})
              </Button>
              <Button
                variant={filterStatus === 'paused' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('paused')}
                className={filterStatus === 'paused' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
              >
                متوقفة ({stats.paused})
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('completed')}
                className={filterStatus === 'completed' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                مكتملة ({stats.completed})
              </Button>
            </div>
          </div>
        </Card>

        {/* Campaigns List */}
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => {
            const completionPercentage = Math.round((campaign.tasksCompleted / campaign.tasksTotal) * 100);
            const spentPercentage = Math.round((campaign.spent / campaign.budget) * 100);

            return (
              <Card key={campaign.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(campaign.startDate).toLocaleDateString('ar-EG')} - {new Date(campaign.endDate).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{campaign.targetAudience.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation(`/advertiser/campaigns/${campaign.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation(`/advertiser/campaigns/${campaign.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">الميزانية</p>
                    <p className="font-semibold">{campaign.budget.toLocaleString('ar-EG')} ج.م</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">المنفق</p>
                    <p className="font-semibold text-orange-600">{campaign.spent.toLocaleString('ar-EG')} ج.م</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">المهام المكتملة</p>
                    <p className="font-semibold text-emerald-600">{campaign.tasksCompleted.toLocaleString('ar-EG')} / {campaign.tasksTotal.toLocaleString('ar-EG')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">معدل التحويل</p>
                    <p className="font-semibold">{campaign.performance.ctr}%</p>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
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
                    <div className="flex items-center justify-between text-sm mb-1">
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

                {/* Performance Metrics */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">مرات الظهور</p>
                      <p className="font-semibold text-sm">{campaign.performance.impressions.toLocaleString('ar-EG')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">النقرات</p>
                      <p className="font-semibold text-sm">{campaign.performance.clicks.toLocaleString('ar-EG')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">التحويلات</p>
                      <p className="font-semibold text-sm">{campaign.performance.conversions.toLocaleString('ar-EG')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">العائد على الاستثمار</p>
                      <p className="font-semibold text-sm text-emerald-600">{campaign.performance.roi}%</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCampaigns.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || filterStatus !== 'all' ? 'لا توجد نتائج' : 'لا توجد حملات بعد'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || filterStatus !== 'all' 
                  ? 'جرب تغيير معايير البحث أو الفلتر'
                  : 'ابدأ بإنشاء حملتك الأولى للوصول إلى المستخدمين'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <Button 
                  onClick={() => setLocation('/advertiser/campaigns/new')}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700"
                >
                  <Plus className="w-5 h-5 ml-2" />
                  إنشاء حملة جديدة
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

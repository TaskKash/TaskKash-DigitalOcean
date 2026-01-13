import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, Filter, CheckCircle2, XCircle, Eye,
  Clock, User, Calendar, Building2, Target
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';

// بيانات وهمية للمهام قيد المراجعة (يمكن ربطها بـ advertiserTasks لاحقاً)
const generatePendingTasks = (advertiserId: string, campaigns: any[]) => {
  const users = ['أحمد محمد', 'فاطمة علي', 'محمد سعيد', 'نورة خالد', 'عبدالله أحمد', 'سارة محمود', 'خالد عمر', 'منى سالم'];
  const pendingTasks = [];
  
  campaigns.forEach((campaign, campaignIndex) => {
    const tasksCount = Math.min(3, Math.floor(Math.random() * 4) + 1); // 1-3 مهام لكل حملة
    for (let i = 0; i < tasksCount; i++) {
      pendingTasks.push({
        id: `${advertiserId}-${campaignIndex}-${i}`,
        campaign: campaign.name,
        campaignId: campaign.id,
        user: users[Math.floor(Math.random() * users.length)],
        type: 'استبيان',
        submittedAt: new Date(Date.now() - Math.random() * 3600000).toLocaleString('ar-EG'),
        duration: `${Math.floor(Math.random() * 5) + 3} دقائق`,
        quality: Math.floor(Math.random() * 30) + 70,
        answers: 10
      });
    }
  });
  
  return pendingTasks;
};

export default function TaskReviewQueue() {
  const [, setLocation] = useLocation();
  const { currentAdvertiser, advertiserCampaigns } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // إذا لم يكن هناك معلن مسجل، إعادة توجيه لصفحة تسجيل الدخول
  useEffect(() => {
    if (!currentAdvertiser) {
      setLocation('/advertiser/login');
    }
  }, [currentAdvertiser, setLocation]);

  if (!currentAdvertiser) {
    return null;
  }

  // توليد المهام قيد المراجعة للمعلن الحالي فقط
  const pendingTasks = generatePendingTasks(currentAdvertiser.id, advertiserCampaigns.filter(c => c.status === 'active'));

  const getQualityColor = (quality: number) => {
    if (quality >= 90) return 'text-emerald-600 bg-emerald-100';
    if (quality >= 75) return 'text-blue-600 bg-blue-100';
    if (quality >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredTasks = pendingTasks.filter(task => {
    const matchesSearch = task.campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.user.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">قائمة المراجعة</h1>
                <p className="text-sm text-muted-foreground">مهام تنتظر الموافقة</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">{currentAdvertiser.company}</span>
              </div>
            </div>
            <Badge className="bg-orange-100 text-orange-800 text-lg px-4 py-2">
              {filteredTasks.length} مهمة قيد المراجعة
            </Badge>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="ابحث عن حملة أو مستخدم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredTasks.length}</p>
                <p className="text-xs text-muted-foreground">قيد المراجعة</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.floor(filteredTasks.length * 0.85)}</p>
                <p className="text-xs text-muted-foreground">معدل القبول</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Set(filteredTasks.map(t => t.user)).size}</p>
                <p className="text-xs text-muted-foreground">مستخدمين فريدين</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{advertiserCampaigns.filter(c => c.status === 'active').length}</p>
                <p className="text-xs text-muted-foreground">حملات نشطة</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold">{task.campaign}</h3>
                    <Badge variant="outline" className="text-xs">
                      {task.type}
                    </Badge>
                    <Badge className={`text-xs ${getQualityColor(task.quality)}`}>
                      جودة {task.quality}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{task.user}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{task.submittedAt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{task.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                      <span>{task.answers} إجابات</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mr-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLocation(`/advertiser/tasks/${task.id}`)}
                  >
                    <Eye className="w-4 h-4 ml-1" />
                    مراجعة
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="w-4 h-4 ml-1" />
                    قبول
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 ml-1" />
                    رفض
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'لا توجد نتائج' : 'لا توجد مهام قيد المراجعة'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'جرب تغيير معايير البحث'
                  : 'جميع المهام تمت مراجعتها! 🎉'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, XCircle, User, Calendar, Eye, RotateCcw
} from 'lucide-react';
import { useLocation } from 'wouter';

const rejectedTasks = [
  {
    id: '1',
    campaign: 'حملة إطلاق المنتج الجديد',
    user: 'خالد عمر',
    type: 'استبيان',
    rejectedAt: '2024-01-24 16:45',
    reason: 'إجابات غير مكتملة - 3 أسئلة لم يتم الإجابة عليها',
    reviewer: 'أحمد محمد'
  },
  {
    id: '2',
    campaign: 'استبيان أبحاث السوق',
    user: 'منى سالم',
    type: 'استبيان',
    rejectedAt: '2024-01-24 15:30',
    reason: 'إجابات غير منطقية ومتناقضة',
    reviewer: 'فاطمة علي'
  },
  {
    id: '3',
    campaign: 'مشاهدة فيديو ترويجي',
    user: 'سعيد أحمد',
    type: 'فيديو',
    rejectedAt: '2024-01-24 14:20',
    reason: 'لم يتم مشاهدة الفيديو بالكامل',
    reviewer: 'أحمد محمد'
  },
  {
    id: '4',
    campaign: 'حملة إطلاق المنتج الجديد',
    user: 'ليلى محمود',
    type: 'استبيان',
    rejectedAt: '2024-01-24 13:15',
    reason: 'إجابات مكررة من حساب آخر',
    reviewer: 'محمد سعيد'
  },
  {
    id: '5',
    campaign: 'مراجعة المتاجر الإلكترونية',
    user: 'عمر خالد',
    type: 'مراجعة',
    rejectedAt: '2024-01-24 12:00',
    reason: 'محتوى غير مناسب وغير متعلق بالمهمة',
    reviewer: 'فاطمة علي'
  }
];

export default function RejectedTasks() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = rejectedTasks.filter(task =>
    task.campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">المهام المرفوضة</h1>
              <p className="text-sm text-muted-foreground">
                {filteredTasks.length} مهمة مرفوضة
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="ابحث عن مهمة أو مستخدم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="p-6 border-red-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{task.campaign}</h3>
                  <Badge variant="outline" className="border-red-600 text-red-600">
                    <XCircle className="w-3 h-3 ml-1" />
                    مرفوضة
                  </Badge>
                  <Badge variant="outline">{task.type}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {task.user}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {task.rejectedAt}
                  </span>
                  <span>•</span>
                  <span>المراجع: {task.reviewer}</span>
                </div>
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm font-medium text-red-900 mb-1">سبب الرفض:</p>
                  <p className="text-sm text-red-800">{task.reason}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(`/advertiser/tasks/${task.id}/review`)}
              >
                <Eye className="w-4 h-4 ml-1" />
                عرض التفاصيل
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 ml-1" />
                إعادة المراجعة
              </Button>
            </div>
          </Card>
        ))}

        {filteredTasks.length === 0 && (
          <Card className="p-12 text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">لا توجد مهام مرفوضة</p>
            <p className="text-muted-foreground">
              جميع المهام تمت الموافقة عليها
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}


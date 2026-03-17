import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Clock, Calendar, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalizedFieldGetter } from '@/lib/languageUtils';
import { useTranslation } from 'react-i18next';
import { useCurrency } from "@/contexts/CurrencyContext";

const taskHistory = [
  {
    id: '1',
    title: 'استبيان عن تطبيقات التوصيل',
    type: 'survey',
    reward: 15,
    status: 'completed',
    completedDate: '2025-10-25',
    submittedDate: '2025-10-25',
    approvedDate: '2025-10-26'
  },
  {
    id: '2',
    title: 'مشاهدة إعلان تطبيق جديد',
    type: 'video',
    reward: 5,
    status: 'completed',
    completedDate: '2025-10-24',
    submittedDate: '2025-10-24',
    approvedDate: '2025-10-25'
  },
  {
    id: '3',
    title: 'تحميل وتجربة تطبيق اللياقة',
    type: 'app',
    reward: 25,
    status: 'pending',
    completedDate: '2025-10-26',
    submittedDate: '2025-10-26',
    approvedDate: null
  },
  {
    id: '4',
    title: 'متابعة حساب على إنستقرام',
    type: 'social',
    reward: 3,
    status: 'rejected',
    completedDate: '2025-10-23',
    submittedDate: '2025-10-23',
    approvedDate: null,
    rejectionReason: 'لم يتم التحقق من المتابعة'
  },
  {
    id: '5',
    title: 'اختبار معلومات عامة',
    type: 'quiz',
    reward: 20,
    status: 'completed',
    completedDate: '2025-10-22',
    submittedDate: '2025-10-22',
    approvedDate: '2025-10-23'
  },
  {
    id: '6',
    title: 'استبيان أبحاث السوق',
    type: 'survey',
    reward: 30,
    status: 'completed',
    completedDate: '2025-10-21',
    submittedDate: '2025-10-21',
    approvedDate: '2025-10-22'
  }
];

const statusConfig = {
  completed: {
    label: 'مكتملة',
    color: 'bg-green-100 text-green-800 border-0',
    icon: CheckCircle2,
    iconColor: 'text-primary'
  },
  pending: {
    label: 'قيد المراجعة',
    color: 'bg-orange-100 text-orange-800 border-0',
    icon: Clock,
    iconColor: 'text-secondary'
  },
  rejected: {
    label: 'مرفوضة',
    color: 'bg-red-100 text-red-800 border-0',
    icon: XCircle,
    iconColor: 'text-red-600'
  }
};

export default function TaskHistory() {
  const { currency, symbol, formatAmount } = useCurrency();
  const { t, i18n } = useTranslation();
  const language = i18n.language; // Assuming 'language' is derived from i18n
  const getLocalizedField = useLocalizedFieldGetter();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'rejected'>('all');
  const [disputeTask, setDisputeTask] = useState<any>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  const handleDispute = async () => {
    if (!disputeTask || !disputeReason.trim()) return;
    setIsSubmittingDispute(true);
    try {
      // In a real app we'd get the csrf token if needed
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskCompletionId: disputeTask.id, // Replace with actual completion ID
          campaignId: disputeTask.campaignId || disputeTask.id, // Fallback for dummy data
          reason: disputeReason
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(language === 'ar' ? 'تم تقديم الاعتراض بنجاح' : 'Dispute submitted successfully');
        setDisputeTask(null);
        setDisputeReason('');
      } else {
        toast.error(data.error || 'Failed to submit dispute');
      }
    } catch (err) {
      toast.error('Error submitting dispute');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const filteredTasks = filter === 'all' 
    ? taskHistory 
    : taskHistory.filter(task => task.status === filter);

  const stats = {
    total: taskHistory.length,
    completed: taskHistory.filter(t => t.status === 'completed').length,
    pending: taskHistory.filter(t => t.status === 'pending').length,
    rejected: taskHistory.filter(t => t.status === 'rejected').length,
    totalEarnings: taskHistory
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.reward, 0)
  };

  return (
    <MobileLayout title="سجل المهام" showBack>
      <div className="p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
            <p className="text-sm text-muted-foreground">إجمالي المهام</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{stats.totalEarnings}</p>
            <p className="text-sm text-muted-foreground">إجمالي الأرباح</p>
          </Card>
        </div>

        {/* Filters */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all" onClick={() => setFilter('all')}>
              الكل ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="completed" onClick={() => setFilter('completed')}>
              مكتملة ({stats.completed})
            </TabsTrigger>
            <TabsTrigger value="pending" onClick={() => setFilter('pending')}>
              قيد المراجعة ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="rejected" onClick={() => setFilter('rejected')}>
              مرفوضة ({stats.rejected})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4 space-y-3">
            {filteredTasks.map((task) => {
              const config = statusConfig[task.status as keyof typeof statusConfig];
              const Icon = config.icon;

              return (
                <Card key={task.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">{getLocalizedField(task, 'title')}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={config.color}>
                          {config.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {task.type === 'survey' && '📋 استبيان'}
                          {task.type === 'video' && '🎥 فيديو'}
                          {task.type === 'app' && '📱 تطبيق'}
                          {task.type === 'social' && '👥 سوشيال'}
                          {task.type === 'quiz' && '❓ اختبار'}
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className={`font-bold ${task.status === 'completed' ? 'text-primary' : 'text-muted-foreground'}`}>
                        {task.status === 'completed' ? '+' : ''}{task.reward} {symbol}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        تاريخ الإكمال
                      </span>
                      <span className="font-medium">{task.completedDate}</span>
                    </div>
                    
                    {task.status === 'completed' && task.approvedDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          تاريخ الموافقة
                        </span>
                        <span className="font-medium">{task.approvedDate}</span>
                      </div>
                    )}

                    {task.status === 'rejected' && task.rejectionReason && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded mt-2">
                        <p className="text-red-800 dark:text-red-200 text-sm mb-2">
                          <strong>سبب الرفض:</strong> {task.rejectionReason}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full flex items-center justify-center gap-2 border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/40"
                          onClick={() => setDisputeTask(task)}
                        >
                          <ShieldAlert className="w-4 h-4" />
                          تقديم اعتراض (Dispute)
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}

            {filteredTasks.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">لا توجد مهام في هذه الفئة</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!disputeTask} onOpenChange={(open) => !open && setDisputeTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              {language === 'ar' ? 'تقديم اعتراض' : 'File a Dispute'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {language === 'ar' 
                ? 'هل تعتقد أن مهمتك رُفضت عن طريق الخطأ؟ يرجى توضيح سبب اعتراضك وسيقوم فريق الدعم بمراجعته.'
                : 'Do you believe your task was rejected by mistake? Please explain your reason and our support team will review it.'}
            </p>
            <Textarea 
              placeholder={language === 'ar' ? 'اكتب سبب اعتراضك هنا...' : 'Write your dispute reason here...'}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisputeTask(null)} disabled={isSubmittingDispute}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleDispute} disabled={!disputeReason.trim() || isSubmittingDispute}>
              {isSubmittingDispute ? (language === 'ar' ? 'جاري التقديم...' : 'Submitting...') : (language === 'ar' ? 'تأكيد الاعتراض' : 'Submit Dispute')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}

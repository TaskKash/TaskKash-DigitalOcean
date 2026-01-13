import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowRight, CheckCircle2, XCircle, User, Calendar,
  Clock, Target, AlertCircle, MessageSquare
} from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function TaskDetailReview() {
  const [, setLocation] = useLocation();
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const task = {
    id: '1',
    campaign: 'حملة إطلاق المنتج الجديد',
    user: {
      name: 'أحمد محمد',
      avatar: '👨‍💼',
      completedTasks: 145,
      successRate: 96,
      memberSince: 'منذ 6 أشهر'
    },
    submittedAt: '2024-01-25 14:30',
    duration: '4 دقائق 23 ثانية',
    quality: 95,
    answers: [
      {
        question: 'ما رأيك في المنتج الجديد؟',
        answer: 'المنتج ممتاز ويحتوي على ميزات مبتكرة تلبي احتياجات السوق',
        type: 'text'
      },
      {
        question: 'ما هو تقييمك للمنتج من 1 إلى 10؟',
        answer: '9',
        type: 'rating'
      },
      {
        question: 'هل تنصح بشراء هذا المنتج؟',
        answer: 'نعم، بشدة',
        type: 'choice'
      },
      {
        question: 'ما هي الميزة الأكثر إعجاباً لك؟',
        answer: 'سهولة الاستخدام والتصميم العصري',
        type: 'text'
      },
      {
        question: 'ما هي التحسينات المقترحة؟',
        answer: 'إضافة المزيد من الألوان وتحسين البطارية',
        type: 'text'
      },
      {
        question: 'هل واجهت أي مشاكل؟',
        answer: 'لا، كل شيء يعمل بشكل ممتاز',
        type: 'text'
      },
      {
        question: 'كم مرة تستخدم منتجات مشابهة؟',
        answer: 'يومياً',
        type: 'choice'
      },
      {
        question: 'ما هو السعر المناسب برأيك؟',
        answer: '500-700 ريال',
        type: 'choice'
      },
      {
        question: 'هل ستشتري المنتج عند إطلاقه؟',
        answer: 'نعم، بالتأكيد',
        type: 'choice'
      },
      {
        question: 'أي ملاحظات إضافية؟',
        answer: 'منتج رائع وأتطلع لرؤيته في الأسواق قريباً',
        type: 'text'
      }
    ]
  };

  const handleApprove = () => {
    toast.success('تم قبول المهمة بنجاح');
    setTimeout(() => {
      setLocation('/advertiser/tasks/review');
    }, 1000);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('يرجى إدخال سبب الرفض');
      return;
    }
    toast.success('تم رفض المهمة وإرسال الإشعار للمستخدم');
    setTimeout(() => {
      setLocation('/advertiser/tasks/review');
    }, 1000);
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 90) return 'text-primary';
    if (quality >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setLocation('/advertiser/tasks/review')}
            className="flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            العودة إلى قائمة المراجعة
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">مراجعة المهمة</h1>
              <p className="text-sm text-muted-foreground">{task.campaign}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRejectForm(!showRejectForm)}
                className="bg-red-50 text-red-600 hover:bg-red-100"
              >
                <XCircle className="w-4 h-4 ml-2" />
                رفض
              </Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="w-4 h-4 ml-2" />
                قبول
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* User Info */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl">
              {task.user.avatar}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{task.user.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {task.user.completedTasks} مهمة مكتملة
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {task.user.successRate}% معدل النجاح
                </span>
                <span>•</span>
                <span>{task.user.memberSince}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Task Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">معلومات المهمة</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">تاريخ التسليم</p>
              </div>
              <p className="font-semibold">{task.submittedAt}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">مدة الإنجاز</p>
              </div>
              <p className="font-semibold">{task.duration}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">نقاط الجودة</p>
              </div>
              <p className={`font-semibold ${getQualityColor(task.quality)}`}>
                {task.quality}/100
              </p>
            </div>
          </div>
        </Card>

        {/* Rejection Form */}
        {showRejectForm && (
          <Card className="p-6 border-red-200 bg-red-50">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-900">
              <AlertCircle className="w-5 h-5" />
              سبب الرفض
            </h2>
            <Textarea
              placeholder="اكتب سبب رفض المهمة (سيتم إرساله للمستخدم)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                <XCircle className="w-4 h-4 ml-2" />
                تأكيد الرفض
              </Button>
              <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                إلغاء
              </Button>
            </div>
          </Card>
        )}

        {/* Answers */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            الإجابات ({task.answers.length})
          </h2>
          <div className="space-y-6">
            {task.answers.map((answer, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-sm">
                    {index + 1}. {answer.question}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {answer.type === 'text' ? 'نص' :
                     answer.type === 'rating' ? 'تقييم' : 'اختيار'}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-white border">
                  {answer.type === 'rating' ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {Array.from({ length: 10 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-8 h-8 rounded flex items-center justify-center text-sm font-semibold ${
                              i < parseInt(answer.answer)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      <span className="text-lg font-bold text-primary">
                        {answer.answer}/10
                      </span>
                    </div>
                  ) : (
                    <p className="text-foreground">{answer.answer}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quality Analysis */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold mb-4 text-blue-900">تحليل الجودة</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">اكتمال الإجابات</span>
              <Badge className="bg-green-100 text-green-800 border-0">100%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">جودة المحتوى</span>
              <Badge className="bg-green-100 text-green-800 border-0">ممتاز</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">الوقت المستغرق</span>
              <Badge className="bg-green-100 text-green-800 border-0">مناسب</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">التوصية</span>
              <Badge className="bg-green-100 text-green-800 border-0">
                <CheckCircle2 className="w-3 h-3 ml-1" />
                قبول
              </Badge>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setShowRejectForm(!showRejectForm)}
            className="bg-red-50 text-red-600 hover:bg-red-100"
          >
            <XCircle className="w-4 h-4 ml-2" />
            رفض المهمة
          </Button>
          <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="w-4 h-4 ml-2" />
            قبول المهمة
          </Button>
        </div>
      </div>
    </div>
  );
}


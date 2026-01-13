import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  ChevronLeft 
} from 'lucide-react';
import { useLocation } from 'wouter';

interface Dispute {
  id: string;
  taskId: string;
  taskTitle: string;
  reason: string;
  status: 'pending' | 'under_review' | 'resolved_accepted' | 'resolved_rejected';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
  reviewer?: string;
  evidence: string[];
}

// Mock data
const mockDisputes: Dispute[] = [
  {
    id: 'D001',
    taskId: 'T123',
    taskTitle: 'استبيان موقع: زيارة ماكدونالدز',
    reason: 'أكملت المهمة بالكامل لكن تم رفضها بدون سبب واضح. قمت بزيارة الفرع والتقطت الصور المطلوبة.',
    status: 'resolved_accepted',
    createdAt: '2025-10-28',
    resolvedAt: '2025-10-29',
    resolution: 'تم مراجعة الأدلة المقدمة والتحقق من صحتها. تم قبول المهمة وإضافة المكافأة لحسابك.',
    reviewer: 'أحمد محمود',
    evidence: ['evidence_1.jpg', 'evidence_2.jpg']
  },
  {
    id: 'D002',
    taskId: 'T124',
    taskTitle: 'تثبيت تطبيق: تطبيق تليجرام',
    reason: 'قمت بتثبيت التطبيق وتسجيل الدخول لكن المهمة لم تكتمل تلقائياً.',
    status: 'under_review',
    createdAt: '2025-10-30',
    evidence: ['screenshot.png']
  },
  {
    id: 'D003',
    taskId: 'T125',
    taskTitle: 'مشاهدة فيديو: إعلان كوكاكولا',
    reason: 'شاهدت الفيديو بالكامل لكن لم يتم احتساب المهمة.',
    status: 'pending',
    createdAt: '2025-10-31',
    evidence: []
  }
];

export default function MyDisputes() {
  const [, setLocation] = useLocation();
  const [disputes] = useState<Dispute[]>(mockDisputes);

  const getStatusBadge = (status: Dispute['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            قيد الانتظار
          </Badge>
        );
      case 'under_review':
        return (
          <Badge variant="default" className="gap-1 bg-blue-500">
            <MessageSquare className="w-3 h-3" />
            قيد المراجعة
          </Badge>
        );
      case 'resolved_accepted':
        return (
          <Badge variant="default" className="gap-1 bg-green-500">
            <CheckCircle className="w-3 h-3" />
            تم القبول
          </Badge>
        );
      case 'resolved_rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            تم الرفض
          </Badge>
        );
    }
  };

  const getStatusMessage = (status: Dispute['status']) => {
    switch (status) {
      case 'pending':
        return 'نزاعك في قائمة الانتظار. سيتم مراجعته قريباً.';
      case 'under_review':
        return 'فريقنا يراجع نزاعك الآن. سنرد عليك خلال 24-48 ساعة.';
      case 'resolved_accepted':
        return 'تم قبول نزاعك وإضافة المكافأة لحسابك.';
      case 'resolved_rejected':
        return 'تم رفض نزاعك بعد المراجعة.';
    }
  };

  const activeDisputesCount = disputes.filter(d => 
    d.status === 'pending' || d.status === 'under_review'
  ).length;

  const resolvedDisputesCount = disputes.filter(d => 
    d.status === 'resolved_accepted' || d.status === 'resolved_rejected'
  ).length;

  return (
    <MobileLayout title="نزاعاتي">
      <div className="p-4 space-y-4">
        {/* إحصائيات */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{disputes.length}</div>
            <div className="text-xs text-muted-foreground">إجمالي النزاعات</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-500">{activeDisputesCount}</div>
            <div className="text-xs text-muted-foreground">قيد المراجعة</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-green-500">{resolvedDisputesCount}</div>
            <div className="text-xs text-muted-foreground">تم الحل</div>
          </Card>
        </div>

        {/* قائمة النزاعات */}
        <div className="space-y-3">
          {disputes.map((dispute) => (
            <Card key={dispute.id} className="p-4">
              <div className="space-y-3">
                {/* الرأس */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        {dispute.id}
                      </span>
                      {getStatusBadge(dispute.status)}
                    </div>
                    <h3 className="font-semibold">{dispute.taskTitle}</h3>
                  </div>
                </div>

                {/* السبب */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">سبب النزاع:</div>
                  <p className="text-sm">{dispute.reason}</p>
                </div>

                {/* الأدلة */}
                {dispute.evidence.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      الأدلة المرفقة ({dispute.evidence.length}):
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {dispute.evidence.map((file, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* رسالة الحالة */}
                <div className={`rounded-lg p-3 text-sm ${
                  dispute.status === 'resolved_accepted' ? 'bg-green-50 text-green-700' :
                  dispute.status === 'resolved_rejected' ? 'bg-red-50 text-red-700' :
                  dispute.status === 'under_review' ? 'bg-blue-50 text-blue-700' :
                  'bg-gray-50 text-gray-700'
                }`}>
                  {getStatusMessage(dispute.status)}
                </div>

                {/* قرار الفريق */}
                {dispute.resolution && (
                  <div className="border-t pt-3">
                    <div className="text-xs text-muted-foreground mb-1">قرار الفريق:</div>
                    <p className="text-sm">{dispute.resolution}</p>
                    {dispute.reviewer && (
                      <div className="text-xs text-muted-foreground mt-1">
                        المراجع: {dispute.reviewer}
                      </div>
                    )}
                  </div>
                )}

                {/* التواريخ */}
                <div className="flex justify-between text-xs text-muted-foreground border-t pt-2">
                  <span>تاريخ التقديم: {dispute.createdAt}</span>
                  {dispute.resolvedAt && (
                    <span>تاريخ الحل: {dispute.resolvedAt}</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* زر العودة */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setLocation('/profile')}
        >
          <ChevronLeft className="w-4 h-4 ml-2" />
          العودة للملف الشخصي
        </Button>
      </div>
    </MobileLayout>
  );
}

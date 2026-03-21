import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLocation } from 'wouter';

interface Dispute {
  id: number | string;
  taskId?: string;
  taskTitle?: string;
  campaignName?: string;
  campaignNameAr?: string;
  reason: string;
  status: 'open' | 'pending' | 'under_review' | 'resolved' | 'resolved_accepted' | 'rejected' | 'resolved_rejected';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
  reviewer?: string;
  evidence: string | string[];
}

export default function MyDisputes() {
  const [, setLocation] = useLocation();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const res = await fetch('/api/disputes');
        if (res.ok) {
          const data = await res.json();
          setDisputes(data.disputes || []);
        }
      } catch (err) {
        console.error('Failed to fetch disputes', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDisputes();
  }, []);

  const getStatusBadge = (status: Dispute['status']) => {
    switch (status) {
      case 'open':
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            {isArabic ? 'قيد الانتظار' : 'Pending'}
          </Badge>
        );
      case 'under_review':
        return (
          <Badge variant="default" className="gap-1 bg-blue-500 hover:bg-blue-600">
            <MessageSquare className="w-3 h-3" />
            {isArabic ? 'قيد المراجعة' : 'Under Review'}
          </Badge>
        );
      case 'resolved':
      case 'resolved_accepted':
        return (
          <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3" />
            {isArabic ? 'تم القبول' : 'Accepted'}
          </Badge>
        );
      case 'rejected':
      case 'resolved_rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            {isArabic ? 'تم الرفض' : 'Rejected'}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            {status}
          </Badge>
        );
    }
  };

  const getStatusMessage = (status: Dispute['status']) => {
    switch (status) {
      case 'open':
      case 'pending':
        return isArabic ? 'نزاعك في قائمة الانتظار. سيتم مراجعته قريباً.' : 'Your dispute is in the queue and will be reviewed shortly.';
      case 'under_review':
        return isArabic ? 'فريقنا يراجع نزاعك الآن. سنرد عليك خلال 24-48 ساعة.' : 'Our team is reviewing your dispute. We will respond within 24-48 hours.';
      case 'resolved':
      case 'resolved_accepted':
        return isArabic ? 'تم قبول نزاعك وإضافة المكافأة لحسابك.' : 'Your dispute was accepted and the reward has been added to your account.';
      case 'rejected':
      case 'resolved_rejected':
        return isArabic ? 'تم رفض نزاعك بعد المراجعة.' : 'Your dispute was rejected after review.';
      default:
        return isArabic ? 'حالة النزاع الحالية: ' + status : 'Current dispute status: ' + status;
    }
  };

  const activeDisputesCount = disputes.filter(d => 
    d.status === 'pending' || d.status === 'under_review' || d.status === 'open'
  ).length;

  const resolvedDisputesCount = disputes.filter(d => 
    d.status === 'resolved_accepted' || d.status === 'resolved_rejected' || d.status === 'resolved' || d.status === 'rejected'
  ).length;

  return (
    <MobileLayout title={isArabic ? 'نزاعاتي' : 'My Disputes'}>
      <div className="p-4 space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{disputes.length}</div>
            <div className="text-xs text-muted-foreground">{isArabic ? 'إجمالي النزاعات' : 'Total'}</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-500">{activeDisputesCount}</div>
            <div className="text-xs text-muted-foreground">{isArabic ? 'قيد المراجعة' : 'Active'}</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-green-500">{resolvedDisputesCount}</div>
            <div className="text-xs text-muted-foreground">{isArabic ? 'تم الحل' : 'Resolved'}</div>
          </Card>
        </div>

        {/* Disputes List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground animate-pulse">
              {isArabic ? 'جاري تحميل النزاعات...' : 'Loading disputes...'}
            </div>
          ) : disputes.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              {isArabic ? 'لا توجد لديك أي نزاعات حالياً' : 'You currently have no disputes.'}
            </Card>
          ) : (disputes.map((dispute) => (
            <Card key={dispute.id} className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{dispute.id}
                      </span>
                      {getStatusBadge(dispute.status)}
                    </div>
                    <h3 className="font-semibold text-lg">{isArabic ? (dispute.campaignNameAr || dispute.taskTitle || 'مهمة غير معروفة') : (dispute.campaignName || dispute.taskTitle || 'Unknown Task')}</h3>
                  </div>
                </div>

                {/* Reason */}
                <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">{isArabic ? 'سبب النزاع:' : 'Dispute Reason:'}</div>
                  <p className="text-sm">{dispute.reason}</p>
                </div>

                {/* Evidence */}
                {dispute.evidence && dispute.evidence.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {isArabic ? 'الأدلة المرفقة' : 'Attached Evidence'} ({Array.isArray(dispute.evidence) ? dispute.evidence.length : 1}):
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {Array.isArray(dispute.evidence) ? dispute.evidence.map((file, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs max-w-xs truncate" title={file}>
                          {file}
                        </Badge>
                      )) : (
                        <Badge variant="outline" className="text-xs max-w-xs truncate" title={dispute.evidence}>
                          {dispute.evidence}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Message */}
                <div className={`rounded-lg p-3 text-sm border font-medium ${
                  ['resolved_accepted', 'resolved'].includes(dispute.status) ? 'bg-green-50/50 text-green-700 border-green-200' :
                  ['resolved_rejected', 'rejected'].includes(dispute.status) ? 'bg-red-50/50 text-red-700 border-red-200' :
                  dispute.status === 'under_review' ? 'bg-blue-50/50 text-blue-700 border-blue-200' :
                  'bg-gray-50/50 text-gray-700 border-gray-200'
                }`}>
                  {getStatusMessage(dispute.status)}
                </div>

                {/* Team Decision */}
                {dispute.resolution && (
                  <div className="border-t pt-3">
                    <div className="text-xs text-muted-foreground mb-1">{isArabic ? 'قرار الفريق:' : 'Team Decision:'}</div>
                    <p className="text-sm bg-muted/30 p-2 rounded-md border">{dispute.resolution}</p>
                    {dispute.reviewer && (
                      <div className="text-xs text-muted-foreground mt-2">
                        {isArabic ? 'المراجع:' : 'Reviewer:'} {dispute.reviewer}
                      </div>
                    )}
                  </div>
                )}

                {/* Dates */}
                <div className="flex flex-wrap justify-between text-xs text-muted-foreground border-t pt-2 gap-2 mt-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {isArabic ? 'تاريخ التقديم:' : 'Submitted:'} {new Date(dispute.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                  </span>
                  {dispute.resolvedAt && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {isArabic ? 'تاريخ الحل:' : 'Resolved:'} {new Date(dispute.resolvedAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )))}
        </div>

        {/* Back Button */}
        <Button 
          variant="outline" 
          className="w-full mt-6"
          onClick={() => setLocation('/profile')}
        >
          {isArabic ? <ChevronLeft className="w-4 h-4 ml-2" /> : <ChevronLeft className="w-4 h-4 mr-2" />}
          {isArabic ? 'العودة للملف الشخصي' : 'Back to Profile'}
        </Button>
      </div>
    </MobileLayout>
  );
}

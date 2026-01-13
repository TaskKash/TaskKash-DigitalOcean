import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, X, Eye } from 'lucide-react';

const reports = [
  { id: 1, taskTitle: 'استبيان عن تطبيقات التوصيل', reporter: 'أحمد محمد', reason: 'محتوى غير لائق', description: 'يحتوي على أسئلة غير مناسبة', date: '2024-02-20 10:30', status: 'pending' },
  { id: 2, taskTitle: 'مشاهدة فيديو إعلاني', reporter: 'سارة أحمد', reason: 'محاولة احتيال', description: 'الفيديو لا يعمل ولكن يطلب الإكمال', date: '2024-02-20 09:15', status: 'reviewing' },
  { id: 3, taskTitle: 'تحميل تطبيق الألعاب', reporter: 'محمد علي', reason: 'إساءة استخدام', description: 'التطبيق يطلب صلاحيات غير ضرورية', date: '2024-02-19 16:45', status: 'resolved' },
  { id: 4, taskTitle: 'متابعة حساب انستقرام', reporter: 'فاطمة حسن', reason: 'محتوى مخالف', description: 'الحساب يحتوي على محتوى مخالف', date: '2024-02-19 14:20', status: 'pending' },
  { id: 5, taskTitle: 'تقييم منتج', reporter: 'خالد سعيد', reason: 'spam', description: 'يطلب تقييمات وهمية', date: '2024-02-19 11:30', status: 'rejected' },
  { id: 6, taskTitle: 'استبيان طبي', reporter: 'نورة عبدالله', reason: 'معلومات حساسة', description: 'يطلب معلومات طبية خاصة', date: '2024-02-18 15:50', status: 'reviewing' }
];

export default function ReportedTasks() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredReports = reports.filter(report => 
    statusFilter === 'all' || report.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-0">معلق</Badge>;
      case 'reviewing':
        return <Badge className="bg-blue-100 text-blue-800 border-0">قيد المراجعة</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 border-0">تم الحل</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-0">مرفوض</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-red-900 to-red-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">البلاغات المبلغ عنها</h1>
          <p className="text-lg opacity-90">مراجعة وإدارة البلاغات على المهام</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">إجمالي البلاغات</p>
            <p className="text-3xl font-bold">1,234</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">معلقة</p>
            <p className="text-3xl font-bold text-yellow-600">234</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">قيد المراجعة</p>
            <p className="text-3xl font-bold text-blue-600">89</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">تم الحل</p>
            <p className="text-3xl font-bold text-primary">911</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
            >
              الكل
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('pending')}
            >
              معلق
            </Button>
            <Button
              variant={statusFilter === 'reviewing' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('reviewing')}
            >
              قيد المراجعة
            </Button>
            <Button
              variant={statusFilter === 'resolved' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('resolved')}
            >
              تم الحل
            </Button>
            <Button
              variant={statusFilter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('rejected')}
            >
              مرفوض
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{report.taskTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      بلاغ من: <span className="font-medium">{report.reporter}</span>
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{report.reason}</Badge>
                      {getStatusBadge(report.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{report.date}</p>
              </div>
              
              {report.status === 'pending' || report.status === 'reviewing' ? (
                <div className="flex gap-2 pt-4 border-t">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 ml-2" />
                    عرض المهمة
                  </Button>
                  <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                    قبول البلاغ
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600">
                    <X className="w-4 h-4 ml-2" />
                    رفض البلاغ
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 ml-2" />
                    عرض التفاصيل
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}


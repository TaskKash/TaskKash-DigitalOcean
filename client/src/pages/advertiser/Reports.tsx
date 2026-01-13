import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, FileText, TrendingUp, Users, Target } from 'lucide-react';

const reports = [
  {
    id: '1',
    name: 'تقرير الأداء الشهري',
    type: 'performance',
    period: 'أكتوبر 2025',
    generatedDate: '2025-10-26',
    size: '2.4 MB',
    format: 'PDF'
  },
  {
    id: '2',
    name: 'تقرير التفاعل مع المهام',
    type: 'engagement',
    period: 'أكتوبر 2025',
    generatedDate: '2025-10-25',
    size: '1.8 MB',
    format: 'Excel'
  },
  {
    id: '3',
    name: 'تقرير الديموغرافيا',
    type: 'demographics',
    period: 'أكتوبر 2025',
    generatedDate: '2025-10-24',
    size: '1.2 MB',
    format: 'PDF'
  },
  {
    id: '4',
    name: 'تقرير الميزانية والمصروفات',
    type: 'financial',
    period: 'أكتوبر 2025',
    generatedDate: '2025-10-23',
    size: '890 KB',
    format: 'Excel'
  }
];

const quickStats = [
  { label: 'إجمالي المشاهدات', value: '37,042', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'معدل الإكمال', value: '68.3%', icon: Target, color: 'text-primary', bg: 'bg-green-100' },
  { label: 'التكلفة الإجمالية', value: '151,500 ج.م', icon: TrendingUp, color: 'text-secondary', bg: 'bg-orange-100' }
];

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('october-2025');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">التقارير</h1>
          <p className="text-sm text-muted-foreground">تقارير شاملة عن أداء حملاتك</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Period Selector */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-semibold">الفترة الزمنية</h3>
                <p className="text-sm text-muted-foreground">اختر الفترة لعرض التقارير</p>
              </div>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="october-2025">أكتوبر 2025</SelectItem>
                <SelectItem value="september-2025">سبتمبر 2025</SelectItem>
                <SelectItem value="august-2025">أغسطس 2025</SelectItem>
                <SelectItem value="q3-2025">الربع الثالث 2025</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Available Reports */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">التقارير المتاحة</h2>
            <Button>
              <FileText className="w-5 h-5 ml-2" />
              إنشاء تقرير جديد
            </Button>
          </div>

          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{report.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span>{report.period}</span>
                      <span>•</span>
                      <span>{report.generatedDate}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-muted rounded text-xs font-medium">
                        {report.format}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">أنواع التقارير</h3>
            <div className="space-y-3">
              {[
                { name: 'تقرير الأداء', desc: 'نظرة شاملة على أداء الحملات' },
                { name: 'تقرير التفاعل', desc: 'تحليل تفاعل المستخدمين' },
                { name: 'تقرير الديموغرافيا', desc: 'توزيع الجمهور المستهدف' },
                { name: 'تقرير مالي', desc: 'الميزانية والمصروفات' }
              ].map((type, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">{type.name}</p>
                    <p className="text-sm text-muted-foreground">{type.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">جدولة التقارير</h3>
            <p className="text-sm text-muted-foreground mb-4">
              احصل على تقارير دورية تلقائياً عبر البريد الإلكتروني
            </p>
            <div className="space-y-3">
              {['يومي', 'أسبوعي', 'شهري', 'ربع سنوي'].map((freq, index) => (
                <button
                  key={index}
                  className="w-full p-3 border rounded-lg text-right hover:bg-muted/50 transition-colors"
                >
                  <p className="font-medium">{freq}</p>
                  <p className="text-sm text-muted-foreground">إرسال تلقائي كل {freq.toLowerCase()}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


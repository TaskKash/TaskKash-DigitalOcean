import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, TrendingUp, TrendingDown, Eye, Users,
  CheckCircle2, XCircle, Clock, DollarSign, Target,
  Calendar, Download
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function CampaignPerformance() {
  const [, setLocation] = useLocation();

  const metrics = [
    { label: 'إجمالي المشاهدات', value: '12,450', change: '+15%', trend: 'up', icon: Eye },
    { label: 'معدل التحويل', value: '3.8%', change: '+0.5%', trend: 'up', icon: Target },
    { label: 'المهام المكتملة', value: '470', change: '+12%', trend: 'up', icon: CheckCircle2 },
    { label: 'متوسط الوقت', value: '4.2 دقيقة', change: '-0.3', trend: 'down', icon: Clock },
    { label: 'التكلفة لكل مهمة', value: '50 ج.م', change: '0%', trend: 'neutral', icon: DollarSign },
    { label: 'معدل الرفض', value: '8.7%', change: '-2.1%', trend: 'down', icon: XCircle }
  ];

  const dailyStats = [
    { date: '15 يناير', views: 450, tasks: 18, conversions: 4.0 },
    { date: '16 يناير', views: 520, tasks: 22, conversions: 4.2 },
    { date: '17 يناير', views: 480, tasks: 19, conversions: 4.0 },
    { date: '18 يناير', views: 610, tasks: 25, conversions: 4.1 },
    { date: '19 يناير', views: 580, tasks: 24, conversions: 4.1 },
    { date: '20 يناير', views: 690, tasks: 28, conversions: 4.1 },
    { date: '21 يناير', views: 720, tasks: 31, conversions: 4.3 }
  ];

  const topPerformers = [
    { user: 'أحمد محمد', tasks: 12, quality: 98, earnings: 600 },
    { user: 'فاطمة علي', tasks: 10, quality: 96, earnings: 500 },
    { user: 'محمد سعيد', tasks: 9, quality: 94, earnings: 450 },
    { user: 'نورة خالد', tasks: 8, quality: 92, earnings: 400 },
    { user: 'عبدالله أحمد', tasks: 7, quality: 90, earnings: 350 }
  ];

  const demographics = [
    { segment: '18-24 سنة', percentage: 28, tasks: 132 },
    { segment: '25-34 سنة', percentage: 42, tasks: 198 },
    { segment: '35-44 سنة', percentage: 20, tasks: 94 },
    { segment: '45+ سنة', percentage: 10, tasks: 46 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setLocation('/advertiser/campaigns/1')}
            className="flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            العودة إلى تفاصيل الحملة
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">أداء الحملة</h1>
              <p className="text-sm text-muted-foreground">
                تحليل شامل لأداء حملة إطلاق المنتج الجديد
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 ml-2" />
              تحميل التقرير
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  metric.trend === 'up' ? 'bg-green-100' :
                  metric.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <metric.icon className={`w-6 h-6 ${
                    metric.trend === 'up' ? 'text-primary' :
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`} />
                </div>
                <Badge className={`${
                  metric.trend === 'up' ? 'bg-green-100 text-green-800' :
                  metric.trend === 'down' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                } border-0`}>
                  {metric.trend === 'up' && <TrendingUp className="w-3 h-3 ml-1" />}
                  {metric.trend === 'down' && <TrendingDown className="w-3 h-3 ml-1" />}
                  {metric.change}
                </Badge>
              </div>
              <p className="text-3xl font-bold mb-1">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Performance */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              الأداء اليومي
            </h2>
            <div className="space-y-3">
              {dailyStats.map((day, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{day.date}</span>
                    <Badge variant="outline">{day.conversions}% تحويل</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">المشاهدات</p>
                      <p className="font-semibold">{day.views.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">المهام</p>
                      <p className="font-semibold">{day.tasks}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Performers */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              أفضل المستخدمين
            </h2>
            <div className="space-y-3">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{performer.user}</p>
                    <p className="text-sm text-muted-foreground">
                      {performer.tasks} مهمة • جودة {performer.quality}%
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-primary">{performer.earnings} ج.م</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Demographics */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              التوزيع الديموغرافي
            </h2>
            <div className="space-y-4">
              {demographics.map((demo, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{demo.segment}</span>
                    <span className="text-sm text-muted-foreground">
                      {demo.tasks} مهمة ({demo.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${demo.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Performance Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">ملخص الأداء</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-green-900">نقاط القوة</h3>
                </div>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• معدل تحويل أعلى من المتوسط (+15%)</li>
                  <li>• جودة عالية للمهام المكتملة (95%)</li>
                  <li>• نمو مستمر في المشاهدات اليومية</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-900">فرص التحسين</h3>
                </div>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• تحسين الاستهداف للفئة 45+</li>
                  <li>• تقليل معدل الرفض (حالياً 8.7%)</li>
                  <li>• زيادة التفاعل في عطلة نهاية الأسبوع</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">الأداء المالي</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700">المصروف</p>
                    <p className="font-bold text-blue-900">23,500 ج.م</p>
                  </div>
                  <div>
                    <p className="text-blue-700">المتبقي</p>
                    <p className="font-bold text-blue-900">26,500 ج.م</p>
                  </div>
                  <div>
                    <p className="text-blue-700">التكلفة/مهمة</p>
                    <p className="font-bold text-blue-900">50 ج.م</p>
                  </div>
                  <div>
                    <p className="text-blue-700">ROI المتوقع</p>
                    <p className="font-bold text-primary">+125%</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


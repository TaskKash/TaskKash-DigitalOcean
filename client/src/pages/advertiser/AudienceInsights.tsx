import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, TrendingUp, MapPin, Clock, Smartphone,
  Calendar, Target, Eye
} from 'lucide-react';

export default function AudienceInsights() {
  const demographics = [
    { age: '18-24', percentage: 25, count: 12500 },
    { age: '25-34', percentage: 35, count: 17500 },
    { age: '35-44', percentage: 22, count: 11000 },
    { age: '45-54', percentage: 12, count: 6000 },
    { age: '55+', percentage: 6, count: 3000 }
  ];

  const cities = [
    { name: 'الرياض', percentage: 35, count: 17500 },
    { name: 'جدة', percentage: 28, count: 14000 },
    { name: 'الدمام', percentage: 15, count: 7500 },
    { name: 'مكة', percentage: 10, count: 5000 },
    { name: 'المدينة', percentage: 7, count: 3500 },
    { name: 'أخرى', percentage: 5, count: 2500 }
  ];

  const interests = [
    { name: 'تقنية', count: 25000, growth: '+12%' },
    { name: 'تسوق', count: 22000, growth: '+8%' },
    { name: 'أعمال', count: 18000, growth: '+15%' },
    { name: 'رياضة', count: 15000, growth: '+5%' },
    { name: 'سفر', count: 12000, growth: '+10%' },
    { name: 'طعام', count: 10000, growth: '+7%' }
  ];

  const devices = [
    { type: 'iOS', percentage: 55, count: 27500 },
    { type: 'Android', percentage: 42, count: 21000 },
    { type: 'أخرى', percentage: 3, count: 1500 }
  ];

  const activeHours = [
    { hour: '9 ص', activity: 45 },
    { hour: '12 م', activity: 75 },
    { hour: '3 م', activity: 65 },
    { hour: '6 م', activity: 85 },
    { hour: '9 م', activity: 95 },
    { hour: '12 ص', activity: 35 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">رؤى الجمهور</h1>
          <p className="text-sm text-muted-foreground">
            تحليل شامل لجمهورك المستهدف
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">50K</p>
                <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">+12%</p>
                <p className="text-sm text-muted-foreground">النمو الشهري</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">85%</p>
                <p className="text-sm text-muted-foreground">معدل التفاعل</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Eye className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-3xl font-bold">2.5M</p>
                <p className="text-sm text-muted-foreground">المشاهدات</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Age Demographics */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              التوزيع العمري
            </h2>
            <div className="space-y-4">
              {demographics.map((demo, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{demo.age} سنة</span>
                    <span className="text-sm text-muted-foreground">
                      {demo.count.toLocaleString()} ({demo.percentage}%)
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

          {/* Gender Distribution */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              التوزيع الجنسي
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <div className="text-4xl">👨</div>
                  </div>
                  <p className="text-2xl font-bold">58%</p>
                  <p className="text-sm text-muted-foreground">ذكور</p>
                  <p className="text-xs text-muted-foreground mt-1">29,000 مستخدم</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-pink-100 flex items-center justify-center mb-3">
                    <div className="text-4xl">👩</div>
                  </div>
                  <p className="text-2xl font-bold">42%</p>
                  <p className="text-sm text-muted-foreground">إناث</p>
                  <p className="text-xs text-muted-foreground mt-1">21,000 مستخدم</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Geographic Distribution */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              التوزيع الجغرافي
            </h2>
            <div className="space-y-4">
              {cities.map((city, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{city.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {city.count.toLocaleString()} ({city.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${city.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Device Types */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              أنواع الأجهزة
            </h2>
            <div className="space-y-4">
              {devices.map((device, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{device.type}</span>
                    <span className="text-sm text-muted-foreground">
                      {device.count.toLocaleString()} ({device.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Interests */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              الاهتمامات
            </h2>
            <div className="space-y-3">
              {interests.map((interest, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{interest.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {interest.count.toLocaleString()} مستخدم
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-0">
                    {interest.growth}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Active Hours */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              ساعات النشاط
            </h2>
            <div className="space-y-4">
              {activeHours.map((hour, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{hour.hour}</span>
                    <span className="text-sm text-muted-foreground">
                      {hour.activity}% نشاط
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all"
                      style={{ width: `${hour.activity}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Insights Card */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">💡 رؤى ذكية</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• أفضل وقت للنشر: 9 مساءً - 12 صباحاً</li>
            <li>• الفئة العمرية الأكثر تفاعلاً: 25-34 سنة</li>
            <li>• المدن ذات أعلى معدل إكمال: الرياض وجدة</li>
            <li>• الاهتمامات الأسرع نمواً: أعمال (+15%) وتقنية (+12%)</li>
            <li>• مستخدمو iOS لديهم معدل إكمال أعلى بـ 8%</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}


import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from "@/contexts/CurrencyContext";
import { 
  TrendingUp, TrendingDown, Target, DollarSign,
  Users, Clock, Star, AlertTriangle
} from 'lucide-react';

const competitors = [
  {
    name: 'منافس A',
    campaigns: 45,
    avgReward: 45,
    avgTasks: 850,
    avgDuration: 4.5,
    engagement: 82,
    growth: '+15%',
    trend: 'up'
  },
  {
    name: 'منافس B',
    campaigns: 38,
    avgReward: 55,
    avgTasks: 720,
    avgDuration: 5.2,
    engagement: 78,
    growth: '+8%',
    trend: 'up'
  },
  {
    name: 'منافس C',
    campaigns: 52,
    avgReward: 40,
    avgTasks: 950,
    avgDuration: 3.8,
    engagement: 85,
    growth: '-3%',
    trend: 'down'
  },
  {
    name: 'أنت',
    campaigns: 12,
    avgReward: 50,
    avgTasks: 800,
    avgDuration: 4.2,
    engagement: 85,
    growth: '+12%',
    trend: 'up',
    isYou: true
  }
];

const insights = [
  {
    type: 'opportunity',
    title: 'فرصة: زيادة المكافآت',
    description: 'منافسوك يقدمون مكافآت أعلى بنسبة 10%. فكر في زيادة المكافآت لجذب المزيد من المستخدمين.',
    icon: DollarSign,
    color: 'green'
  },
  {
    type: 'threat',
    title: 'تهديد: عدد الحملات',
    description: 'منافسوك لديهم عدد حملات أكبر بـ 3-4 أضعاف. زيادة عدد الحملات قد يحسن ظهورك.',
    icon: AlertTriangle,
    color: 'red'
  },
  {
    type: 'strength',
    title: 'قوة: معدل التفاعل',
    description: 'معدل تفاعلك (85%) يضاهي أفضل المنافسين. استمر في الحفاظ على هذا المستوى.',
    icon: Star,
    color: 'blue'
  },
  {
    type: 'opportunity',
    title: 'فرصة: تقليل المدة',
    description: 'منافس C يحقق نجاحاً بمهام أقصر (3.8 دقيقة). جرب تقليل مدة المهام.',
    icon: Clock,
    color: 'green'
  }
];

const marketShare = [
  { name: 'منافس C', share: 32, color: 'bg-blue-600' },
  { name: 'منافس A', share: 28, color: 'bg-green-600' },
  { name: 'منافس B', share: 24, color: 'bg-purple-600' },
  { name: 'أنت', share: 8, color: 'bg-orange-600' },
  { name: 'آخرون', share: 8, color: 'bg-gray-400' }
];

export default function CompetitorAnalysis() {
  const { currency, symbol, formatAmount } = useCurrency();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">تحليل المنافسين</h1>
          <p className="text-sm text-muted-foreground">
            قارن أداءك مع المنافسين الرئيسيين في السوق
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Market Share */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">حصة السوق</h2>
          <div className="space-y-4">
            <div className="flex gap-1 h-12 rounded-lg overflow-hidden">
              {marketShare.map((item, index) => (
                <div
                  key={index}
                  className={`${item.color} flex items-center justify-center text-white font-semibold text-sm transition-all hover:opacity-80`}
                  style={{ width: `${item.share}%` }}
                  title={`${item.name}: ${item.share}%`}
                >
                  {item.share}%
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              {marketShare.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${item.color}`} />
                  <span className="text-sm">{item.name} ({item.share}%)</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Competitors Comparison */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">مقارنة المنافسين</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4 font-semibold">المنافس</th>
                  <th className="text-center py-3 px-4 font-semibold">الحملات</th>
                  <th className="text-center py-3 px-4 font-semibold">متوسط المكافأة</th>
                  <th className="text-center py-3 px-4 font-semibold">متوسط المهام</th>
                  <th className="text-center py-3 px-4 font-semibold">المدة</th>
                  <th className="text-center py-3 px-4 font-semibold">التفاعل</th>
                  <th className="text-center py-3 px-4 font-semibold">النمو</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp, index) => (
                  <tr
                    key={index}
                    className={`border-b ${comp.isYou ? 'bg-primary/5' : ''}`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{comp.name}</span>
                        {comp.isYou && (
                          <Badge className="bg-primary text-primary-foreground border-0">
                            أنت
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">{comp.campaigns}</td>
                    <td className="text-center py-4 px-4">{comp.avgReward} {symbol}</td>
                    <td className="text-center py-4 px-4">{comp.avgTasks}</td>
                    <td className="text-center py-4 px-4">{comp.avgDuration} دقيقة</td>
                    <td className="text-center py-4 px-4">{comp.engagement}%</td>
                    <td className="text-center py-4 px-4">
                      <Badge className={`${
                        comp.trend === 'up'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      } border-0`}>
                        {comp.trend === 'up' ? (
                          <TrendingUp className="w-3 h-3 ml-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 ml-1" />
                        )}
                        {comp.growth}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <Card
              key={index}
              className={`p-6 border-2 ${
                insight.color === 'green'
                  ? 'border-green-200 bg-green-50'
                  : insight.color === 'red'
                  ? 'border-red-200 bg-red-50'
                  : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  insight.color === 'green'
                    ? 'bg-green-100'
                    : insight.color === 'red'
                    ? 'bg-red-100'
                    : 'bg-blue-100'
                }`}>
                  <insight.icon className={`w-6 h-6 ${
                    insight.color === 'green'
                      ? 'text-primary'
                      : insight.color === 'red'
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-2 ${
                    insight.color === 'green'
                      ? 'text-green-900'
                      : insight.color === 'red'
                      ? 'text-red-900'
                      : 'text-blue-900'
                  }`}>
                    {insight.title}
                  </h3>
                  <p className={`text-sm ${
                    insight.color === 'green'
                      ? 'text-green-800'
                      : insight.color === 'red'
                      ? 'text-red-800'
                      : 'text-blue-800'
                  }`}>
                    {insight.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Benchmarks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">متوسط السوق</p>
                <p className="text-2xl font-bold">47.5 {symbol}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              متوسط المكافأة في السوق
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">متوسط السوق</p>
                <p className="text-2xl font-bold">830</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              متوسط عدد المهام لكل حملة
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">متوسط السوق</p>
                <p className="text-2xl font-bold">81.2%</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              متوسط معدل التفاعل
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}


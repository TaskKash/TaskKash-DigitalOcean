import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, TrendingUp, Users, Target, Quote,
  Play, Eye
} from 'lucide-react';

const stories = [
  {
    id: '1',
    company: 'شركة التقنية الذكية',
    logo: '🚀',
    industry: 'تقنية',
    title: 'زيادة الوعي بالمنتج بنسبة 250%',
    description: 'استخدمنا TASKKASH لإطلاق منتجنا الجديد وحققنا نتائج مذهلة في أول أسبوعين',
    metrics: [
      { label: 'المشاهدات', value: '50K+', icon: Eye },
      { label: 'المستخدمون', value: '12K+', icon: Users },
      { label: 'معدل التحويل', value: '4.8%', icon: Target },
      { label: 'ROI', value: '+320%', icon: TrendingUp }
    ],
    quote: 'TASKKASH ساعدنا في الوصول إلى جمهورنا المستهدف بدقة عالية وتكلفة معقولة. النتائج فاقت توقعاتنا بكثير.',
    author: 'أحمد محمد',
    position: 'مدير التسويق',
    rating: 5,
    image: '/placeholder-campaign.jpg',
    hasVideo: true
  },
  {
    id: '2',
    company: 'متجر الأزياء العصري',
    logo: '👗',
    industry: 'تجارة إلكترونية',
    title: 'مضاعفة المبيعات في شهر واحد',
    description: 'حملتنا على TASKKASH جلبت لنا آلاف العملاء الجدد وزادت مبيعاتنا بشكل كبير',
    metrics: [
      { label: 'المبيعات', value: '+180%', icon: TrendingUp },
      { label: 'العملاء الجدد', value: '8.5K', icon: Users },
      { label: 'متوسط الطلب', value: '450 ج.م', icon: Target },
      { label: 'معدل العودة', value: '65%', icon: Star }
    ],
    quote: 'المنصة سهلة الاستخدام والنتائج واضحة وقابلة للقياس. ننصح بها بشدة لأي شركة تريد النمو السريع.',
    author: 'فاطمة علي',
    position: 'مديرة المتجر',
    rating: 5,
    image: '/placeholder-fashion.jpg',
    hasVideo: false
  },
  {
    id: '3',
    company: 'تطبيق الصحة واللياقة',
    logo: '💪',
    industry: 'صحة',
    title: 'مليون تحميل في 3 أشهر',
    description: 'وصلنا إلى مليون مستخدم نشط بفضل حملاتنا المستهدفة على TASKKASH',
    metrics: [
      { label: 'التحميلات', value: '1M+', icon: TrendingUp },
      { label: 'المستخدمون النشطون', value: '650K', icon: Users },
      { label: 'التقييم', value: '4.8/5', icon: Star },
      { label: 'الاحتفاظ', value: '72%', icon: Target }
    ],
    quote: 'الاستهداف الدقيق والجودة العالية للمستخدمين جعلت حملتنا ناجحة جداً. شكراً TASKKASH!',
    author: 'محمد سعيد',
    position: 'المدير التنفيذي',
    rating: 5,
    image: '/placeholder-fitness.jpg',
    hasVideo: true
  },
  {
    id: '4',
    company: 'مطعم الذواقة',
    logo: '🍽️',
    industry: 'مطاعم',
    title: 'زيادة الطلبات عبر الإنترنت بنسبة 400%',
    description: 'حملتنا الترويجية على TASKKASH جلبت لنا عملاء جدد وزادت طلباتنا بشكل هائل',
    metrics: [
      { label: 'الطلبات', value: '+400%', icon: TrendingUp },
      { label: 'العملاء الجدد', value: '5.2K', icon: Users },
      { label: 'متوسط الطلب', value: '180 ج.م', icon: Target },
      { label: 'التقييمات', value: '4.9/5', icon: Star }
    ],
    quote: 'أفضل استثمار تسويقي قمنا به. النتائج سريعة والتكلفة معقولة جداً مقارنة بالقنوات الأخرى.',
    author: 'نورة خالد',
    position: 'مديرة التسويق',
    rating: 5,
    image: '/placeholder-restaurant.jpg',
    hasVideo: false
  }
];

export default function SuccessStories() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">قصص النجاح</h1>
          <p className="text-lg opacity-90">
            اكتشف كيف ساعدت TASKKASH الشركات على تحقيق أهدافها
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 text-center">
            <p className="text-4xl font-bold text-primary mb-2">500+</p>
            <p className="text-sm text-muted-foreground">حملة ناجحة</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-4xl font-bold text-primary mb-2">98%</p>
            <p className="text-sm text-muted-foreground">معدل الرضا</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-4xl font-bold text-primary mb-2">+250%</p>
            <p className="text-sm text-muted-foreground">متوسط ROI</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-4xl font-bold text-primary mb-2">2M+</p>
            <p className="text-sm text-muted-foreground">مستخدم نشط</p>
          </Card>
        </div>

        {/* Success Stories */}
        <div className="space-y-8">
          {stories.map((story) => (
            <Card key={story.id} className="overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image/Video Side */}
                <div className="relative bg-gradient-to-br from-primary/20 to-secondary/20 p-12 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">{story.logo}</div>
                    {story.hasVideo && (
                      <Button variant="outline" className="bg-white">
                        <Play className="w-4 h-4 ml-2" />
                        مشاهدة الفيديو
                      </Button>
                    )}
                  </div>
                </div>

                {/* Content Side */}
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">{story.industry}</Badge>
                    <div className="flex gap-1">
                      {Array.from({ length: story.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-2">{story.title}</h2>
                  <p className="text-lg font-semibold text-primary mb-4">{story.company}</p>
                  <p className="text-muted-foreground mb-6">{story.description}</p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {story.metrics.map((metric, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <metric.icon className="w-4 h-4 text-primary" />
                          <p className="text-sm text-muted-foreground">{metric.label}</p>
                        </div>
                        <p className="text-2xl font-bold">{metric.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="p-4 rounded-lg bg-primary/5 border-r-4 border-primary mb-4">
                    <Quote className="w-6 h-6 text-primary mb-2" />
                    <p className="text-sm italic mb-3">{story.quote}</p>
                    <div>
                      <p className="font-semibold">{story.author}</p>
                      <p className="text-sm text-muted-foreground">{story.position}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="p-8 text-center bg-gradient-to-r from-primary/10 to-secondary/10">
          <h2 className="text-2xl font-bold mb-4">هل أنت مستعد لكتابة قصة نجاحك؟</h2>
          <p className="text-muted-foreground mb-6">
            انضم إلى مئات الشركات الناجحة واستخدم TASKKASH لتحقيق أهدافك التسويقية
          </p>
          <Button size="lg" className="px-8">
            ابدأ حملتك الآن
          </Button>
        </Card>
      </div>
    </div>
  );
}


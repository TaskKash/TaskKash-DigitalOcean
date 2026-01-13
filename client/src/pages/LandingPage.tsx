import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, DollarSign, Target, TrendingUp, Users, Building2,
  CheckCircle2, Star, Clock, Shield, Zap, ArrowRight
} from 'lucide-react';
import { useLocation } from 'wouter';

const features = [
  {
    icon: Smartphone,
    title: 'اربح من هاتفك',
    description: 'نفذ مهام بسيطة من أي مكان وفي أي وقت'
  },
  {
    icon: DollarSign,
    title: 'سحب فوري',
    description: 'احصل على أموالك فوراً بدون حد أدنى'
  },
  {
    icon: Shield,
    title: 'آمن ومضمون',
    description: 'منصة موثوقة بنسبة 100%'
  },
  {
    icon: Clock,
    title: 'مهام سريعة',
    description: 'كل مهمة تستغرق دقائق معدودة فقط'
  }
];

const advertiserFeatures = [
  {
    icon: Target,
    title: 'استهداف دقيق',
    description: 'وصول مباشر لجمهورك المستهدف'
  },
  {
    icon: TrendingUp,
    title: 'نتائج قابلة للقياس',
    description: 'تقارير مفصلة وتحليلات دقيقة'
  },
  {
    icon: Zap,
    title: 'سرعة في التنفيذ',
    description: 'حملات تبدأ في دقائق وليس أيام'
  },
  {
    icon: DollarSign,
    title: 'تكلفة أقل',
    description: 'وفر حتى 60% من ميزانيتك التسويقية'
  }
];

const testimonials = [
  {
    name: 'أحمد محمد',
    role: 'مستخدم',
    image: '👨',
    text: 'ربحت أكثر من 5000 ريال في شهرين! التطبيق سهل جداً والمهام بسيطة.',
    rating: 5
  },
  {
    name: 'سارة أحمد',
    role: 'مستخدمة',
    image: '👩',
    text: 'أفضل تطبيق للربح من الإنترنت جربته. السحب سريع والدعم ممتاز.',
    rating: 5
  },
  {
    name: 'شركة التقنية الحديثة',
    role: 'معلن',
    image: '🏢',
    text: 'حصلنا على 10,000 مستخدم حقيقي في أسبوع واحد. النتائج مذهلة!',
    rating: 5
  }
];

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <Badge className="bg-white/20 text-white border-0 px-4 py-2 mb-6">
              ✨ انضم إلى أكثر من 125,000 مستخدم
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              اربح المال من هاتفك<br />في دقائق معدودة
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              TASKKASH هي المنصة الأولى في السعودية التي تربط بين المستخدمين والمعلنين
              لتحقيق دخل إضافي من خلال مهام بسيطة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8"
                onClick={() => setLocation('/register')}
              >
                ابدأ الآن كمستخدم
                <ArrowRight className="w-5 h-5 mr-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8"
                onClick={() => setLocation('/advertiser/register')}
              >
                سجل كمعلن
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div>
                <p className="text-4xl font-bold mb-1">125K+</p>
                <p className="text-sm opacity-80">مستخدم نشط</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-1">2.8K+</p>
                <p className="text-sm opacity-80">معلن</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-1">458K+</p>
                <p className="text-sm opacity-80">مهمة مكتملة</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-1">4.8/5</p>
                <p className="text-sm opacity-80">تقييم المستخدمين</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Users */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">لماذا TASKKASH للمستخدمين؟</h2>
            <p className="text-xl text-muted-foreground">
              أسهل طريقة لكسب المال من هاتفك
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">كيف تبدأ في 4 خطوات</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'سجل حسابك', desc: 'إنشاء حساب مجاني في دقيقة' },
              { num: '2', title: 'اختر المهام', desc: 'تصفح آلاف المهام المتاحة' },
              { num: '3', title: 'أكمل المهام', desc: 'نفذ المهام من هاتفك' },
              { num: '4', title: 'اسحب أرباحك', desc: 'احصل على أموالك فوراً' }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
                {index < 3 && (
                  <ArrowRight className="hidden md:block absolute top-8 -left-4 w-8 h-8 text-primary" />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" onClick={() => setLocation('/register')}>
              ابدأ الآن مجاناً
            </Button>
          </div>
        </div>
      </section>

      {/* For Advertisers */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">للمعلنين: وصول مباشر لجمهورك</h2>
            <p className="text-xl text-muted-foreground">
              حلول تسويقية مبتكرة بتكلفة أقل ونتائج أفضل
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advertiserFeatures.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" onClick={() => setLocation('/advertiser/register')}>
              ابدأ حملتك الأولى
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">ماذا يقول عملاؤنا</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground">{testimonial.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 bg-gradient-to-r from-primary to-secondary text-white text-center">
            <h2 className="text-4xl font-bold mb-4">هل أنت مستعد للبدء؟</h2>
            <p className="text-xl mb-8 opacity-90">
              انضم إلى آلاف المستخدمين والمعلنين الذين يستخدمون TASKKASH يومياً
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => setLocation('/register')}
              >
                سجل كمستخدم
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => setLocation('/advertiser/register')}
              >
                سجل كمعلن
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}


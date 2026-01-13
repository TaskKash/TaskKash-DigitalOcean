import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, Search, CheckCircle2, Wallet, Building2,
  Target, Users, TrendingUp, Play
} from 'lucide-react';
import { useLocation } from 'wouter';

const userSteps = [
  {
    icon: UserPlus,
    title: 'سجل حسابك',
    description: 'أنشئ حساباً مجانياً في دقائق معدودة باستخدام بريدك الإلكتروني أو حسابات التواصل الاجتماعي',
    color: 'blue'
  },
  {
    icon: Search,
    title: 'اختر المهام',
    description: 'تصفح آلاف المهام المتاحة واختر ما يناسبك من استبيانات، مشاهدة فيديو، تجربة تطبيقات وغيرها',
    color: 'purple'
  },
  {
    icon: CheckCircle2,
    title: 'أكمل المهام',
    description: 'نفذ المهام بسهولة من هاتفك في أي وقت ومكان، كل مهمة تستغرق دقائق معدودة فقط',
    color: 'green'
  },
  {
    icon: Wallet,
    title: 'اسحب أرباحك',
    description: 'احصل على أموالك فوراً عبر التحويل البنكي أو المحافظ الإلكترونية بدون حد أدنى للسحب',
    color: 'orange'
  }
];

const advertiserSteps = [
  {
    icon: Building2,
    title: 'أنشئ حسابك',
    description: 'سجل كمعلن وأضف معلومات شركتك للبدء في الوصول إلى جمهورك المستهدف',
    color: 'blue'
  },
  {
    icon: Target,
    title: 'أنشئ حملتك',
    description: 'حدد نوع المهمة، الجمهور المستهدف، والميزانية بسهولة من خلال واجهة بسيطة وواضحة',
    color: 'purple'
  },
  {
    icon: Users,
    title: 'راجع النتائج',
    description: 'راقب أداء حملتك في الوقت الفعلي وراجع المهام المكتملة للتأكد من الجودة',
    color: 'green'
  },
  {
    icon: TrendingUp,
    title: 'حلل البيانات',
    description: 'احصل على تقارير مفصلة وإحصائيات دقيقة لقياس نجاح حملتك وتحسين استراتيجيتك',
    color: 'orange'
  }
];

const benefits = [
  {
    title: 'للمستخدمين',
    points: [
      'اربح المال من هاتفك في أي وقت ومكان',
      'مهام بسيطة وسريعة لا تستغرق وقتاً طويلاً',
      'سحب فوري بدون حد أدنى',
      'آمن ومضمون 100%',
      'دعم فني متاح 24/7'
    ],
    color: 'from-blue-500 to-purple-500'
  },
  {
    title: 'للمعلنين',
    points: [
      'وصول مباشر لجمهور حقيقي ومستهدف',
      'تكلفة أقل من القنوات التقليدية',
      'نتائج قابلة للقياس والتحليل',
      'مرونة كاملة في الميزانية والاستهداف',
      'جودة عالية للبيانات والمهام'
    ],
    color: 'from-green-500 to-secondary-500'
  }
];

export default function HowItWorks() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">كيف يعمل TASKKASH؟</h1>
          <p className="text-xl opacity-90 mb-8">
            منصة بسيطة تربط بين المستخدمين الباحثين عن دخل إضافي والمعلنين الباحثين عن جمهور حقيقي
          </p>
          <Button
            size="lg"
            variant="outline"
            className="bg-white text-primary hover:bg-white/90"
          >
            <Play className="w-5 h-5 ml-2" />
            شاهد الفيديو التوضيحي
          </Button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* For Users */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">للمستخدمين: اربح المال بسهولة</h2>
            <p className="text-lg text-muted-foreground">
              4 خطوات بسيطة لتبدأ في كسب المال من هاتفك
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userSteps.map((step, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  step.color === 'blue' ? 'bg-blue-100' :
                  step.color === 'purple' ? 'bg-purple-100' :
                  step.color === 'green' ? 'bg-green-100' :
                  'bg-orange-100'
                }`}>
                  <step.icon className={`w-8 h-8 ${
                    step.color === 'blue' ? 'text-blue-600' :
                    step.color === 'purple' ? 'text-purple-600' :
                    step.color === 'green' ? 'text-primary' :
                    'text-secondary'
                  }`} />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4 font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" onClick={() => setLocation('/register')}>
              ابدأ الآن كمستخدم
            </Button>
          </div>
        </section>

        {/* For Advertisers */}
        <section className="bg-muted/50 -mx-4 px-4 py-12 rounded-lg">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">للمعلنين: وصول مباشر لجمهورك</h2>
            <p className="text-lg text-muted-foreground">
              4 خطوات لإطلاق حملة تسويقية ناجحة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advertiserSteps.map((step, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  step.color === 'blue' ? 'bg-blue-100' :
                  step.color === 'purple' ? 'bg-purple-100' :
                  step.color === 'green' ? 'bg-green-100' :
                  'bg-orange-100'
                }`}>
                  <step.icon className={`w-8 h-8 ${
                    step.color === 'blue' ? 'text-blue-600' :
                    step.color === 'purple' ? 'text-purple-600' :
                    step.color === 'green' ? 'text-primary' :
                    'text-secondary'
                  }`} />
                </div>
                <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center mx-auto mb-4 font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" onClick={() => setLocation('/advertiser/register')}>
              ابدأ الآن كمعلن
            </Button>
          </div>
        </section>

        {/* Benefits */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">لماذا TASKKASH؟</h2>
            <p className="text-lg text-muted-foreground">
              فوائد حقيقية للجميع
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`bg-gradient-to-r ${benefit.color} text-white p-6`}>
                  <h3 className="text-2xl font-bold">{benefit.title}</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {benefit.points.map((point, pIndex) => (
                      <li key={pIndex} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-12">TASKKASH بالأرقام</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-4xl font-bold text-primary mb-2">125K+</p>
              <p className="text-muted-foreground">مستخدم نشط</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">2.8K+</p>
              <p className="text-muted-foreground">معلن</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">458K+</p>
              <p className="text-muted-foreground">مهمة مكتملة</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">4.8/5</p>
              <p className="text-muted-foreground">تقييم المستخدمين</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">هل أنت مستعد للبدء؟</h2>
          <p className="text-xl mb-8 opacity-90">
            انضم إلى آلاف المستخدمين والمعلنين الذين يستخدمون TASKKASH يومياً
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => setLocation('/register')}
            >
              سجل كمستخدم
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => setLocation('/advertiser/register')}
            >
              سجل كمعلن
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}


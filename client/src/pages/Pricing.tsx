import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, X, Star, Zap, Crown, HelpCircle
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useCurrency } from "@/contexts/CurrencyContext";

const plans = [
  {
    name: 'الباقة الأساسية',
    price: 999,
    period: 'شهرياً',
    description: 'مثالية للشركات الصغيرة والناشئة',
    icon: Star,
    color: 'blue',
    features: [
      { text: 'حتى 5 حملات شهرياً', included: true },
      { text: 'حتى 1000 مهمة شهرياً', included: true },
      { text: 'استهداف أساسي (العمر، الجنس، المدينة)', included: true },
      { text: 'تقارير أساسية', included: true },
      { text: 'دعم فني عبر البريد', included: true },
      { text: 'استهداف متقدم', included: false },
      { text: 'API Access', included: false },
      { text: 'مدير حساب مخصص', included: false }
    ]
  },
  {
    name: 'الباقة الاحترافية',
    price: 2499,
    period: 'شهرياً',
    description: 'الأكثر شعبية للشركات المتوسطة',
    icon: Zap,
    color: 'purple',
    popular: true,
    features: [
      { text: 'حملات غير محدودة', included: true },
      { text: 'حتى 5000 مهمة شهرياً', included: true },
      { text: 'استهداف متقدم (الاهتمامات، السلوك)', included: true },
      { text: 'تقارير مفصلة وتحليلات', included: true },
      { text: 'دعم فني ذو أولوية', included: true },
      { text: 'API Access', included: true },
      { text: 'تدريب مجاني', included: true },
      { text: 'مدير حساب مخصص', included: false }
    ]
  },
  {
    name: 'باقة المؤسسات',
    price: 'حسب الطلب',
    period: '',
    description: 'حلول مخصصة للشركات الكبرى',
    icon: Crown,
    color: 'orange',
    features: [
      { text: 'حملات غير محدودة', included: true },
      { text: 'مهام غير محدودة', included: true },
      { text: 'استهداف مخصص كامل', included: true },
      { text: 'تقارير وتحليلات متقدمة', included: true },
      { text: 'دعم فني 24/7', included: true },
      { text: 'API Access كامل', included: true },
      { text: 'تدريب شامل للفريق', included: true },
      { text: 'مدير حساب مخصص', included: true }
    ]
  }
];

const faqs = [
  {
    q: 'هل يمكنني تغيير الباقة لاحقاً؟',
    a: 'نعم، يمكنك الترقية أو التخفيض في أي وقت. سيتم احتساب الفرق بشكل تناسبي.'
  },
  {
    q: 'ما هي طرق الدفع المتاحة؟',
    a: 'نقبل جميع بطاقات الائتمان الرئيسية، التحويل البنكي، وفواتير الشركات.'
  },
  {
    q: 'هل هناك رسوم إضافية؟',
    a: 'لا، جميع الأسعار شاملة. لا توجد رسوم خفية أو تكاليف إضافية.'
  },
  {
    q: 'هل يمكنني إلغاء الاشتراك؟',
    a: 'نعم، يمكنك الإلغاء في أي وقت بدون أي التزامات أو رسوم إلغاء.'
  },
  {
    q: 'هل توجد فترة تجريبية مجانية؟',
    a: 'نعم، نقدم فترة تجريبية مجانية لمدة 14 يوماً لجميع الباقات الجديدة.'
  },
  {
    q: 'كيف يتم احتساب عدد المهام؟',
    a: 'يتم احتساب كل مهمة مكتملة فقط. المهام الملغاة أو المرفوضة لا تُحتسب.'
  }
];

export default function Pricing() {
  const { currency, symbol, formatAmount } = useCurrency();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">الأسعار والباقات</h1>
          <p className="text-xl opacity-90 mb-8">
            اختر الباقة المناسبة لاحتياجات عملك
          </p>
          <Badge className="bg-white text-primary border-0 px-4 py-2 text-sm">
            ✨ جرب مجاناً لمدة 14 يوماً - بدون بطاقة ائتمان
          </Badge>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-8 relative ${
                plan.popular ? 'border-2 border-primary shadow-xl' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white border-0">
                  الأكثر شعبية
                </Badge>
              )}

              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                plan.color === 'blue' ? 'bg-blue-100' :
                plan.color === 'purple' ? 'bg-purple-100' :
                'bg-orange-100'
              }`}>
                <plan.icon className={`w-8 h-8 ${
                  plan.color === 'blue' ? 'text-blue-600' :
                  plan.color === 'purple' ? 'text-purple-600' :
                  'text-secondary'
                }`} />
              </div>

              <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
              <p className="text-center text-muted-foreground mb-6">{plan.description}</p>

              <div className="text-center mb-6">
                {typeof plan.price === 'number' ? (
                  <>
                    <span className="text-4xl font-bold">{plan.price.toLocaleString()}</span>
                    <span className="text-muted-foreground"> {symbol}</span>
                    <p className="text-sm text-muted-foreground mt-1">{plan.period}</p>
                  </>
                ) : (
                  <span className="text-3xl font-bold">{plan.price}</span>
                )}
              </div>

              <Button
                className={`w-full mb-6 ${
                  plan.popular ? 'bg-primary hover:bg-primary/90' : ''
                }`}
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => setLocation('/advertiser/register')}
              >
                {typeof plan.price === 'number' ? 'ابدأ الآن' : 'تواصل معنا'}
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">مقارنة شاملة للباقات</h2>
          <Card className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-4 font-semibold">الميزة</th>
                  <th className="text-center p-4 font-semibold">الأساسية</th>
                  <th className="text-center p-4 font-semibold bg-primary/5">الاحترافية</th>
                  <th className="text-center p-4 font-semibold">المؤسسات</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4">عدد الحملات</td>
                  <td className="text-center p-4">5 شهرياً</td>
                  <td className="text-center p-4 bg-primary/5">غير محدود</td>
                  <td className="text-center p-4">غير محدود</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">عدد المهام</td>
                  <td className="text-center p-4">1,000</td>
                  <td className="text-center p-4 bg-primary/5">5,000</td>
                  <td className="text-center p-4">غير محدود</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">الاستهداف</td>
                  <td className="text-center p-4">أساسي</td>
                  <td className="text-center p-4 bg-primary/5">متقدم</td>
                  <td className="text-center p-4">مخصص</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">التقارير</td>
                  <td className="text-center p-4">أساسية</td>
                  <td className="text-center p-4 bg-primary/5">مفصلة</td>
                  <td className="text-center p-4">متقدمة</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">الدعم الفني</td>
                  <td className="text-center p-4">بريد</td>
                  <td className="text-center p-4 bg-primary/5">ذو أولوية</td>
                  <td className="text-center p-4">24/7</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">API Access</td>
                  <td className="text-center p-4"><X className="w-5 h-5 mx-auto text-muted-foreground" /></td>
                  <td className="text-center p-4 bg-primary/5"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                </tr>
                <tr>
                  <td className="p-4">مدير حساب</td>
                  <td className="text-center p-4"><X className="w-5 h-5 mx-auto text-muted-foreground" /></td>
                  <td className="text-center p-4 bg-primary/5"><X className="w-5 h-5 mx-auto text-muted-foreground" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">الأسئلة الشائعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <h3 className="font-semibold">{faq.q}</h3>
                </div>
                <p className="text-muted-foreground pr-8">{faq.a}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center mt-16">
          <Card className="p-12 bg-gradient-to-r from-primary to-secondary text-white">
            <h2 className="text-3xl font-bold mb-4">هل أنت مستعد للبدء؟</h2>
            <p className="text-xl mb-8 opacity-90">
              ابدأ تجربتك المجانية اليوم ولا تحتاج لبطاقة ائتمان
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => setLocation('/advertiser/register')}
              >
                ابدأ التجربة المجانية
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-primary hover:bg-white/90"
              >
                تحدث مع المبيعات
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}


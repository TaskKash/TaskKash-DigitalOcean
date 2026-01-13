import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, HelpCircle } from 'lucide-react';

const categories = [
  { id: 'all', name: 'الكل', count: 20 },
  { id: 'getting-started', name: 'البداية', count: 5 },
  { id: 'tasks', name: 'المهام', count: 6 },
  { id: 'payments', name: 'المدفوعات', count: 5 },
  { id: 'account', name: 'الحساب', count: 4 }
];

const faqs = [
  {
    category: 'getting-started',
    question: 'كيف أبدأ في استخدام TASKKASH؟',
    answer: 'قم بالتسجيل باستخدام بريدك الإلكتروني أو حساب Google/Facebook، ثم أكمل ملفك الشخصي. بعدها يمكنك تصفح المهام المتاحة والبدء في كسب المال فوراً.'
  },
  {
    category: 'getting-started',
    question: 'هل التطبيق مجاني؟',
    answer: 'نعم، التسجيل والاستخدام مجاني بالكامل. لا توجد أي رسوم خفية. أنت تكسب المال من إكمال المهام.'
  },
  {
    category: 'getting-started',
    question: 'ما هي المتطلبات للاشتراك؟',
    answer: 'يجب أن يكون عمرك 18 عاماً أو أكثر، وأن يكون لديك هاتف ذكي وبريد إلكتروني صالح. بعض المهام قد تتطلب حساب على منصات معينة.'
  },
  {
    category: 'tasks',
    question: 'ما أنواع المهام المتاحة؟',
    answer: 'نوفر مهام متنوعة: استبيانات، مشاهدة فيديوهات، تحميل تطبيقات، متابعة حسابات سوشيال ميديا، اختبارات، وغيرها.'
  },
  {
    category: 'tasks',
    question: 'كم من الوقت تستغرق المهمة؟',
    answer: 'معظم المهام تستغرق من دقيقة إلى 10 دقائق. المدة الزمنية موضحة في تفاصيل كل مهمة.'
  },
  {
    category: 'tasks',
    question: 'لماذا تم رفض مهمتي؟',
    answer: 'قد يتم الرفض إذا لم تستوفِ المتطلبات، أو إذا كانت الإجابات غير دقيقة، أو إذا لم تتبع التعليمات. يمكنك مراجعة سبب الرفض في تفاصيل المهمة.'
  },
  {
    category: 'tasks',
    question: 'هل يمكنني إلغاء مهمة بدأتها؟',
    answer: 'نعم، يمكنك إلغاء المهمة قبل إرسالها. لكن الإلغاء المتكرر قد يؤثر على تقييمك وفرص حصولك على مهام جديدة.'
  },
  {
    category: 'tasks',
    question: 'كم مهمة يمكنني إكمالها يومياً؟',
    answer: 'لا توجد حدود! يمكنك إكمال عدد غير محدود من المهام يومياً حسب توفرها ووقتك.'
  },
  {
    category: 'tasks',
    question: 'متى أحصل على المكافأة؟',
    answer: 'تضاف المكافأة إلى محفظتك فوراً بعد الموافقة على المهمة، عادة خلال 24-48 ساعة.'
  },
  {
    category: 'payments',
    question: 'ما هو الحد الأدنى للسحب؟',
    answer: 'الحد الأدنى للسحب هو 50 ريال سعودي.'
  },
  {
    category: 'payments',
    question: 'ما هي طرق السحب المتاحة؟',
    answer: 'يمكنك السحب عبر: التحويل البنكي، STC Pay، مدى Pay، أو PayPal.'
  },
  {
    category: 'payments',
    question: 'كم يستغرق وصول الأموال؟',
    answer: 'التحويل البنكي: 1-3 أيام عمل. المحافظ الإلكترونية (STC Pay, مدى): فوري إلى 24 ساعة.'
  },
  {
    category: 'payments',
    question: 'هل هناك رسوم على السحب؟',
    answer: 'لا توجد رسوم على السحب للمبالغ أكثر من 100 ريال. للمبالغ الأقل، رسوم رمزية 2 ريال.'
  },
  {
    category: 'payments',
    question: 'لماذا تأخر السحب؟',
    answer: 'قد يتأخر السحب بسبب التحقق الأمني، أو عطلات نهاية الأسبوع، أو مشاكل في البيانات البنكية. تواصل مع الدعم إذا تأخر أكثر من 5 أيام.'
  },
  {
    category: 'account',
    question: 'كيف أرتقي إلى مستوى أعلى؟',
    answer: 'كلما أكملت مهام أكثر بنجاح، ترتقي تلقائياً. كل مستوى يفتح مهام بمكافآت أكبر.'
  },
  {
    category: 'account',
    question: 'كيف أحسن تقييمي؟',
    answer: 'أكمل المهام بدقة، اتبع التعليمات، وتجنب الإلغاء المتكرر. التقييم العالي يمنحك أولوية في المهام الجديدة.'
  },
  {
    category: 'account',
    question: 'هل يمكنني تغيير بريدي الإلكتروني؟',
    answer: 'نعم، من إعدادات الحساب > تعديل الملف الشخصي. ستحتاج للتحقق من البريد الجديد.'
  },
  {
    category: 'account',
    question: 'كيف أحذف حسابي؟',
    answer: 'من الملف الشخصي > الإعدادات > حذف الحساب. تنبيه: هذا الإجراء نهائي ولا يمكن التراجع عنه.'
  }
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MobileLayout title="الأسئلة الشائعة" showBack>
      <div className="p-4 space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-br from-primary to-secondary p-6 text-white text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">كيف يمكننا مساعدتك؟</h2>
          <p className="opacity-90">ابحث عن إجابات لأسئلتك الشائعة</p>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن سؤال..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* FAQs */}
        {filteredFaqs.length > 0 ? (
          <Card>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="px-4 text-right hover:no-underline">
                    <span className="font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">لم نجد أي نتائج لبحثك</p>
          </Card>
        )}

        {/* Contact Support */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-2">لم تجد إجابة؟</h3>
          <p className="text-sm text-muted-foreground mb-4">
            فريق الدعم جاهز لمساعدتك على مدار الساعة
          </p>
          <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors">
            تواصل مع الدعم
          </button>
        </Card>
      </div>
    </MobileLayout>
  );
}


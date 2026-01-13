import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, MessageCircle, Mail, Phone, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const faqs = [
  {
    question: 'كيف أبدأ في كسب المال؟',
    answer: 'بعد التسجيل، تصفح المهام المتاحة واختر ما يناسبك. أكمل المهمة وفقاً للتعليمات، وسيتم إضافة المكافأة إلى محفظتك فوراً بعد المراجعة.'
  },
  {
    question: 'ما هو الحد الأدنى للسحب؟',
    answer: 'الحد الأدنى للسحب هو 50 ريال سعودي. يمكنك السحب إلى حسابك البنكي أو محفظتك الإلكترونية.'
  },
  {
    question: 'كم من الوقت يستغرق وصول الأموال؟',
    answer: 'عادة ما تصل الأموال خلال 1-3 أيام عمل حسب طريقة السحب المختارة. المحافظ الإلكترونية أسرع من التحويل البنكي.'
  },
  {
    question: 'لماذا تم رفض مهمتي؟',
    answer: 'قد يتم رفض المهمة إذا لم تستوفِ المتطلبات أو إذا كانت الإجابات غير دقيقة. يمكنك مراجعة سبب الرفض في تفاصيل المهمة.'
  },
  {
    question: 'كيف أرتقي إلى مستوى أعلى؟',
    answer: 'كلما أكملت مهام أكثر، ترتقي إلى مستويات أعلى. كل مستوى يفتح مهام بمكافآت أكبر وميزات إضافية.'
  },
  {
    question: 'هل يمكنني إلغاء مهمة بدأتها؟',
    answer: 'نعم، يمكنك إلغاء المهمة قبل إرسالها. لكن الإلغاء المتكرر قد يؤثر على تقييمك.'
  },
  {
    question: 'كيف أحصل على مهام أكثر؟',
    answer: 'حافظ على تقييم عالٍ بإكمال المهام بدقة، وفعّل الإشعارات لتصلك المهام الجديدة فوراً.'
  },
  {
    question: 'هل معلوماتي آمنة؟',
    answer: 'نعم، نحن نستخدم أعلى معايير الأمان لحماية بياناتك. لن نشارك معلوماتك مع أي طرف ثالث بدون إذنك.'
  }
];

const contactMethods = [
  {
    icon: MessageCircle,
    title: 'الدردشة المباشرة',
    description: 'تحدث مع فريق الدعم',
    action: 'بدء المحادثة',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Mail,
    title: 'البريد الإلكتروني',
    description: 'support@taskkash.com',
    action: 'إرسال بريد',
    color: 'bg-green-100 text-primary'
  },
  {
    icon: Phone,
    title: 'الهاتف',
    description: '+966 11 234 5678',
    action: 'اتصل بنا',
    color: 'bg-orange-100 text-secondary'
  }
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = () => {
    if (!contactForm.subject || !contactForm.message) {
      toast.error('الرجاء ملء جميع الحقول');
      return;
    }
    toast.success('تم إرسال طلبك! سنرد عليك قريباً');
    setContactForm({ subject: '', message: '' });
  };

  return (
    <MobileLayout title="المساعدة والدعم" showBack>
      <div className="p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن إجابة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Contact Methods */}
        <div>
          <h3 className="font-semibold mb-3">تواصل معنا</h3>
          <div className="grid gap-3">
            {contactMethods.map((method, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${method.color} flex items-center justify-center`}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{method.title}</p>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    {method.action}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h3 className="font-semibold mb-3">الأسئلة الشائعة</h3>
          <Card>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="px-4 text-right">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>

        {/* Submit Ticket */}
        <div>
          <h3 className="font-semibold mb-3">إرسال طلب دعم</h3>
          <Card className="p-4 space-y-4">
            <div>
              <Label htmlFor="subject">الموضوع</Label>
              <Input
                id="subject"
                placeholder="مثال: مشكلة في السحب"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="message">الرسالة</Label>
              <Textarea
                id="message"
                placeholder="اشرح مشكلتك بالتفصيل..."
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                rows={5}
              />
            </div>
            <Button onClick={handleSubmitTicket} className="w-full">
              إرسال الطلب
            </Button>
          </Card>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3">روابط مفيدة</h3>
          <Card className="divide-y">
            {[
              { label: 'دليل الاستخدام', path: '/guide' },
              { label: 'الشروط والأحكام', path: '/terms' },
              { label: 'سياسة الخصوصية', path: '/privacy' },
              { label: 'معلومات عنا', path: '/about' }
            ].map((link, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}


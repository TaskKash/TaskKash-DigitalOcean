import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, Phone, Mail, FileText, Send,
  HelpCircle, Book, Video, CheckCircle2, Clock
} from 'lucide-react';
import { toast } from 'sonner';

const faqs = [
  {
    category: 'الحملات',
    questions: [
      { q: 'كيف أنشئ حملة جديدة؟', a: 'اذهب إلى لوحة التحكم واضغط على "إنشاء حملة جديدة" ثم اتبع الخطوات' },
      { q: 'ما هو الحد الأدنى للميزانية؟', a: 'الحد الأدنى للميزانية هو 1000 ريال سعودي' },
      { q: 'كم يستغرق نشر الحملة؟', a: 'يتم نشر الحملة فوراً بعد الموافقة والدفع' }
    ]
  },
  {
    category: 'المدفوعات',
    questions: [
      { q: 'ما هي طرق الدفع المتاحة؟', a: 'نقبل بطاقات الائتمان والحسابات البنكية' },
      { q: 'هل يمكنني استرداد المبلغ؟', a: 'نعم، يمكنك استرداد المبلغ من المهام غير المكتملة' },
      { q: 'متى يتم خصم المبلغ؟', a: 'يتم الخصم فور إنشاء الحملة' }
    ]
  },
  {
    category: 'المراجعة',
    questions: [
      { q: 'كيف أراجع المهام؟', a: 'اذهب إلى "مراجعة المهام" لعرض المهام المنتظرة' },
      { q: 'ماذا أفعل مع المهام المرفوضة؟', a: 'يمكنك إعادة مراجعتها أو الإبلاغ عن المستخدم' },
      { q: 'ما هو معدل القبول الموصى به؟', a: 'ننصح بمعدل قبول 90% أو أعلى' }
    ]
  }
];

const tickets = [
  {
    id: 'TKT-001',
    subject: 'مشكلة في إنشاء حملة',
    status: 'open',
    priority: 'high',
    date: '2024-01-25',
    lastReply: 'منذ ساعتين'
  },
  {
    id: 'TKT-002',
    subject: 'استفسار عن الفواتير',
    status: 'resolved',
    priority: 'medium',
    date: '2024-01-24',
    lastReply: 'منذ يوم'
  }
];

export default function SupportCenter() {
  const [activeTab, setActiveTab] = useState('faq');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('تم إرسال طلب الدعم بنجاح');
    setSubject('');
    setMessage('');
  };

  const getStatusBadge = (status: string) => {
    if (status === 'open') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-0">مفتوحة</Badge>;
    }
    if (status === 'resolved') {
      return <Badge className="bg-green-100 text-green-800 border-0">محلولة</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800 border-0">مغلقة</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') {
      return <Badge className="bg-red-100 text-red-800 border-0">عاجل</Badge>;
    }
    if (priority === 'medium') {
      return <Badge className="bg-orange-100 text-orange-800 border-0">متوسط</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800 border-0">عادي</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">مركز الدعم</h1>
          <p className="text-sm text-muted-foreground">نحن هنا لمساعدتك</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Methods */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">تواصل معنا</h2>
              <div className="space-y-4">
                <button className="w-full flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <div className="text-right flex-1">
                    <p className="font-medium">الدردشة المباشرة</p>
                    <p className="text-sm text-muted-foreground">متاح 24/7</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors">
                  <Phone className="w-5 h-5 text-primary" />
                  <div className="text-right flex-1">
                    <p className="font-medium">الهاتف</p>
                    <p className="text-sm text-muted-foreground">+966 50 123 4567</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors">
                  <Mail className="w-5 h-5 text-primary" />
                  <div className="text-right flex-1">
                    <p className="font-medium">البريد الإلكتروني</p>
                    <p className="text-sm text-muted-foreground">support@taskkash.com</p>
                  </div>
                </button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">الموارد</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <Book className="w-5 h-5 text-primary" />
                  <span className="flex-1 text-right">دليل المستخدم</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <Video className="w-5 h-5 text-primary" />
                  <span className="flex-1 text-right">فيديوهات تعليمية</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="flex-1 text-right">الوثائق</span>
                </button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <Card className="p-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'faq'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 inline ml-2" />
                  الأسئلة الشائعة
                </button>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'tickets'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <FileText className="w-4 h-4 inline ml-2" />
                  طلبات الدعم
                </button>
                <button
                  onClick={() => setActiveTab('new')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'new'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Send className="w-4 h-4 inline ml-2" />
                  طلب جديد
                </button>
              </div>
            </Card>

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div className="space-y-4">
                {faqs.map((category, index) => (
                  <Card key={index} className="p-6">
                    <h3 className="text-lg font-semibold mb-4">{category.category}</h3>
                    <div className="space-y-4">
                      {category.questions.map((item, qIndex) => (
                        <details key={qIndex} className="group">
                          <summary className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-muted">
                            <span className="font-medium">{item.q}</span>
                            <HelpCircle className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
                          </summary>
                          <p className="mt-2 p-3 text-muted-foreground bg-muted/50 rounded-lg">
                            {item.a}
                          </p>
                        </details>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{ticket.subject}</h3>
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {ticket.id} • {ticket.date} • آخر رد: {ticket.lastReply}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">عرض</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* New Ticket Tab */}
            {activeTab === 'new' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">طلب دعم جديد</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الموضوع *</label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="اكتب موضوع طلب الدعم..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">الأولوية *</label>
                    <select className="w-full px-4 py-2 border rounded-lg" required>
                      <option value="low">عادي</option>
                      <option value="medium">متوسط</option>
                      <option value="high">عاجل</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">الرسالة *</label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="اشرح مشكلتك أو استفسارك بالتفصيل..."
                      rows={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="w-4 h-4 ml-2" />
                    إرسال الطلب
                  </Button>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


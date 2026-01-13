import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, Printer, Mail, ArrowRight, CheckCircle2
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function InvoiceDetail() {
  const [, setLocation] = useLocation();

  const invoice = {
    id: 'INV-2024-001',
    date: '2024-01-25',
    dueDate: '2024-02-25',
    status: 'paid',
    company: {
      name: 'شركة التقنية المتقدمة',
      address: 'الرياض، المملكة العربية السعودية',
      taxNumber: '123456789',
      email: 'billing@example.com',
      phone: '+966 50 123 4567'
    },
    items: [
      {
        description: 'حملة إطلاق المنتج الجديد',
        quantity: 470,
        unitPrice: 50,
        total: 23500
      },
      {
        description: 'رسوم خدمة (5%)',
        quantity: 1,
        unitPrice: 1175,
        total: 1175
      }
    ],
    subtotal: 23500,
    tax: 3525,
    total: 27025,
    paid: 27025,
    balance: 0
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setLocation('/advertiser/billing')}
            className="flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            العودة إلى الفواتير
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">الفاتورة #{invoice.id}</h1>
              <p className="text-sm text-muted-foreground">
                تاريخ الإصدار: {invoice.date}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 ml-2" />
                إرسال
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 ml-2" />
                تحميل PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        <Card className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-8 border-b">
            <div>
              <h2 className="text-3xl font-bold mb-2">TASKKASH</h2>
              <p className="text-sm text-muted-foreground">منصة المهام والمكافآت</p>
              <p className="text-sm text-muted-foreground">الرياض، المملكة العربية السعودية</p>
              <p className="text-sm text-muted-foreground">info@taskkash.com</p>
            </div>
            <div className="text-left">
              <Badge className="bg-green-100 text-green-800 border-0 mb-2">
                <CheckCircle2 className="w-3 h-3 ml-1" />
                مدفوعة
              </Badge>
              <p className="text-2xl font-bold">فاتورة</p>
              <p className="text-muted-foreground">#{invoice.id}</p>
            </div>
          </div>

          {/* Company Info */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">الفاتورة إلى:</h3>
            <p className="font-medium">{invoice.company.name}</p>
            <p className="text-sm text-muted-foreground">{invoice.company.address}</p>
            <p className="text-sm text-muted-foreground">الرقم الضريبي: {invoice.company.taxNumber}</p>
            <p className="text-sm text-muted-foreground">{invoice.company.email}</p>
            <p className="text-sm text-muted-foreground">{invoice.company.phone}</p>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">تاريخ الإصدار</p>
              <p className="font-semibold">{invoice.date}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">تاريخ الاستحقاق</p>
              <p className="font-semibold">{invoice.dueDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">الحالة</p>
              <Badge className="bg-green-100 text-green-800 border-0">
                مدفوعة
              </Badge>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 font-semibold">الوصف</th>
                  <th className="text-center py-3 font-semibold">الكمية</th>
                  <th className="text-center py-3 font-semibold">السعر</th>
                  <th className="text-left py-3 font-semibold">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-4">{item.description}</td>
                    <td className="text-center py-4">{item.quantity}</td>
                    <td className="text-center py-4">{item.unitPrice.toLocaleString()} ج.م</td>
                    <td className="text-left py-4 font-semibold">
                      {item.total.toLocaleString()} ج.م
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المجموع الفرعي:</span>
                <span className="font-semibold">{invoice.subtotal.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ضريبة القيمة المضافة (15%):</span>
                <span className="font-semibold">{invoice.tax.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-bold">الإجمالي:</span>
                <span className="font-bold text-xl">{invoice.total.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between text-primary">
                <span className="font-semibold">المدفوع:</span>
                <span className="font-semibold">{invoice.paid.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-bold">الرصيد المتبقي:</span>
                <span className="font-bold text-xl">{invoice.balance.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>شكراً لاستخدامكم TASKKASH</p>
            <p className="mt-2">
              للاستفسارات: support@taskkash.com | +966 50 123 4567
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}


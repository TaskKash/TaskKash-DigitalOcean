import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <MobileLayout title="سياسة الخصوصية" showBack>
      <div className="p-4 space-y-6">
        <Card className="bg-gradient-to-br from-primary to-secondary p-6 text-white text-center">
          <Shield className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">سياسة الخصوصية</h2>
          <p className="opacity-90">نحن نحترم خصوصيتك ونحمي بياناتك</p>
        </Card>

        <Card className="p-6 space-y-6 text-sm">
          <section>
            <h3 className="font-bold text-lg mb-3">1. المعلومات التي نجمعها</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              نجمع المعلومات التالية عند استخدامك للمنصة:
            </p>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold mb-2">معلومات الحساب:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mr-4">
                  <li>الاسم الكامل</li>
                  <li>البريد الإلكتروني</li>
                  <li>رقم الجوال</li>
                  <li>تاريخ الميلاد</li>
                  <li>الموقع الجغرافي</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">معلومات الاستخدام:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mr-4">
                  <li>المهام المكتملة</li>
                  <li>سجل المعاملات</li>
                  <li>تفاعلاتك مع المنصة</li>
                  <li>عنوان IP والجهاز المستخدم</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">معلومات الدفع:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mr-4">
                  <li>معلومات الحساب البنكي (للسحب)</li>
                  <li>سجل المعاملات المالية</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-3">2. كيف نستخدم معلوماتك</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mr-4">
              <li>تقديم وتحسين خدماتنا</li>
              <li>معالجة المدفوعات والسحوبات</li>
              <li>التواصل معك بخصوص حسابك</li>
              <li>إرسال إشعارات حول المهام الجديدة</li>
              <li>منع الاحتيال وضمان الأمان</li>
              <li>تحليل استخدام المنصة لتحسين التجربة</li>
              <li>الامتثال للمتطلبات القانونية</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-3">3. مشاركة المعلومات</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">
              نحن لا نبيع معلوماتك الشخصية. قد نشارك معلوماتك في الحالات التالية:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mr-4">
              <li><strong>مع المعلنين:</strong> معلومات إحصائية مجهولة المصدر فقط</li>
              <li><strong>مع مقدمي الخدمات:</strong> معالجات الدفع والخدمات السحابية</li>
              <li><strong>للامتثال القانوني:</strong> عند الطلب من الجهات الرسمية</li>
              <li><strong>لحماية الحقوق:</strong> في حالة النزاعات القانونية</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-3">4. أمان المعلومات</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">
              نتخذ إجراءات أمنية صارمة لحماية معلوماتك:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mr-4">
              <li>تشفير البيانات باستخدام SSL/TLS</li>
              <li>تخزين آمن في خوادم محمية</li>
              <li>مراقبة مستمرة للأنشطة المشبوهة</li>
              <li>وصول محدود للموظفين المصرح لهم فقط</li>
              <li>نسخ احتياطية منتظمة</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-3">5. حقوقك</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">
              لديك الحق في:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mr-4">
              <li>الوصول إلى معلوماتك الشخصية</li>
              <li>تصحيح المعلومات غير الدقيقة</li>
              <li>حذف حسابك ومعلوماتك</li>
              <li>الاعتراض على معالجة بياناتك</li>
              <li>طلب نسخة من بياناتك</li>
              <li>إلغاء الاشتراك في الرسائل التسويقية</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-3">6. ملفات تعريف الارتباط (Cookies)</h3>
            <p className="text-muted-foreground leading-relaxed">
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتذكر تفضيلاتك. 
              يمكنك التحكم في ملفات تعريف الارتباط من إعدادات متصفحك. 
              تعطيلها قد يؤثر على بعض وظائف المنصة.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-3">7. الاحتفاظ بالبيانات</h3>
            <p className="text-muted-foreground leading-relaxed">
              نحتفظ بمعلوماتك طالما كان حسابك نشطاً أو حسب الحاجة لتقديم الخدمات. 
              عند حذف حسابك، نحذف معلوماتك خلال 90 يوماً، 
              باستثناء ما يتطلبه القانون الاحتفاظ به.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-3">8. خصوصية الأطفال</h3>
            <p className="text-muted-foreground leading-relaxed">
              منصتنا غير موجهة للأشخاص دون سن 18 عاماً. 
              لا نجمع معلومات عن قصد من الأطفال. 
              إذا اكتشفنا أن طفلاً قدم معلومات، سنحذفها فوراً.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-3">9. التغييرات على السياسة</h3>
            <p className="text-muted-foreground leading-relaxed">
              قد نحدث هذه السياسة من وقت لآخر. سنخطرك بأي تغييرات جوهرية 
              عبر البريد الإلكتروني أو إشعار داخل التطبيق. 
              استمرارك في استخدام المنصة بعد التغييرات يعني قبولك لها.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-3">10. الاتصال بنا</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">
              لأي استفسارات حول خصوصيتك أو لممارسة حقوقك:
            </p>
            <ul className="list-none text-muted-foreground space-y-1">
              <li>📧 privacy@taskkash.com</li>
              <li>📱 +966 11 234 5678</li>
              <li>🏢 الرياض، المملكة العربية السعودية</li>
            </ul>
          </section>
        </Card>

        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <Shield className="w-5 h-5" />
            <p className="text-sm font-semibold">
              نحن ملتزمون بحماية خصوصيتك وأمان بياناتك
            </p>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}


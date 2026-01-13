import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Terms() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  if (isArabic) {
    return (
      <MobileLayout title="الشروط والأحكام" showBack>
        <div className="p-4 space-y-4">
          <Card className="bg-gradient-to-br from-primary to-secondary p-6 text-white text-center">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">الشروط والأحكام</h2>
            <p className="opacity-90">آخر تحديث: يناير 2026</p>
          </Card>
          <Card className="p-4 space-y-6">
            <section>
              <h3 className="font-bold text-lg mb-3">1. مقدمة</h3>
              <p className="text-muted-foreground leading-relaxed">
                مرحباً بك في تاسك كاش. باستخدامك لمنصتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. 
                يرجى قراءتها بعناية قبل استخدام خدماتنا.
              </p>
            </section>
            <section>
              <h3 className="font-bold text-lg mb-3">2. الأهلية</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                يجب أن تكون:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mr-4">
                <li>بعمر 18 عاماً أو أكثر</li>
                <li>مقيماً في جمهورية مصر العربية</li>
                <li>قادراً قانونياً على الدخول في عقود ملزمة</li>
                <li>تمتلك معلومات دقيقة وصحيحة</li>
              </ul>
            </section>
            <section>
              <h3 className="font-bold text-lg mb-3">3. الحساب والأمان</h3>
              <p className="text-muted-foreground leading-relaxed">
                أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور. 
                أي نشاط يحدث تحت حسابك هو مسؤوليتك الكاملة. 
                يجب عليك إخطارنا فوراً بأي استخدام غير مصرح به لحسابك.
              </p>
            </section>
            <section>
              <h3 className="font-bold text-lg mb-3">4. المهام والمكافآت</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mr-4">
                <li>يجب إكمال المهام وفقاً للتعليمات المحددة</li>
                <li>المكافآت تُضاف بعد الموافقة على المهمة</li>
                <li>نحتفظ بالحق في رفض أي مهمة لا تستوفي المعايير</li>
                <li>محاولة التلاعب أو الغش تؤدي لإيقاف الحساب</li>
                <li>المكافآت غير قابلة للاسترداد بعد الموافقة</li>
              </ul>
            </section>
            <section>
              <h3 className="font-bold text-lg mb-3">5. السحب والمدفوعات</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mr-4">
                <li>الحد الأدنى للسحب: 50 جنيه مصري</li>
                <li>معالجة السحب تستغرق 1-5 أيام عمل</li>
                <li>رسوم السحب (إن وجدت) موضحة بوضوح</li>
                <li>نحتفظ بالحق في تأخير السحب للتحقق الأمني</li>
                <li>المدفوعات تتم بالجنيه المصري فقط</li>
                <li>طرق السحب المتاحة: فودافون كاش، إنستاباي، التحويل البنكي</li>
              </ul>
            </section>
            <section>
              <h3 className="font-bold text-lg mb-3">6. السلوك المحظور</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                يُحظر عليك:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mr-4">
                <li>إنشاء حسابات متعددة</li>
                <li>استخدام برامج آلية أو روبوتات</li>
                <li>تقديم معلومات كاذبة أو مضللة</li>
                <li>التلاعب بالنظام أو محاولة اختراقه</li>
                <li>انتهاك حقوق الملكية الفكرية</li>
                <li>مشاركة حسابك مع الآخرين</li>
              </ul>
            </section>
            <section>
              <h3 className="font-bold text-lg mb-3">7. إنهاء الحساب</h3>
              <p className="text-muted-foreground leading-relaxed">
                نحتفظ بالحق في تعليق أو إنهاء حسابك في أي وقت دون إشعار مسبق 
                في حالة انتهاك هذه الشروط. عند الإنهاء، تفقد جميع الأرصدة غير المسحوبة 
                إذا كان الإنهاء بسبب انتهاك الشروط.
              </p>
            </section>
            <section>
              <h3 className="font-bold text-lg mb-3">8. إخلاء المسؤولية</h3>
              <p className="text-muted-foreground leading-relaxed">
                المنصة مقدمة "كما هي" دون أي ضمانات. لا نضمن توفر المهام بشكل دائم 
                أو دقة المعلومات المقدمة. لسنا مسؤولين عن أي خسائر مباشرة أو غير مباشرة 
                ناتجة عن استخدام المنصة.
              </p>
            </section>
            <section>
              <h3 className="font-bold text-lg mb-3">9. تعديل الشروط</h3>
              <p className="text-muted-foreground leading-relaxed">
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطارك بالتغييرات الجوهرية 
                عبر البريد الإلكتروني أو إشعار داخل التطبيق. استمرارك في استخدام المنصة 
                بعد التعديلات يعني قبولك للشروط الجديدة.
              </p>
            </section>
            <section>
              <h3 className="font-bold text-lg mb-3">10. القانون الحاكم</h3>
              <p className="text-muted-foreground leading-relaxed">
                تخضع هذه الشروط لقوانين جمهورية مصر العربية. 
                أي نزاع ينشأ عن هذه الشروط يخضع للاختصاص القضائي الحصري 
                للمحاكم في جمهورية مصر العربية.
              </p>
            </section>
            <section>
              <h3 className="font-bold text-lg mb-3">11. الاتصال بنا</h3>
              <p className="text-muted-foreground leading-relaxed">
                لأي استفسارات حول هذه الشروط، يمكنك التواصل معنا عبر:
              </p>
              <ul className="list-none text-muted-foreground space-y-1 mt-2">
                <li>📧 البريد: support@taskkash.com</li>
                <li>📱 الهاتف: +20 2 1234 5678</li>
                <li>🏢 العنوان: القاهرة، جمهورية مصر العربية</li>
              </ul>
            </section>
          </Card>
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-center text-muted-foreground">
              بالمتابعة، أنت توافق على جميع الشروط والأحكام المذكورة أعلاه
            </p>
          </Card>
        </div>
      </MobileLayout>
    );
  }
  
  // English version
  return (
    <MobileLayout title="Terms & Conditions" showBack>
      <div className="p-4 space-y-4">
        <Card className="bg-gradient-to-br from-primary to-secondary p-6 text-white text-center">
          <FileText className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Terms & Conditions</h2>
          <p className="opacity-90">Last updated: January 2026</p>
        </Card>
        <Card className="p-4 space-y-6">
          <section>
            <h3 className="font-bold text-lg mb-3">1. Introduction</h3>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to TaskKash. By using our platform, you agree to comply with these terms and conditions. 
              Please read them carefully before using our services.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-lg mb-3">2. Eligibility</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">
              You must be:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>18 years of age or older</li>
              <li>A resident of the Arab Republic of Egypt</li>
              <li>Legally capable of entering into binding contracts</li>
              <li>Providing accurate and truthful information</li>
            </ul>
          </section>
          <section>
            <h3 className="font-bold text-lg mb-3">3. Account & Security</h3>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account information and password. 
              Any activity that occurs under your account is your full responsibility. 
              You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-lg mb-3">4. Tasks & Rewards</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Tasks must be completed according to specified instructions</li>
              <li>Rewards are added after task approval</li>
              <li>We reserve the right to reject any task that does not meet standards</li>
              <li>Attempting to manipulate or cheat leads to account suspension</li>
              <li>Rewards are non-refundable after approval</li>
            </ul>
          </section>
          <section>
            <h3 className="font-bold text-lg mb-3">5. Withdrawals & Payments</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Minimum withdrawal: 50 Egyptian Pounds (EGP)</li>
              <li>Withdrawal processing takes 1-5 business days</li>
              <li>Withdrawal fees (if any) are clearly stated</li>
              <li>We reserve the right to delay withdrawals for security verification</li>
              <li>Payments are made in Egyptian Pounds (EGP) only</li>
              <li>Available withdrawal methods: Vodafone Cash, InstaPay, Bank Transfer</li>
            </ul>
          </section>
          <section>
            <h3 className="font-bold text-lg mb-3">6. Prohibited Conduct</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">
              You are prohibited from:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Creating multiple accounts</li>
              <li>Using automated software or bots</li>
              <li>Providing false or misleading information</li>
              <li>Manipulating the system or attempting to hack it</li>
              <li>Violating intellectual property rights</li>
              <li>Sharing your account with others</li>
            </ul>
          </section>
          <section>
            <h3 className="font-bold text-lg mb-3">7. Account Termination</h3>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account at any time without prior notice 
              in case of violation of these terms. Upon termination, you lose all unwithdrawn balances 
              if termination is due to terms violation.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-lg mb-3">8. Disclaimer</h3>
            <p className="text-muted-foreground leading-relaxed">
              The platform is provided "as is" without any warranties. We do not guarantee permanent task availability 
              or accuracy of provided information. We are not responsible for any direct or indirect losses 
              resulting from platform use.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-lg mb-3">9. Terms Modification</h3>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. You will be notified of material changes 
              via email or in-app notification. Your continued use of the platform 
              after modifications means acceptance of the new terms.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-lg mb-3">10. Governing Law</h3>
            <p className="text-muted-foreground leading-relaxed">
              These terms are governed by the laws of the Arab Republic of Egypt. 
              Any dispute arising from these terms is subject to the exclusive jurisdiction 
              of the courts in the Arab Republic of Egypt.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-lg mb-3">11. Contact Us</h3>
            <p className="text-muted-foreground leading-relaxed">
              For any inquiries about these terms, you can contact us via:
            </p>
            <ul className="list-none text-muted-foreground space-y-1 mt-2">
              <li>📧 Email: support@taskkash.com</li>
              <li>📱 Phone: +20 2 1234 5678</li>
              <li>🏢 Address: Cairo, Arab Republic of Egypt</li>
            </ul>
          </section>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-center text-muted-foreground">
            By continuing, you agree to all the terms and conditions mentioned above
          </p>
        </Card>
      </div>
    </MobileLayout>
  );
}

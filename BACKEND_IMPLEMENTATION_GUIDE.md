# دليل تنفيذ Backend لمشروع TaskKash

## نظرة عامة

تم تطوير Backend كامل لمشروع TaskKash يطبق نموذج العمولة المزدوجة ونظام الطبقات وجميع الميزات الأساسية المطلوبة.

## الملفات المطورة

### 1. Types & Configurations

**`server/types/business.ts`**
- تعريفات TypeScript لنموذج العمل
- أنواع الطبقات (User Tiers & Advertiser Tiers)
- تعريفات حساب العمولات

**`server/config/business.config.ts`**
- إعدادات نموذج العمل الكاملة
- تكوين الطبقات للمستخدمين والمعلنين
- إعدادات مرحلة الإطلاق (أول 3 شهور)
- الثوابت العامة للمشروع

### 2. Core Services

**`server/services/commission.service.ts`**
- حساب العمولة المزدوجة (من المستخدم والمعلن)
- دعم مرحلة الإطلاق (عمولة ثابتة 5% للمستخدمين و 10% للمعلنين)
- حساب الأرباح والتكاليف تلقائياً

**`server/services/tier.service.ts`**
- إدارة الطبقات للمستخدمين والمعلنين
- التحقق من أهلية الترقية
- ترقية تلقائية للطبقات بناءً على الأداء

**`server/services/wallet.service.ts`**
- إدارة المحفظة الإلكترونية
- إضافة وخصم الأموال
- طلبات السحب ومعالجتها
- سجل المعاملات المالية

**`server/services/task.service.ts`**
- إنشاء المهام من قبل المعلنين
- تعيين المهام للمستخدمين
- تقديم المهام المكتملة
- التحقق من المهام والموافقة/الرفض
- نظام الدفع التلقائي حسب الطبقة

**`server/services/notification.service.ts`**
- إرسال الإشعارات (Email, SMS, Push, In-App)
- إشعارات تلقائية لجميع العمليات المهمة

**`server/services/analytics.service.ts`**
- إحصائيات لوحة تحكم المستخدم
- إحصائيات لوحة تحكم المعلن
- إحصائيات لوحة تحكم الأدمن
- تقارير الأداء والإيرادات

### 3. API Routers

**`server/routers_new.ts`**
- APIs كاملة لجميع العمليات
- تكامل مع جميع الخدمات
- التحقق من الصلاحيات

**`server/routers_analytics.ts`**
- APIs التقارير والإحصائيات

## نموذج العمل المطبق

### مرحلة الإطلاق (أول 3 شهور)

```typescript
// عمولة ثابتة لجذب العملاء
userCommission: 5%      // ثابتة لجميع المستخدمين
advertiserCommission: 10%  // ثابتة لجميع المعلنين
```

### المرحلة العادية (بعد 3 شهور)

**طبقات المستخدمين:**

| الطبقة | العمولة | جدول الدفع | الحد الأدنى للمهام | الحد الأدنى للتقييم |
|--------|---------|------------|-------------------|---------------------|
| Tier 1 | 5%      | شهري       | 0                 | 0                   |
| Tier 2 | 10%     | أسبوعي     | 20                | 4.0                 |
| Tier 3 | 20%     | فوري (3 ساعات) | 50            | 4.5                 |

**طبقات المعلنين:**

| الطبقة | العمولة | الحد الأدنى للإنفاق الشهري |
|--------|---------|----------------------------|
| Tier 1 | 10%     | $0                         |
| Tier 2 | 15%     | $1,000                     |
| Tier 3 | 20%     | $5,000                     |
| Tier 4 | 25%     | $10,000                    |

### مثال على حساب العمولة

```typescript
// مهمة بقيمة $100
// المستخدم: Tier 1 (عمولة 5%)
// المعلن: Tier 1 (عمولة 10%)

const result = calculateCommission(100, 'tier1', 'tier1');

// النتيجة:
{
  taskValue: 100,
  userCommission: 5,           // 5% من 100
  advertiserCommission: 10,    // 10% من 100
  userEarnings: 95,            // ما يحصل عليه المستخدم
  advertiserCost: 110,         // ما يدفعه المعلن
  platformRevenue: 15,         // إيرادات المنصة
  platformMargin: 15%          // هامش الربح
}
```

## خطوات التكامل

### 1. استبدال ملف Routers

```bash
# نسخ احتياطي للملف القديم
mv server/routers.ts server/routers.old.ts

# استخدام الملف الجديد
mv server/routers_new.ts server/routers.ts
```

### 2. تحديث Schema قاعدة البيانات

تأكد من أن جداول قاعدة البيانات تحتوي على الحقول التالية:

**جدول users:**
```sql
ALTER TABLE users ADD COLUMN tier VARCHAR(20) DEFAULT 'tier1';
ALTER TABLE users ADD COLUMN balance DECIMAL(10,2) DEFAULT 0;
```

**جدول advertisers:**
```sql
ALTER TABLE advertisers ADD COLUMN tier VARCHAR(20) DEFAULT 'tier1';
```

**جدول userTasks:**
```sql
ALTER TABLE userTasks ADD COLUMN userEarnings DECIMAL(10,2);
ALTER TABLE userTasks ADD COLUMN userCommission DECIMAL(10,2);
ALTER TABLE userTasks ADD COLUMN scheduledPaymentAt DATETIME;
ALTER TABLE userTasks ADD COLUMN paidAt DATETIME;
ALTER TABLE userTasks ADD COLUMN rating INT;
ALTER TABLE userTasks ADD COLUMN feedback TEXT;
```

**جدول transactions:**
```sql
ALTER TABLE transactions ADD COLUMN balanceBefore DECIMAL(10,2);
ALTER TABLE transactions ADD COLUMN balanceAfter DECIMAL(10,2);
ALTER TABLE transactions ADD COLUMN taskId INT;
ALTER TABLE transactions ADD COLUMN processedAt DATETIME;
ALTER TABLE transactions ADD COLUMN note TEXT;
ALTER TABLE transactions ADD COLUMN metadata JSON;
```

### 3. تشغيل Cron Jobs

**معالجة المدفوعات المجدولة (كل ساعة):**
```typescript
import { processScheduledPayments } from './server/services/task.service';

// في cron job
setInterval(async () => {
  await processScheduledPayments();
}, 1000 * 60 * 60); // كل ساعة
```

**ترقية الطبقات التلقائية (يومياً):**
```typescript
import { autoUpgradeTiers } from './server/services/tier.service';

// في cron job
setInterval(async () => {
  await autoUpgradeTiers();
}, 1000 * 60 * 60 * 24); // كل 24 ساعة
```

### 4. تكامل خدمات خارجية

**خدمة البريد الإلكتروني:**
```typescript
// في notification.service.ts
async function sendEmailNotification(email: string, subject: string, body: string) {
  // استبدل هذا بخدمة البريد الفعلية (SendGrid, AWS SES, إلخ)
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  await sgMail.send({
    to: email,
    from: 'noreply@taskkash.com',
    subject,
    html: body,
  });
}
```

**خدمة الرسائل القصيرة:**
```typescript
// في notification.service.ts
async function sendSMSNotification(phone: string, message: string) {
  // استبدل هذا بخدمة SMS الفعلية (Twilio, Nexmo, إلخ)
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE,
    to: phone,
  });
}
```

## الاختبار

### اختبار حساب العمولات

```typescript
import { calculateCommission } from './server/services/commission.service';

// اختبار مرحلة الإطلاق
const launchPhaseResult = calculateCommission(100);
console.log(launchPhaseResult);
// Expected: userCommission: 5, advertiserCommission: 10

// اختبار المرحلة العادية
const normalPhaseResult = calculateCommission(100, 'tier3', 'tier4');
console.log(normalPhaseResult);
// Expected: userCommission: 20, advertiserCommission: 25
```

### اختبار إنشاء مهمة

```typescript
import { createTask } from './server/services/task.service';

const taskId = await createTask(1, {
  title: 'مهمة تجريبية',
  description: 'وصف المهمة',
  type: 'online',
  value: 50,
  countryId: 1,
  maxAssignments: 10,
});

console.log('Task created:', taskId);
```

### اختبار تعيين مهمة

```typescript
import { assignTaskToUser } from './server/services/task.service';

const userTaskId = await assignTaskToUser(1, 1);
console.log('Task assigned:', userTaskId);
```

## الأمان

### التحقق من الصلاحيات

جميع APIs الحساسة تتحقق من صلاحيات المستخدم:

```typescript
// مثال: معالجة السحب (Admin فقط)
if (!ctx.user || ctx.user.role !== 'admin') {
  throw new Error('Unauthorized: Admin access required');
}
```

### حماية البيانات المالية

- جميع المعاملات المالية تُسجل في جدول `transactions`
- لا يمكن حذف أو تعديل المعاملات المكتملة
- جميع العمليات المالية تتم داخل transactions لضمان الاتساق

## الأداء

### Caching

استخدم caching للبيانات التي لا تتغير كثيراً:

```typescript
// في Frontend
const { data: countries } = trpc.countries.list.useQuery(undefined, {
  staleTime: 1000 * 60 * 60, // ساعة واحدة
});
```

### Database Indexing

تأكد من إنشاء indexes على الحقول المستخدمة في البحث:

```sql
CREATE INDEX idx_userTasks_userId ON userTasks(userId);
CREATE INDEX idx_userTasks_taskId ON userTasks(taskId);
CREATE INDEX idx_userTasks_status ON userTasks(status);
CREATE INDEX idx_transactions_userId ON transactions(userId);
CREATE INDEX idx_transactions_type ON transactions(type);
```

## المراقبة والتسجيل

### Logging

استخدم logger مناسب لتسجيل جميع العمليات المهمة:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// في الخدمات
logger.info('Task created', { taskId, advertiserId });
logger.error('Payment failed', { error, userId, amount });
```

## الخطوات التالية

1. **اختبار شامل** لجميع الميزات
2. **تكامل خدمات الدفع** (Stripe, PayPal, إلخ)
3. **تكامل خدمات الإشعارات** (SendGrid, Twilio, Firebase)
4. **إعداد بيئة Production**
5. **إطلاق تجريبي (Beta)**

## الدعم

للأسئلة أو المساعدة، يرجى مراجعة:
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)

---

**تم التطوير بواسطة:** Manus AI  
**التاريخ:** نوفمبر 2025

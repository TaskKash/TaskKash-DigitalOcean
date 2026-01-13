# TaskKash Backend - دليل شامل

## نظرة عامة

تم تطوير Backend كامل ومتكامل لمشروع TaskKash يطبق نموذج العمولة المزدوجة المبتكر ونظام الطبقات الديناميكي.

## الميزات الرئيسية المطورة

### ✅ نموذج العمل (Business Model)

- **نظام العمولة المزدوجة**: عمولة من المستخدم والمعلن
- **نظام الطبقات الديناميكي**: 3 طبقات للمستخدمين، 4 طبقات للمعلنين
- **مرحلة الإطلاق**: عمولة مخفضة لأول 3 شهور (5% للمستخدمين، 10% للمعلنين)
- **حساب تلقائي للعمولات**: حساب دقيق لجميع المعاملات المالية

### ✅ إدارة المهام (Task Management)

- **إنشاء المهام**: من قبل المعلنين مع حساب التكلفة الإجمالية
- **تعيين المهام**: للمستخدمين مع حساب الأرباح المتوقعة
- **تقديم المهام**: مع إمكانية إرفاق إثباتات
- **التحقق والمراجعة**: من قبل المعلنين مع نظام التقييم
- **الدفع التلقائي**: حسب طبقة المستخدم (فوري/أسبوعي/شهري)

### ✅ المحفظة الإلكترونية (Wallet)

- **إدارة الرصيد**: إضافة وخصم الأموال تلقائياً
- **طلبات السحب**: مع حد أدنى $100
- **معالجة السحب**: من قبل الأدمن
- **سجل المعاملات**: تتبع كامل لجميع العمليات المالية
- **طرق سحب متعددة**: Vodafone Cash, InstaPay, Fawry, Bank Transfer

### ✅ نظام الطبقات (Tier System)

- **ترقية تلقائية**: بناءً على عدد المهام والتقييم
- **مزايا متدرجة**: كل طبقة لها مزاياها الخاصة
- **تحقق من الأهلية**: API للتحقق من إمكانية الترقية

### ✅ الإشعارات (Notifications)

- **قنوات متعددة**: Email, SMS, Push, In-App
- **إشعارات تلقائية**: لجميع العمليات المهمة
- **قوالب جاهزة**: لجميع أنواع الإشعارات

### ✅ التقارير والإحصائيات (Analytics)

- **لوحة تحكم المستخدم**: إحصائيات المهام والأرباح
- **لوحة تحكم المعلن**: إحصائيات الحملات والإنفاق
- **لوحة تحكم الأدمن**: إحصائيات شاملة للمنصة
- **تقارير الأداء**: لكل مهمة على حدة
- **تقارير الإيرادات**: حسب الفترة الزمنية

## البنية التقنية

```
server/
├── config/
│   └── business.config.ts       # إعدادات نموذج العمل
├── services/
│   ├── commission.service.ts    # خدمة حساب العمولات
│   ├── tier.service.ts          # خدمة إدارة الطبقات
│   ├── wallet.service.ts        # خدمة المحفظة
│   ├── task.service.ts          # خدمة إدارة المهام
│   ├── notification.service.ts  # خدمة الإشعارات
│   └── analytics.service.ts     # خدمة التقارير
├── types/
│   └── business.ts              # تعريفات TypeScript
├── tests/
│   └── commission.test.ts       # اختبارات الوحدة
├── routers.ts                   # APIs الرئيسية
└── routers_analytics.ts         # APIs التقارير
```

## APIs المتاحة

### Commission APIs
- `commission.calculate` - حساب العمولة لمهمة
- `commission.getRates` - الحصول على معدلات العمولة الحالية

### Tier APIs
- `tiers.checkUserEligibility` - التحقق من أهلية ترقية المستخدم
- `tiers.upgradeUser` - ترقية طبقة المستخدم
- `tiers.checkAdvertiserEligibility` - التحقق من أهلية ترقية المعلن
- `tiers.upgradeAdvertiser` - ترقية طبقة المعلن

### Wallet APIs
- `wallet.getBalance` - الحصول على رصيد المستخدم
- `wallet.requestWithdrawal` - طلب سحب
- `wallet.processWithdrawal` - معالجة طلب سحب (Admin)
- `wallet.getTransactionHistory` - سجل المعاملات
- `wallet.getTotalEarnings` - إجمالي الأرباح
- `wallet.getTotalWithdrawals` - إجمالي السحوبات

### Task APIs
- `tasks.create` - إنشاء مهمة جديدة
- `tasks.getAvailable` - الحصول على المهام المتاحة
- `tasks.assign` - تعيين مهمة لمستخدم
- `tasks.submit` - تقديم مهمة مكتملة
- `tasks.verify` - التحقق من مهمة
- `tasks.getUserTasks` - مهام المستخدم
- `tasks.getAdvertiserTasks` - مهام المعلن

### Analytics APIs
- `analytics.getUserDashboard` - لوحة تحكم المستخدم
- `analytics.getAdvertiserDashboard` - لوحة تحكم المعلن
- `analytics.getAdminDashboard` - لوحة تحكم الأدمن
- `analytics.getTaskPerformance` - تقرير أداء مهمة
- `analytics.getRevenueReport` - تقرير الإيرادات

## أمثلة الاستخدام

### حساب العمولة

```typescript
const commission = await trpc.commission.calculate.query({
  taskValue: 100,
  userTier: 'tier1',
  advertiserTier: 'tier1'
});

console.log(commission);
// {
//   taskValue: 100,
//   userCommission: 5,
//   advertiserCommission: 10,
//   userEarnings: 95,
//   advertiserCost: 110,
//   platformRevenue: 15,
//   platformMargin: 15
// }
```

### إنشاء مهمة

```typescript
const taskId = await trpc.tasks.create.mutate({
  advertiserId: 1,
  title: 'مهمة جديدة',
  description: 'وصف المهمة',
  type: 'online',
  value: 50,
  countryId: 1,
  maxAssignments: 10,
});
```

### طلب سحب

```typescript
const transactionId = await trpc.wallet.requestWithdrawal.mutate({
  userId: 1,
  amount: 150,
  method: 'vodafone_cash',
  accountDetails: '01234567890',
});
```

## Cron Jobs المطلوبة

### 1. معالجة المدفوعات المجدولة (كل ساعة)

```typescript
import { processScheduledPayments } from './server/services/task.service';

setInterval(async () => {
  await processScheduledPayments();
}, 1000 * 60 * 60); // كل ساعة
```

### 2. ترقية الطبقات التلقائية (يومياً)

```typescript
import { autoUpgradeTiers } from './server/services/tier.service';

setInterval(async () => {
  await autoUpgradeTiers();
}, 1000 * 60 * 60 * 24); // كل 24 ساعة
```

## تحديثات قاعدة البيانات المطلوبة

```sql
-- جدول users
ALTER TABLE users ADD COLUMN tier VARCHAR(20) DEFAULT 'tier1';
ALTER TABLE users ADD COLUMN balance DECIMAL(10,2) DEFAULT 0;

-- جدول advertisers
ALTER TABLE advertisers ADD COLUMN tier VARCHAR(20) DEFAULT 'tier1';

-- جدول userTasks
ALTER TABLE userTasks ADD COLUMN userEarnings DECIMAL(10,2);
ALTER TABLE userTasks ADD COLUMN userCommission DECIMAL(10,2);
ALTER TABLE userTasks ADD COLUMN scheduledPaymentAt DATETIME;
ALTER TABLE userTasks ADD COLUMN paidAt DATETIME;
ALTER TABLE userTasks ADD COLUMN rating INT;
ALTER TABLE userTasks ADD COLUMN feedback TEXT;

-- جدول transactions
ALTER TABLE transactions ADD COLUMN balanceBefore DECIMAL(10,2);
ALTER TABLE transactions ADD COLUMN balanceAfter DECIMAL(10,2);
ALTER TABLE transactions ADD COLUMN taskId INT;
ALTER TABLE transactions ADD COLUMN processedAt DATETIME;
ALTER TABLE transactions ADD COLUMN note TEXT;
ALTER TABLE transactions ADD COLUMN metadata JSON;

-- Indexes للأداء
CREATE INDEX idx_userTasks_userId ON userTasks(userId);
CREATE INDEX idx_userTasks_taskId ON userTasks(taskId);
CREATE INDEX idx_userTasks_status ON userTasks(status);
CREATE INDEX idx_transactions_userId ON transactions(userId);
CREATE INDEX idx_transactions_type ON transactions(type);
```

## التكامل مع Frontend

### 1. استيراد الخدمات

```typescript
import { trpc } from '@/lib/trpc';
```

### 2. استخدام في المكونات

```typescript
function UserDashboard() {
  const { data: stats } = trpc.analytics.getUserDashboard.useQuery({
    userId: currentUser.id
  });

  return (
    <div>
      <h2>الرصيد: ${stats?.earnings.currentBalance}</h2>
      <p>المهام المكتملة: {stats?.tasks.completed}</p>
      <p>متوسط التقييم: {stats?.tasks.averageRating}</p>
    </div>
  );
}
```

## الخطوات التالية

1. ✅ **تم**: تطوير جميع الخدمات الأساسية
2. ✅ **تم**: إنشاء APIs كاملة
3. ⏳ **قيد الانتظار**: تكامل خدمات الدفع (Stripe, PayPal)
4. ⏳ **قيد الانتظار**: تكامل خدمات الإشعارات (SendGrid, Twilio)
5. ⏳ **قيد الانتظار**: اختبار شامل
6. ⏳ **قيد الانتظار**: إطلاق تجريبي (Beta)

## الملفات المرجعية

- [دليل التنفيذ](./BACKEND_IMPLEMENTATION_GUIDE.md) - دليل تفصيلي للتكامل
- [وثائق API](./API_DOCUMENTATION.md) - وثائق كاملة لجميع APIs
- [Database Schema](./DATABASE_SCHEMA.md) - بنية قاعدة البيانات

## الدعم الفني

للأسئلة أو المساعدة في التكامل، يرجى مراجعة الوثائق المرفقة أو التواصل مع فريق التطوير.

---

**تم التطوير بواسطة:** Manus AI  
**التاريخ:** نوفمبر 2025  
**الإصدار:** 1.0.0

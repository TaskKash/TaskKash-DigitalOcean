# TASKKASH - دليل التثبيت والإعداد

## 📋 المتطلبات الأساسية

قبل البدء، تأكد من تثبيت:

- **Node.js** v22.13.0 أو أحدث
- **pnpm** v9.0.0 أو أحدث
- **PostgreSQL** v14 أو أحدث
- **Git**

## 🚀 خطوات التثبيت

### 1. استنساخ المشروع

```bash
git clone <repository-url>
cd taskkash-v2
```

### 2. تثبيت الحزم

```bash
pnpm install
```

### 3. إعداد قاعدة البيانات

#### إنشاء قاعدة بيانات PostgreSQL

```bash
# الدخول إلى PostgreSQL
psql -U postgres

# إنشاء قاعدة بيانات جديدة
CREATE DATABASE taskkash;

# إنشاء مستخدم (اختياري)
CREATE USER taskkash_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE taskkash TO taskkash_user;
```

### 4. إعداد متغيرات البيئة

أنشئ ملف `.env` في جذر المشروع:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/taskkash"

# JWT Secret (استخدم قيمة عشوائية قوية)
JWT_SECRET="your-super-secret-jwt-key-here"

# OAuth (إذا كنت تستخدم OAuth)
OAUTH_SERVER_URL="https://api.manus.im"
OAUTH_CLIENT_ID="your-client-id"
OAUTH_CLIENT_SECRET="your-client-secret"

# S3 Storage (اختياري)
S3_BUCKET="your-bucket-name"
S3_REGION="us-east-1"
S3_ACCESS_KEY="your-access-key"
S3_SECRET_KEY="your-secret-key"

# Frontend
VITE_APP_TITLE="TASKKASH"
VITE_APP_LOGO="/logo.png"
```

### 5. تطبيق Schema على قاعدة البيانات

```bash
pnpm db:push
```

### 6. ملء قاعدة البيانات بالبيانات الأولية

```bash
npx tsx server/seed.ts
```

هذا سيضيف:
- 5 دول (مصر، السعودية، الإمارات، الكويت، قطر)
- 3 معلنين (Vodafone, Jumia, Uber)
- 6 مهام نموذجية

### 7. تشغيل المشروع

#### وضع التطوير (Development)

```bash
pnpm dev
```

الموقع سيعمل على: `http://localhost:3001`

#### وضع الإنتاج (Production)

```bash
# بناء المشروع
pnpm build

# تشغيل الإنتاج
pnpm start
```

## 🗄️ هيكل قاعدة البيانات

المشروع يحتوي على 6 جداول رئيسية:

### 1. countries (الدول)
- code: كود الدولة (EG, SA, AE, ...)
- nameAr: الاسم بالعربية
- nameEn: الاسم بالإنجليزية
- currency: العملة (EGP, SAR, AED, ...)
- flagEmoji: علم الدولة 🇪🇬

### 2. advertisers (المعلنين)
- slug: معرّف فريد (vodafone-egypt)
- name: اسم المعلن
- logo: شعار المعلن
- coverImage: صورة الغلاف
- description: الوصف
- countryCode: كود الدولة

### 3. tasks (المهام)
- title: عنوان المهمة
- description: الوصف
- reward: المكافأة
- type: نوع المهمة (survey, video, app, ...)
- status: الحالة (available, in-progress, completed)
- advertiserId: معرّف المعلن

### 4. users (المستخدمين)
- name: الاسم
- email: البريد الإلكتروني
- avatar: الصورة الشخصية
- tier: المستوى (bronze, silver, gold, platinum)
- countryCode: كود الدولة

### 5. userTasks (مهام المستخدمين)
- userId: معرّف المستخدم
- taskId: معرّف المهمة
- status: الحالة
- completedAt: تاريخ الإكمال

### 6. transactions (المعاملات المالية)
- userId: معرّف المستخدم
- amount: المبلغ
- type: النوع (earning, withdrawal, bonus)
- status: الحالة (pending, completed, failed)

## 🌐 نظام تعدد اللغات (i18n)

المشروع يدعم لغتين:
- العربية (الافتراضية)
- الإنجليزية

### استخدام الترجمات في المكونات

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>
    </div>
  );
}
```

### إضافة ترجمات جديدة

عدّل ملف `client/src/lib/i18n.ts`:

```typescript
const resources = {
  ar: {
    translation: {
      // أضف ترجماتك العربية هنا
      myNewKey: "النص بالعربية"
    }
  },
  en: {
    translation: {
      // أضف ترجماتك الإنجليزية هنا
      myNewKey: "English text"
    }
  }
};
```

## 🔌 استخدام tRPC APIs

### في Frontend

```typescript
import { trpc } from '@/lib/trpc';

function MyComponent() {
  // الحصول على قائمة الدول
  const { data: countries } = trpc.countries.list.useQuery();
  
  // الحصول على المعلنين
  const { data: advertisers } = trpc.advertisers.list.useQuery({
    countryCode: 'EG' // اختياري
  });
  
  // الحصول على المهام
  const { data: tasks } = trpc.tasks.list.useQuery({
    countryCode: 'EG',
    status: 'available'
  });
  
  return <div>{/* استخدم البيانات */}</div>;
}
```

## 🐛 حل المشاكل الشائعة

### مشكلة: Database connection failed

**الحل:**
- تأكد من تشغيل PostgreSQL
- تحقق من `DATABASE_URL` في `.env`
- تأكد من صلاحيات المستخدم

### مشكلة: Port already in use

**الحل:**
```bash
# إيقاف العملية على Port 3001
lsof -ti:3001 | xargs kill -9

# أو استخدم port آخر
PORT=3002 pnpm dev
```

### مشكلة: Module not found

**الحل:**
```bash
# حذف node_modules وإعادة التثبيت
rm -rf node_modules
pnpm install
```

## 📚 موارد إضافية

- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [i18next Documentation](https://www.i18next.com)
- [React Query Documentation](https://tanstack.com/query/latest)

## 🤝 الدعم

إذا واجهت أي مشاكل:
1. تحقق من ملف `todo.md` للميزات المكتملة
2. راجع ملف `README.md` للمعلومات العامة
3. تواصل مع فريق التطوير

---

**آخر تحديث:** نوفمبر 2025
**الإصدار:** 1.0.0

# TASKKASH API Documentation

## 📚 نظرة عامة

يستخدم TASKKASH **tRPC** لإنشاء APIs type-safe بين Frontend و Backend.

## 🔌 tRPC Endpoints

### Countries API

#### `countries.list`
الحصول على قائمة جميع الدول النشطة

**Request:**
```typescript
trpc.countries.list.useQuery()
```

**Response:**
```typescript
{
  id: number;
  code: string;          // 'EG', 'SA', 'AE', 'KW', 'QA'
  nameAr: string;        // 'مصر'
  nameEn: string;        // 'Egypt'
  currency: string;      // 'EGP'
  currencySymbol: string; // 'ج.م'
  flagEmoji: string;     // '🇪🇬'
  isActive: boolean;
}[]
```

**مثال:**
```typescript
const { data: countries, isLoading } = trpc.countries.list.useQuery();

if (countries) {
  countries.forEach(country => {
    console.log(`${country.flagEmoji} ${country.nameAr} - ${country.currency}`);
  });
}
```

---

#### `countries.getByCode`
الحصول على دولة محددة بالكود

**Request:**
```typescript
trpc.countries.getByCode.useQuery({ code: 'EG' })
```

**Parameters:**
- `code` (string, required): كود الدولة

**Response:**
```typescript
{
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  currency: string;
  currencySymbol: string;
  flagEmoji: string;
  isActive: boolean;
} | null
```

---

### Advertisers API

#### `advertisers.list`
الحصول على قائمة المعلنين

**Request:**
```typescript
trpc.advertisers.list.useQuery({
  countryCode: 'EG' // اختياري
})
```

**Parameters:**
- `countryCode` (string, optional): تصفية حسب الدولة

**Response:**
```typescript
{
  id: number;
  slug: string;              // 'vodafone-egypt'
  name: string;              // 'Vodafone Egypt'
  logo: string;              // URL
  coverImage: string;        // URL
  description: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  countryCode: string;
  isVerified: boolean;
  followers: number;
  rating: number;
  totalCampaigns: number;
  totalUsers: number;
  paymentRate: number;
  createdAt: Date;
}[]
```

**مثال:**
```typescript
// جميع المعلنين
const { data: allAdvertisers } = trpc.advertisers.list.useQuery({});

// معلنين مصر فقط
const { data: egyptAdvertisers } = trpc.advertisers.list.useQuery({
  countryCode: 'EG'
});
```

---

#### `advertisers.getBySlug`
الحصول على معلن محدد

**Request:**
```typescript
trpc.advertisers.getBySlug.useQuery({ slug: 'vodafone-egypt' })
```

**Parameters:**
- `slug` (string, required): معرّف المعلن الفريد

**Response:**
```typescript
{
  id: number;
  slug: string;
  name: string;
  logo: string;
  coverImage: string;
  description: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  countryCode: string;
  isVerified: boolean;
  followers: number;
  rating: number;
  totalCampaigns: number;
  totalUsers: number;
  paymentRate: number;
  createdAt: Date;
} | null
```

---

### Tasks API

#### `tasks.list`
الحصول على قائمة المهام مع تصفية متقدمة

**Request:**
```typescript
trpc.tasks.list.useQuery({
  countryCode: 'EG',        // اختياري
  advertiserId: 1,          // اختياري
  status: 'available'       // اختياري
})
```

**Parameters:**
- `countryCode` (string, optional): تصفية حسب الدولة
- `advertiserId` (number, optional): تصفية حسب المعلن
- `status` ('available' | 'in-progress' | 'completed', optional): تصفية حسب الحالة

**Response:**
```typescript
{
  id: number;
  title: string;
  description: string;
  type: 'survey' | 'video' | 'app' | 'social' | 'quiz' | 'photo' | 'visit';
  reward: number;
  estimatedTime: number;     // بالدقائق
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'available' | 'in-progress' | 'completed';
  advertiserId: number;
  countryCode: string;
  requirements: string | null;
  instructions: string | null;
  maxCompletions: number | null;
  currentCompletions: number;
  expiresAt: Date | null;
  createdAt: Date;
}[]
```

**مثال:**
```typescript
// جميع المهام المتاحة في مصر
const { data: tasks } = trpc.tasks.list.useQuery({
  countryCode: 'EG',
  status: 'available'
});

// مهام Vodafone فقط
const { data: vodafoneTasks } = trpc.tasks.list.useQuery({
  advertiserId: 1
});
```

---

#### `tasks.getById`
الحصول على مهمة محددة

**Request:**
```typescript
trpc.tasks.getById.useQuery({ id: 1 })
```

**Parameters:**
- `id` (number, required): معرّف المهمة

**Response:**
```typescript
{
  id: number;
  title: string;
  description: string;
  type: string;
  reward: number;
  estimatedTime: number;
  difficulty: string;
  status: string;
  advertiserId: number;
  countryCode: string;
  requirements: string | null;
  instructions: string | null;
  maxCompletions: number | null;
  currentCompletions: number;
  expiresAt: Date | null;
  createdAt: Date;
} | null
```

---

## 🔧 استخدام tRPC في Frontend

### إعداد tRPC Client

```typescript
// client/src/lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../server/routers';

export const trpc = createTRPCReact<AppRouter>();
```

### استخدام في المكونات

```typescript
import { trpc } from '@/lib/trpc';

function MyComponent() {
  // استعلام بسيط
  const { data, isLoading, error } = trpc.countries.list.useQuery();
  
  // استعلام مع معاملات
  const { data: tasks } = trpc.tasks.list.useQuery({
    countryCode: 'EG',
    status: 'available'
  });
  
  // معالجة الحالات
  if (isLoading) return <div>جاري التحميل...</div>;
  if (error) return <div>حدث خطأ: {error.message}</div>;
  
  return (
    <div>
      {data?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Mutations (إضافة/تحديث/حذف)

```typescript
// مثال: إضافة مهمة جديدة
const addTask = trpc.tasks.create.useMutation({
  onSuccess: () => {
    console.log('تم إضافة المهمة بنجاح!');
  },
  onError: (error) => {
    console.error('فشل إضافة المهمة:', error);
  }
});

// استخدام
addTask.mutate({
  title: 'مهمة جديدة',
  description: 'وصف المهمة',
  reward: 10,
  // ...
});
```

---

## 🗄️ Database Schema

### Countries Table
```sql
CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  code VARCHAR(2) UNIQUE NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  currency_symbol VARCHAR(10) NOT NULL,
  flag_emoji VARCHAR(10) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Advertisers Table
```sql
CREATE TABLE advertisers (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  logo TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  description TEXT,
  website VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  country_code VARCHAR(2) REFERENCES countries(code),
  is_verified BOOLEAN DEFAULT false,
  followers INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_campaigns INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  payment_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  reward DECIMAL(10,2) NOT NULL,
  estimated_time INTEGER NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'available',
  advertiser_id INTEGER REFERENCES advertisers(id),
  country_code VARCHAR(2) REFERENCES countries(code),
  requirements TEXT,
  instructions TEXT,
  max_completions INTEGER,
  current_completions INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Authentication

### JWT Token
```typescript
// الحصول على Token
const token = localStorage.getItem('auth_token');

// إضافة Token في Headers
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Protected Routes
```typescript
// في tRPC Context
export const createContext = ({ req, res }: CreateContextOptions) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = verifyToken(token);
  
  return {
    user,
    req,
    res
  };
};
```

---

## 📊 Error Handling

### Error Types
```typescript
// TRPCError codes
- UNAUTHORIZED: غير مصرح
- FORBIDDEN: ممنوع
- NOT_FOUND: غير موجود
- BAD_REQUEST: طلب خاطئ
- INTERNAL_SERVER_ERROR: خطأ في الخادم
```

### معالجة الأخطاء
```typescript
const { data, error } = trpc.tasks.getById.useQuery({ id: 999 });

if (error) {
  if (error.data?.code === 'NOT_FOUND') {
    console.log('المهمة غير موجودة');
  } else if (error.data?.code === 'UNAUTHORIZED') {
    console.log('يجب تسجيل الدخول');
  }
}
```

---

## 🚀 Performance

### Caching
```typescript
// تفعيل Cache
const { data } = trpc.countries.list.useQuery(undefined, {
  staleTime: 1000 * 60 * 5, // 5 دقائق
  cacheTime: 1000 * 60 * 10 // 10 دقائق
});
```

### Prefetching
```typescript
// تحميل مسبق للبيانات
const utils = trpc.useContext();

utils.tasks.list.prefetch({
  countryCode: 'EG',
  status: 'available'
});
```

---

## 📝 أمثلة عملية

### مثال 1: عرض قائمة المهام
```typescript
function TasksList() {
  const [country, setCountry] = useState('EG');
  
  const { data: tasks, isLoading } = trpc.tasks.list.useQuery({
    countryCode: country,
    status: 'available'
  });
  
  return (
    <div>
      <select value={country} onChange={(e) => setCountry(e.target.value)}>
        <option value="EG">🇪🇬 مصر</option>
        <option value="SA">🇸🇦 السعودية</option>
      </select>
      
      {isLoading ? (
        <div>جاري التحميل...</div>
      ) : (
        <div>
          {tasks?.map(task => (
            <div key={task.id}>
              <h3>{task.title}</h3>
              <p>{task.reward} {task.countryCode === 'EG' ? 'ج.م' : 'ر.س'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### مثال 2: صفحة معلن
```typescript
function AdvertiserPage({ slug }: { slug: string }) {
  const { data: advertiser } = trpc.advertisers.getBySlug.useQuery({ slug });
  const { data: tasks } = trpc.tasks.list.useQuery({
    advertiserId: advertiser?.id
  }, {
    enabled: !!advertiser?.id // تشغيل فقط عند وجود ID
  });
  
  if (!advertiser) return <div>معلن غير موجود</div>;
  
  return (
    <div>
      <img src={advertiser.coverImage} alt="Cover" />
      <img src={advertiser.logo} alt="Logo" />
      <h1>{advertiser.name}</h1>
      <p>{advertiser.description}</p>
      
      <h2>المهام ({tasks?.length})</h2>
      {tasks?.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

---

## 🔗 موارد إضافية

- [tRPC Documentation](https://trpc.io)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Drizzle ORM Documentation](https://orm.drizzle.team)

---

**آخر تحديث:** نوفمبر 2025

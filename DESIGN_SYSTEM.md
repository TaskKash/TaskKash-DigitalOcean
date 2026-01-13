# TASKKASH Design System v2.0

## 🎨 نظام التصميم الموحد

### 1. الألوان (Colors)

#### الألوان الأساسية (Primary Colors)
```css
--primary-green: #10B981;      /* الأخضر الرئيسي */
--primary-green-dark: #059669; /* أخضر داكن */
--primary-green-light: #34D399; /* أخضر فاتح */
--primary-orange: #F59E0B;     /* البرتقالي الرئيسي */
--primary-orange-dark: #D97706; /* برتقالي داكن */
--primary-orange-light: #FBBF24; /* برتقالي فاتح */
```

#### الألوان الثانوية (Secondary Colors)
```css
--secondary-blue: #3B82F6;     /* أزرق */
--secondary-purple: #8B5CF6;   /* بنفسجي */
--secondary-pink: #EC4899;     /* وردي */
--secondary-yellow: #EAB308;   /* أصفر */
```

#### الألوان المحايدة (Neutral Colors)
```css
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

#### الألوان الدلالية (Semantic Colors)
```css
--success: #10B981;   /* نجاح */
--error: #EF4444;     /* خطأ */
--warning: #F59E0B;   /* تحذير */
--info: #3B82F6;      /* معلومات */
```

#### الخلفيات (Backgrounds)
```css
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;
--bg-tertiary: #F3F4F6;
--bg-dark: #111827;
```

---

### 2. التدرجات اللونية (Gradients)

```css
--gradient-primary: linear-gradient(135deg, #10B981 0%, #F59E0B 100%);
--gradient-secondary: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
--gradient-success: linear-gradient(135deg, #10B981 0%, #34D399 100%);
--gradient-card: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
```

---

### 3. الطباعة (Typography)

#### الخطوط (Fonts)
```css
--font-primary: 'Cairo', 'Tajawal', sans-serif;  /* للعربية */
--font-secondary: 'Inter', 'Roboto', sans-serif; /* للإنجليزية */
--font-mono: 'Fira Code', monospace;             /* للأكواد */
```

#### أحجام الخطوط (Font Sizes)
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

#### أوزان الخطوط (Font Weights)
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

---

### 4. المسافات (Spacing)

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
```

---

### 5. الحواف المستديرة (Border Radius)

```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
--radius-full: 9999px;   /* دائري كامل */
```

---

### 6. الظلال (Shadows)

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

---

### 7. الأزرار (Buttons)

#### Primary Button
```css
background: var(--gradient-primary);
color: white;
padding: 12px 24px;
border-radius: var(--radius-lg);
font-weight: var(--font-semibold);
box-shadow: var(--shadow-md);
```

#### Secondary Button
```css
background: transparent;
border: 2px solid var(--primary-green);
color: var(--primary-green);
padding: 12px 24px;
border-radius: var(--radius-lg);
font-weight: var(--font-semibold);
```

---

### 8. البطاقات (Cards)

```css
background: white;
border-radius: var(--radius-xl);
padding: var(--spacing-lg);
box-shadow: var(--shadow-md);
border: 1px solid var(--gray-200);
```

---

### 9. الشعار (Logo)

#### مواضع الشعار:
- **Header:** في الأعلى يسار (RTL) - حجم 40px
- **Splash Screen:** في المنتصف - حجم 120px
- **Onboarding:** في الأعلى - حجم 60px
- **Auth Pages:** في الأعلى - حجم 80px

#### الألوان:
- على خلفية بيضاء: الشعار الملون
- على خلفية داكنة: الشعار الأبيض

---

### 10. الأيقونات (Icons)

#### المكتبة:
- Lucide React Icons

#### الأحجام:
```css
--icon-xs: 16px;
--icon-sm: 20px;
--icon-md: 24px;
--icon-lg: 32px;
--icon-xl: 48px;
```

---

### 11. الانتقالات (Transitions)

```css
--transition-fast: 150ms ease-in-out;
--transition-normal: 300ms ease-in-out;
--transition-slow: 500ms ease-in-out;
```

---

### 12. نقاط التوقف (Breakpoints)

```css
--breakpoint-sm: 640px;   /* Mobile */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large Desktop */
```

---

### 13. الهيدر (Header)

```css
height: 64px;
background: white;
box-shadow: var(--shadow-sm);
padding: 0 var(--spacing-lg);
display: flex;
align-items: center;
justify-content: space-between;
```

**المحتوى:**
- الشعار (يسار)
- العنوان (وسط)
- الإشعارات + القائمة (يمين)

---

### 14. شريط التنقل السفلي (Bottom Navigation)

```css
height: 72px;
background: white;
box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
display: flex;
justify-content: space-around;
align-items: center;
```

**العناصر:**
- 4 أيقونات رئيسية
- الأيقونة النشطة: لون أخضر + bold
- الأيقونات غير النشطة: رمادي

---

### 15. نظام Profile Strength

#### الألوان حسب المستوى:
```css
0-30%:   --color: #EF4444;  /* أحمر */
31-60%:  --color: #F59E0B;  /* برتقالي */
61-90%:  --color: #3B82F6;  /* أزرق */
91-100%: --color: #10B981;  /* أخضر */
```

#### شريط التقدم:
```css
height: 8px;
background: var(--gray-200);
border-radius: var(--radius-full);
overflow: hidden;
```

---

### 16. Badges System

#### Bronze (30%)
```css
background: linear-gradient(135deg, #CD7F32 0%, #B87333 100%);
color: white;
icon: 🥉
```

#### Silver (50%)
```css
background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
color: white;
icon: 🥈
```

#### Gold (75%)
```css
background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
color: white;
icon: 🥇
```

#### Platinum (100%)
```css
background: linear-gradient(135deg, #E5E4E2 0%, #B4B4B4 100%);
color: white;
icon: 💎
```

---

### 17. الرسائل التحفيزية (Motivational Messages)

```css
background: var(--gradient-card);
border-left: 4px solid var(--primary-green);
padding: var(--spacing-md);
border-radius: var(--radius-lg);
```

**الأيقونات:**
- 🎉 للنجاح
- 🚀 للتقدم
- 💰 للمكافآت
- 🛡️ للأمان
- ⚡ للسرعة

---

### 18. الحالات التفاعلية (Interactive States)

#### Hover
```css
transform: translateY(-2px);
box-shadow: var(--shadow-lg);
transition: var(--transition-normal);
```

#### Active
```css
transform: scale(0.98);
```

#### Disabled
```css
opacity: 0.5;
cursor: not-allowed;
```

---

### 19. Loading States

#### Skeleton
```css
background: linear-gradient(
  90deg,
  var(--gray-200) 0%,
  var(--gray-300) 50%,
  var(--gray-200) 100%
);
animation: shimmer 2s infinite;
```

#### Spinner
```css
border: 3px solid var(--gray-200);
border-top-color: var(--primary-green);
border-radius: 50%;
animation: spin 1s linear infinite;
```

---

### 20. Empty States

```css
text-align: center;
padding: var(--spacing-3xl);
color: var(--gray-500);
```

**الأيقونات:**
- 📭 لا توجد مهام
- 💰 لا توجد معاملات
- 🔔 لا توجد إشعارات

---

## 🎯 مبادئ التصميم

### 1. البساطة (Simplicity)
- تصميم نظيف وواضح
- لا تشتيت للمستخدم
- التركيز على المحتوى

### 2. الاتساق (Consistency)
- نفس الألوان في كل مكان
- نفس الخطوط والأحجام
- نفس المسافات والحواف

### 3. التسلسل الهرمي (Hierarchy)
- العناوين أكبر وأثقل
- النصوص الثانوية أصغر وأخف
- الأزرار بارزة وواضحة

### 4. التباين (Contrast)
- ألوان واضحة ومقروءة
- تباين كافٍ بين النص والخلفية
- accessibility-friendly

### 5. التغذية الراجعة (Feedback)
- استجابة فورية للإجراءات
- رسائل واضحة للنجاح/الفشل
- loading states واضحة

---

## 📱 تجربة المستخدم (UX)

### 1. التنقل
- سهل وبديهي
- لا يزيد عن 3 نقرات للوصول لأي صفحة
- breadcrumbs واضحة

### 2. الاستجابة
- responsive على جميع الأحجام
- mobile-first approach
- touch-friendly (44px minimum)

### 3. الأداء
- تحميل سريع
- lazy loading للصور
- code splitting

### 4. إمكانية الوصول (Accessibility)
- ARIA labels
- keyboard navigation
- screen reader friendly

---

**تاريخ الإنشاء:** 31 أكتوبر 2025  
**الإصدار:** 2.0  
**الحالة:** نشط

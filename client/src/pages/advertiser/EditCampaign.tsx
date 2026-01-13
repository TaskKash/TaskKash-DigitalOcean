import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Save, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function EditCampaign() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: 'حملة إطلاق المنتج الجديد',
    description: 'حملة استبيان لقياس رضا العملاء عن المنتج الجديد وجمع آرائهم حول الميزات والتحسينات المطلوبة',
    type: 'استبيان',
    category: 'أبحاث السوق',
    reward: 50,
    totalTasks: 1000,
    duration: 5,
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    ageMin: 18,
    ageMax: 45,
    gender: 'all',
    location: 'السعودية',
    interests: ['تقنية', 'تسوق', 'أعمال']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('تم حفظ التعديلات بنجاح');
    setTimeout(() => {
      setLocation('/advertiser/campaigns/1');
    }, 1000);
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setLocation('/advertiser/campaigns/1')}
            className="flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            العودة إلى تفاصيل الحملة
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">تعديل الحملة</h1>
              <p className="text-sm text-muted-foreground">تحديث معلومات الحملة</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLocation('/advertiser/campaigns/1')}>
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
              <Button onClick={handleSubmit}>
                <Save className="w-4 h-4 ml-2" />
                حفظ التغييرات
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">المعلومات الأساسية</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">اسم الحملة *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">الوصف *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">نوع المهمة *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="استبيان">استبيان</option>
                    <option value="فيديو">مشاهدة فيديو</option>
                    <option value="تطبيق">تحميل تطبيق</option>
                    <option value="مراجعة">كتابة مراجعة</option>
                    <option value="تسوق">تسوق عبر الإنترنت</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="category">الفئة *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="أبحاث السوق">أبحاث السوق</option>
                    <option value="تسويق">تسويق</option>
                    <option value="منتجات">منتجات</option>
                    <option value="خدمات">خدمات</option>
                    <option value="تقنية">تقنية</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Task Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">تفاصيل المهمة</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="reward">المكافأة (ج.م) *</Label>
                  <Input
                    id="reward"
                    type="number"
                    value={formData.reward}
                    onChange={(e) => handleChange('reward', parseInt(e.target.value))}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="totalTasks">عدد المهام *</Label>
                  <Input
                    id="totalTasks"
                    type="number"
                    value={formData.totalTasks}
                    onChange={(e) => handleChange('totalTasks', parseInt(e.target.value))}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">المدة (دقائق) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">الميزانية الإجمالية</p>
                <p className="text-2xl font-bold text-primary">
                  {(formData.reward * formData.totalTasks).toLocaleString()} ج.م
                </p>
              </div>
            </div>
          </Card>

          {/* Schedule */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">الجدولة</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">تاريخ البدء *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">تاريخ الانتهاء *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Targeting */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">الاستهداف</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ageMin">العمر من *</Label>
                  <Input
                    id="ageMin"
                    type="number"
                    value={formData.ageMin}
                    onChange={(e) => handleChange('ageMin', parseInt(e.target.value))}
                    min="13"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ageMax">العمر إلى *</Label>
                  <Input
                    id="ageMax"
                    type="number"
                    value={formData.ageMax}
                    onChange={(e) => handleChange('ageMax', parseInt(e.target.value))}
                    min="13"
                    max="100"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="gender">الجنس *</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="all">الكل</option>
                  <option value="male">ذكور</option>
                  <option value="female">إناث</option>
                </select>
              </div>
              <div>
                <Label htmlFor="location">الموقع *</Label>
                <select
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="السعودية">السعودية</option>
                  <option value="الإمارات">الإمارات</option>
                  <option value="الكويت">الكويت</option>
                  <option value="قطر">قطر</option>
                  <option value="البحرين">البحرين</option>
                  <option value="عمان">عمان</option>
                </select>
              </div>
              <div>
                <Label>الاهتمامات</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {['تقنية', 'تسوق', 'أعمال', 'رياضة', 'سفر', 'طعام', 'صحة', 'تعليم', 'ترفيه'].map(interest => (
                    <label key={interest} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(interest)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleChange('interests', [...formData.interests, interest]);
                          } else {
                            handleChange('interests', formData.interests.filter(i => i !== interest));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/advertiser/campaigns/1')}
            >
              <X className="w-4 h-4 ml-2" />
              إلغاء
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 ml-2" />
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


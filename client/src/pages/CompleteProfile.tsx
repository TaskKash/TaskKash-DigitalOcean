import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { User, Calendar, MapPin, Briefcase, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';

export default function CompleteProfile() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    gender: '',
    city: '',
    education: '',
    occupation: ''
  });

  const { refreshUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const progress = Object.values(formData).filter(v => v).length / Object.keys(formData).length * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields = Object.entries(formData).filter(([, value]) => !value);
    if (missingFields.length > 0) {
      toast.error('الرجاء ملء جميع الحقول');
      return;
    }

    setIsLoading(true);

    try {
      // Calculate approximate age from birthdate
      const birthYear = new Date(formData.birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;

      // Update name if needed
      if (formData.fullName) {
        await fetch('/api/profile/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.fullName })
        });
      }

      // Map occupation to workType/employment
      let employment = 'other';
      if (formData.occupation === 'employee' || formData.occupation === 'business') employment = 'office';
      if (formData.occupation === 'freelancer') employment = 'remote';

      // Complete profile
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gender: formData.gender,
          ageRange: `${age} years old`, 
          education: formData.education,
          employment: employment,
          city: formData.city
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`تم إكمال الملف بنجاح! +${data.reward || 8} ج.م`);
        await refreshUser();
        setTimeout(() => {
          setLocation('/');
        }, 1500);
      } else {
        toast.error(data.error || 'حدث خطأ أثناء حفظ البيانات');
      }
    } catch (error) {
      console.error('Profile complete error:', error);
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center text-white">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">أكمل ملفك الشخصي</h1>
          <p className="opacity-90">
            ساعدنا في تخصيص تجربتك
          </p>
        </div>

        {/* Progress */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">اكتمال الملف</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </Card>

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">الاسم الكامل *</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="أحمد محمد"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="pr-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="birthDate">تاريخ الميلاد *</Label>
              <div className="relative">
                <Calendar className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="pr-10"
                />
              </div>
            </div>

            <div>
              <Label>الجنس *</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الجنس" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>المدينة *</Label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                  <SelectTrigger className="pr-10">
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="riyadh">الرياض</SelectItem>
                    <SelectItem value="jeddah">جدة</SelectItem>
                    <SelectItem value="dammam">الدمام</SelectItem>
                    <SelectItem value="makkah">مكة المكرمة</SelectItem>
                    <SelectItem value="madinah">المدينة المنورة</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>المستوى التعليمي *</Label>
              <Select value={formData.education} onValueChange={(value) => setFormData({ ...formData, education: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المستوى التعليمي" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">ثانوي</SelectItem>
                  <SelectItem value="diploma">دبلوم</SelectItem>
                  <SelectItem value="bachelor">بكالوريوس</SelectItem>
                  <SelectItem value="master">ماجستير</SelectItem>
                  <SelectItem value="phd">دكتوراه</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>المهنة *</Label>
              <div className="relative">
                <Briefcase className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                <Select value={formData.occupation} onValueChange={(value) => setFormData({ ...formData, occupation: value })}>
                  <SelectTrigger className="pr-10">
                    <SelectValue placeholder="اختر المهنة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">طالب</SelectItem>
                    <SelectItem value="employee">موظف</SelectItem>
                    <SelectItem value="business">صاحب عمل</SelectItem>
                    <SelectItem value="freelancer">عمل حر</SelectItem>
                    <SelectItem value="unemployed">باحث عن عمل</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 mt-6" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'إكمال التسجيل'}
            </Button>
          </form>
        </Card>

        {/* Info */}
        <Card className="p-4 bg-white/95">
          <p className="text-sm text-center text-muted-foreground">
            💡 هذه المعلومات تساعدنا في عرض مهام مناسبة لك
          </p>
        </Card>
      </div>
    </div>
  );
}


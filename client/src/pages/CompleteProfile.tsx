import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { User, Calendar, MapPin, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

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

  const progress = Object.values(formData).filter(v => v).length / Object.keys(formData).length * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields = Object.entries(formData).filter(([, value]) => !value);
    if (missingFields.length > 0) {
      toast.error('الرجاء ملء جميع الحقول');
      return;
    }

    toast.success('تم إكمال الملف الشخصي!');
    setTimeout(() => {
      setLocation('/');
    }, 1000);
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

            <Button type="submit" className="w-full h-12 mt-6">
              إكمال التسجيل
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


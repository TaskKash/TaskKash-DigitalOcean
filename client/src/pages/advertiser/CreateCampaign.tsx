import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useLocation } from 'wouter';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'المعلومات الأساسية', description: 'اسم الحملة والوصف' },
  { id: 2, title: 'تفاصيل المهمة', description: 'نوع المهمة والمتطلبات' },
  { id: 3, title: 'الاستهداف', description: 'الجمهور المستهدف' },
  { id: 4, title: 'الميزانية', description: 'المكافأة والميزانية' },
  { id: 5, title: 'المراجعة', description: 'مراجعة وتأكيد' }
];

export default function CreateCampaign() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    taskType: '',
    requirements: '',
    targetAge: [] as string[],
    targetGender: 'all',
    targetLocation: [] as string[],
    targetNeighborhood: [] as string[],
    targetCarType: [] as string[],
    targetEducation: [] as string[],
    targetMaritalStatus: [] as string[],
    targetChildren: [] as string[],
    targetHousingType: [] as string[],
    targetJobType: [] as string[],
    targetIncome: [] as string[],
    targetInterests: [] as string[],
    reward: '',
    budget: '',
    totalTasks: ''
  });

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast.success('تم إنشاء الحملة بنجاح!');
    setLocation('/advertiser/new-dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-primary">إنشاء حملة جديدة</h1>
          <p className="text-sm text-muted-foreground">املأ التفاصيل لإطلاق حملتك</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold">
              الخطوة {currentStep} من {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          
          <div className="flex items-center justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  step.id === currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    step.id < currentStep
                      ? 'bg-primary text-white'
                      : step.id === currentStep
                      ? 'bg-primary text-white'
                      : 'bg-muted'
                  }`}
                >
                  {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <p className="text-xs hidden md:block">{step.title}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Step Content */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-2">{steps[currentStep - 1].title}</h2>
          <p className="text-sm text-muted-foreground mb-6">{steps[currentStep - 1].description}</p>

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">اسم الحملة *</Label>
                <Input
                  id="name"
                  placeholder="مثال: حملة إطلاق المنتج الجديد"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">وصف الحملة *</Label>
                <Textarea
                  id="description"
                  placeholder="اشرح أهداف الحملة والنتائج المتوقعة..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                />
              </div>
            </div>
          )}

          {/* Step 2: Task Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label>نوع المهمة *</Label>
                <Select value={formData.taskType} onValueChange={(value) => setFormData({ ...formData, taskType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع المهمة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="survey">📋 استبيان</SelectItem>
                    <SelectItem value="video">🎥 مشاهدة فيديو</SelectItem>
                    <SelectItem value="app">📱 تحميل تطبيق</SelectItem>
                    <SelectItem value="social">👥 سوشيال ميديا</SelectItem>
                    <SelectItem value="quiz">❓ اختبار</SelectItem>
                    <SelectItem value="photo">📸 تصوير</SelectItem>
                    <SelectItem value="visit">📍 زيارة ميدانية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="requirements">المتطلبات *</Label>
                <Textarea
                  id="requirements"
                  placeholder="اكتب متطلبات المهمة (سطر لكل متطلب)"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={5}
                />
              </div>
            </div>
          )}

          {/* Step 3: Targeting */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">الفئة العمرية</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['18-24', '25-34', '35-44', '45+'].map((age) => (
                    <div key={age} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`age-${age}`}
                        checked={formData.targetAge.includes(age)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, targetAge: [...formData.targetAge, age] });
                          } else {
                            setFormData({ ...formData, targetAge: formData.targetAge.filter(a => a !== age) });
                          }
                        }}
                      />
                      <Label htmlFor={`age-${age}`} className="cursor-pointer">{age}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-3 block">الجنس</Label>
                <RadioGroup value={formData.targetGender} onValueChange={(value) => setFormData({ ...formData, targetGender: value })}>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="cursor-pointer">الكل</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer">ذكور</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer">إناث</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-3 block">الموقع</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['القاهرة', 'الإسكندرية', 'الجيزة', 'الشرقية', 'الدقهلية', 'البحيرة', 'المنوفية', 'القليوبية', 'الغربية', 'بورسعيد', 'السويس', 'الإسماعيلية'].map((city) => (
                    <div key={city} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`city-${city}`}
                        checked={formData.targetLocation.includes(city)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, targetLocation: [...formData.targetLocation, city] });
                          } else {
                            setFormData({ ...formData, targetLocation: formData.targetLocation.filter(c => c !== city) });
                          }
                        }}
                      />
                      <Label htmlFor={`city-${city}`} className="cursor-pointer">{city}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* نوع السيارة */}
              <div>
                <Label className="mb-3 block">نوع السيارة</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['لا يمتلك سيارة', 'سيارة اقتصادية', 'سيارة متوسطة', 'سيارة فاخرة', 'SUV', 'سيارة رياضية'].map((carType) => (
                    <div key={carType} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`car-${carType}`}
                        checked={formData.targetCarType.includes(carType)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, targetCarType: [...formData.targetCarType, carType] });
                          } else {
                            setFormData({ ...formData, targetCarType: formData.targetCarType.filter(c => c !== carType) });
                          }
                        }}
                      />
                      <Label htmlFor={`car-${carType}`} className="cursor-pointer text-sm">{carType}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* مكان السكن (الأحياء) */}
              <div>
                <Label className="mb-3 block">مكان السكن (الأحياء)</Label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {['مدينة نصر', 'التجمع الخامس', 'المعادي', 'الزمالك', 'مصر الجديدة', 'المهندسين', 'الدقي', '6 أكتوبر', 'الشيخ زايد', 'سموحة', 'سيدي جابر', 'محرم بك'].map((neighborhood) => (
                    <div key={neighborhood} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`neighborhood-${neighborhood}`}
                        checked={formData.targetNeighborhood.includes(neighborhood)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, targetNeighborhood: [...formData.targetNeighborhood, neighborhood] });
                          } else {
                            setFormData({ ...formData, targetNeighborhood: formData.targetNeighborhood.filter(n => n !== neighborhood) });
                          }
                        }}
                      />
                      <Label htmlFor={`neighborhood-${neighborhood}`} className="cursor-pointer text-sm">{neighborhood}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* مستوى التعليم */}
              <div>
                <Label className="mb-3 block">مستوى التعليم</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['ابتدائي', 'ثانوي', 'جامعي', 'دراسات عليا'].map((education) => (
                    <div key={education} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`education-${education}`}
                        checked={formData.targetEducation.includes(education)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, targetEducation: [...formData.targetEducation, education] });
                          } else {
                            setFormData({ ...formData, targetEducation: formData.targetEducation.filter(e => e !== education) });
                          }
                        }}
                      />
                      <Label htmlFor={`education-${education}`} className="cursor-pointer text-sm">{education}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* الحالة الاجتماعية */}
              <div>
                <Label className="mb-3 block">الحالة الاجتماعية</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['أعزب', 'متزوج', 'مطلق', 'أرمل'].map((status) => (
                    <div key={status} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`marital-${status}`}
                        checked={formData.targetMaritalStatus.includes(status)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, targetMaritalStatus: [...formData.targetMaritalStatus, status] });
                          } else {
                            setFormData({ ...formData, targetMaritalStatus: formData.targetMaritalStatus.filter(s => s !== status) });
                          }
                        }}
                      />
                      <Label htmlFor={`marital-${status}`} className="cursor-pointer text-sm">{status}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* عدد الأطفال */}
              <div>
                <Label className="mb-3 block">عدد الأطفال</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['0', '1-2', '3-4', '5+'].map((children) => (
                    <div key={children} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`children-${children}`}
                        checked={formData.targetChildren.includes(children)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, targetChildren: [...formData.targetChildren, children] });
                          } else {
                            setFormData({ ...formData, targetChildren: formData.targetChildren.filter(c => c !== children) });
                          }
                        }}
                      />
                      <Label htmlFor={`children-${children}`} className="cursor-pointer text-sm">{children}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* نوع السكن */}
              <div>
                <Label className="mb-3 block">نوع السكن</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['ملك', 'إيجار', 'مع العائلة'].map((housing) => (
                    <div key={housing} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`housing-${housing}`}
                        checked={formData.targetHousingType.includes(housing)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, targetHousingType: [...formData.targetHousingType, housing] });
                          } else {
                            setFormData({ ...formData, targetHousingType: formData.targetHousingType.filter(h => h !== housing) });
                          }
                        }}
                      />
                      <Label htmlFor={`housing-${housing}`} className="cursor-pointer text-sm">{housing}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* نوع الوظيفة */}
              <div>
                <Label className="mb-3 block">نوع الوظيفة</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['موظف حكومي', 'موظف خاص', 'صاحب عمل', 'طالب', 'متقاعد', 'عاطل'].map((job) => (
                    <div key={job} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`job-${job}`}
                        checked={formData.targetJobType.includes(job)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, targetJobType: [...formData.targetJobType, job] });
                          } else {
                            setFormData({ ...formData, targetJobType: formData.targetJobType.filter(j => j !== job) });
                          }
                        }}
                      />
                      <Label htmlFor={`job-${job}`} className="cursor-pointer text-sm">{job}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* الدخل الشهري */}
              <div>
                <Label className="mb-3 block">الدخل الشهري (ج.م)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['أقل من 3000', '3000-5000', '5000-10000', '10000-20000', '20000+'].map((income) => (
                    <div key={income} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`income-${income}`}
                        checked={formData.targetIncome.includes(income)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, targetIncome: [...formData.targetIncome, income] });
                          } else {
                            setFormData({ ...formData, targetIncome: formData.targetIncome.filter(i => i !== income) });
                          }
                        }}
                      />
                      <Label htmlFor={`income-${income}`} className="cursor-pointer text-sm">{income}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* الاهتمامات */}
              <div>
                <Label className="mb-3 block">الاهتمامات</Label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {['رياضة', 'تكنولوجيا', 'طعام', 'سفر', 'موضة', 'ألعاب', 'قراءة', 'موسيقى', 'سينما', 'تسوق', 'صحة', 'جمال'].map((interest) => (
                    <div key={interest} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`interest-${interest}`}
                        checked={formData.targetInterests.includes(interest)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, targetInterests: [...formData.targetInterests, interest] });
                          } else {
                            setFormData({ ...formData, targetInterests: formData.targetInterests.filter(i => i !== interest) });
                          }
                        }}
                      />
                      <Label htmlFor={`interest-${interest}`} className="cursor-pointer text-sm">{interest}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Budget */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="reward">المكافأة لكل مهمة (ج.م) *</Label>
                <Input
                  id="reward"
                  type="number"
                  placeholder="10"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="totalTasks">عدد المهام المطلوبة *</Label>
                <Input
                  id="totalTasks"
                  type="number"
                  placeholder="1000"
                  value={formData.totalTasks}
                  onChange={(e) => setFormData({ ...formData, totalTasks: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="budget">إجمالي الميزانية (ج.م) *</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder={formData.reward && formData.totalTasks ? String(Number(formData.reward) * Number(formData.totalTasks)) : '10000'}
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
                {formData.reward && formData.totalTasks && (
                  <p className="text-sm text-muted-foreground mt-2">
                    الميزانية المقترحة: {Number(formData.reward) * Number(formData.totalTasks)} ج.م
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">اسم الحملة</p>
                  <p className="font-semibold">{formData.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">نوع المهمة</p>
                  <p className="font-semibold">{formData.taskType || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المكافأة</p>
                  <p className="font-semibold">{formData.reward || '-'} ج.م</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">عدد المهام</p>
                  <p className="font-semibold">{formData.totalTasks || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الميزانية</p>
                  <p className="font-semibold">{formData.budget || '-'} ج.م</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الاستهداف</p>
                  <p className="font-semibold">
                    {formData.targetAge.length > 0 ? formData.targetAge.join(', ') : 'الكل'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">الوصف</p>
                <p className="text-sm">{formData.description || '-'}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious} className="flex-1">
              <ArrowLeft className="w-5 h-5 ml-2" />
              السابق
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1">
            {currentStep === steps.length ? 'إنشاء الحملة' : 'التالي'}
            {currentStep < steps.length && <ArrowRight className="w-5 h-5 mr-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}


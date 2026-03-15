import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Play, Save, CheckCircle2, Languages, Target, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function CreateCampaign() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const isRTL = i18n.language === 'ar';
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State matching the database schema for Video Tasks
  const [formData, setFormData] = useState({
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
    videoUrl: '',
    reward: 10,
    completionsNeeded: 1000,
    duration: 3, // minutes
    difficulty: 'easy',
    
    // Targeting Criteria
    targetGender: 'all',
    targetAgeMin: 18,
    targetAgeMax: 65,
    requiresMinimumTier: 'bronze',
    targetLocations: [] as string[],
  });

  const governorates = [
    'Cairo', 'Alexandria', 'Giza', 'Dakahlia', 'Red Sea', 'Beheira', 
    'Fayoum', 'Gharbia', 'Ismailia', 'Menofia', 'Minya', 'Qalyubia', 
    'New Valley', 'Suez', 'Aswan', 'Assiut', 'Beni Suef', 'Port Said', 
    'Damietta', 'Sharkia', 'South Sinai', 'Kafr El Sheikh', 'Matrouh', 
    'Luxor', 'Qena', 'North Sinai', 'Sohag'
  ];

  const handleLocationToggle = (gov: string) => {
    setFormData(prev => {
      if (prev.targetLocations.includes(gov)) {
        return { ...prev, targetLocations: prev.targetLocations.filter(l => l !== gov) };
      } else {
        return { ...prev, targetLocations: [...prev.targetLocations, gov] };
      }
    });
  };

  const calculateBudget = () => {
    const total = formData.reward * formData.completionsNeeded;
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Structure exactly as POST /api/tasks expects for Video tasks
      const payload = {
        type: 'video',
        titleEn: formData.titleEn,
        titleAr: formData.titleAr,
        descriptionEn: formData.descriptionEn,
        descriptionAr: formData.descriptionAr,
        reward: Number(formData.reward),
        completionsNeeded: Number(formData.completionsNeeded),
        difficulty: formData.difficulty,
        duration: Number(formData.duration),
        
        // Settings specific to video matching the legacy API
        taskData: { videoUrl: formData.videoUrl },
        minWatchPercentage: 80, 

        // Targeting
        targetAgeMin: Number(formData.targetAgeMin),
        targetAgeMax: Number(formData.targetAgeMax),
        targetGender: formData.targetGender,
        targetLocations: formData.targetLocations.length > 0 ? JSON.stringify(formData.targetLocations) : null,
        requiresMinimumTier: formData.requiresMinimumTier === 'bronze' ? null : formData.requiresMinimumTier,
        
        // Ensure no quiz questions are required or sent since this is purely a video impression task
        questions: []
      };

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        toast.success(isRTL ? 'تم إنشاء حملة الفيديو بنجاح!' : 'Video Campaign created successfully!');
        
        // Auto-publish it immediately to match the expected workflow without needing an admin
        await fetch(`/api/tasks/${data.taskId}/publish`, { method: 'POST' }).catch(() => {});
        
        setLocation('/advertiser/new-dashboard');
      } else {
        toast.error(data.error || 'Failed to create campaign');
      }
    } catch (err) {
      console.error(err);
      toast.error(isRTL ? 'حدث خطأ غير متوقع' : 'Unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => setLocation('/advertiser/new-dashboard')}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1 rtl:rotate-180 rtl:ml-1 rtl:mr-0" />
            {isRTL ? 'العودة للوحة القيادة' : 'Back to Dashboard'}
          </button>
          <h1 className="text-2xl font-bold flex items-center text-gray-900">
            <Play className="w-6 h-6 mr-2 text-blue-600 rtl:ml-2 rtl:mr-0" /> 
            {isRTL ? 'إنشاء حملة مشاهدة فيديو' : 'Create Video Watch Campaign'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isRTL 
              ? 'قم بإعداد حملة تسويقية لمقاطع الفيديو الخاصة بك لزيادة المشاهدات والتفاعل'
              : 'Setup a marketing campaign for your videos to increase views and engagement'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Content Basics */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <Languages className="w-5 h-5 text-gray-500" />
                  {isRTL ? 'تفاصيل المحتوى الأساسية' : 'Basic Content Details'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'أدخل عنوان ووصف الفيديو باللغتين العربية والإنجليزية' : 'Enter the video title and description in both languages'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Video URL */}
                <div className="space-y-2">
                  <Label htmlFor="videoUrl" className="font-semibold text-gray-800">
                    {isRTL ? 'رابط الفيديو (YouTube)' : 'Video URL (YouTube)'} <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="videoUrl" 
                    type="url" 
                    required 
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.videoUrl} 
                    onChange={e => setFormData(f => ({...f, videoUrl: e.target.value}))} 
                    className="bg-gray-50 border-gray-200 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  <div className="space-y-4">
                    <Label className="font-semibold text-gray-800">{isRTL ? 'المحتوى الإنجليزي' : 'English Content'}</Label>
                    <div className="space-y-2">
                      <Input 
                        placeholder="Video Title (English)"
                        required value={formData.titleEn} 
                        onChange={e => setFormData(f => ({...f, titleEn: e.target.value}))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Textarea 
                        placeholder="Video Description (English)"
                        required value={formData.descriptionEn} 
                        onChange={e => setFormData(f => ({...f, descriptionEn: e.target.value}))} 
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="font-semibold text-gray-800">{isRTL ? 'المحتوى العربي' : 'Arabic Content'}</Label>
                    <div className="space-y-2">
                      <Input 
                        placeholder="عنوان الفيديو (عربي)" dir="rtl"
                        required value={formData.titleAr} 
                        onChange={e => setFormData(f => ({...f, titleAr: e.target.value}))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Textarea 
                        placeholder="وصف الفيديو (عربي)" dir="rtl"
                        required value={formData.descriptionAr} 
                        onChange={e => setFormData(f => ({...f, descriptionAr: e.target.value}))} 
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Audience Targeting */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <Target className="w-5 h-5 text-gray-500" />
                  {isRTL ? 'استهداف الجمهور' : 'Audience Targeting'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'حدد الفئة المستهدفة لمشاهدة الفيديو الخاص بك لضمان أقصى استفادة' : 'Define who should watch your video to ensure maximum impact'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                
                {/* Demographics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="text-gray-700">{isRTL ? 'الجنس' : 'Gender'}</Label>
                    <Select value={formData.targetGender} onValueChange={v => setFormData(f => ({...f, targetGender: v}))}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{isRTL ? 'الكل (ذكور وإناث)' : 'All (Male & Female)'}</SelectItem>
                        <SelectItem value="male">{isRTL ? 'ذكور فقط' : 'Male Only'}</SelectItem>
                        <SelectItem value="female">{isRTL ? 'إناث فقط' : 'Female Only'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-700">{isRTL ? 'الحد الأدنى للعمر' : 'Min Age'}</Label>
                    <Input 
                      type="number" min="13" max="100" 
                      value={formData.targetAgeMin} 
                      onChange={e => setFormData(f => ({...f, targetAgeMin: Number(e.target.value)}))} 
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-700">{isRTL ? 'الحد الأقصى للعمر' : 'Max Age'}</Label>
                    <Input 
                      type="number" min="13" max="100" 
                      value={formData.targetAgeMax} 
                      onChange={e => setFormData(f => ({...f, targetAgeMax: Number(e.target.value)}))} 
                    />
                  </div>
                </div>

                <div className="space-y-3 border-t border-gray-100 pt-6">
                  <Label className="text-gray-700">{isRTL ? 'مستوى الحساب المطلوب' : 'Required User Tier'}</Label>
                  <Select value={formData.requiresMinimumTier} onValueChange={v => setFormData(f => ({...f, requiresMinimumTier: v}))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">{isRTL ? 'أساسي (الجميع)' : 'Bronze (All Users)'}</SelectItem>
                      <SelectItem value="silver">{isRTL ? 'فضي وما فوق' : 'Silver and above'}</SelectItem>
                      <SelectItem value="gold">{isRTL ? 'ذهبي وما فوق' : 'Gold and above'}</SelectItem>
                      <SelectItem value="platinum">{isRTL ? 'بلاتينيوم فقط' : 'Platinum Only'}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {isRTL ? 'المستويات الأعلى تتطلب مستخدمين ذوي جودة أعلى وموثوقية أكثر في أداء المهام' : 'Higher tiers guarantee users with proven track records of quality completions'}
                  </p>
                </div>

                {/* Geography targeting */}
                <div className="space-y-3 border-t border-gray-100 pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-gray-700">{isRTL ? 'المحافظات (مصر)' : 'Geographic Regions (Egypt)'}</Label>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {formData.targetLocations.length} {isRTL ? 'محددة' : 'Selected'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    {governorates.map(gov => (
                      <div key={gov} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox 
                          id={`loc-${gov}`} 
                          checked={formData.targetLocations.includes(gov)}
                          onCheckedChange={() => handleLocationToggle(gov)}
                        />
                        <Label htmlFor={`loc-${gov}`} className="text-sm cursor-pointer whitespace-nowrap">{gov}</Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {isRTL ? 'اتركها فارغة لاستهداف جميع المحافظات' : 'Leave empty to target all governorates globally'}
                  </p>
                </div>

              </CardContent>
            </Card>

          </div>

          {/* Sidebar Settings (Budget) */}
          <div className="space-y-6">
            <Card className="border-gray-200 shadow-sm sticky top-24">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                <CardTitle className="text-lg text-gray-800">{isRTL ? 'الميزانية والأهداف' : 'Budget & Goals'}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'عدد المشاهدات المستهدفة' : 'Target Views (Completions)'}</Label>
                  <Input 
                    type="number" required min="10" 
                    value={formData.completionsNeeded} 
                    onChange={e => setFormData(f => ({...f, completionsNeeded: Number(e.target.value)}))} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'المكافأة لكل مشاهدة (قروش)' : 'Reward per view (Piasters)'}</Label>
                  <Input 
                    type="number" required min="1" 
                    value={formData.reward} 
                    onChange={e => setFormData(f => ({...f, reward: Number(e.target.value)}))} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'مدة الفيديو التقريبية (بالدقائق)' : 'Est. Video Duration (mins)'}</Label>
                  <Input 
                    type="number" required min="1" max="60"
                    value={formData.duration} 
                    onChange={e => setFormData(f => ({...f, duration: Number(e.target.value)}))} 
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-3 mt-4">
                  <h4 className="font-semibold text-blue-900 text-sm">{isRTL ? 'ملخص ميزانية الحملة' : 'Campaign Budget Summary'}</h4>
                  <div className="flex justify-between items-center border-b border-blue-200/50 pb-2">
                    <span className="text-sm text-blue-700">{isRTL ? 'إجمالي الميزانية:' : 'Total Budget:'}</span>
                    <span className="font-bold text-blue-900">
                      {(calculateBudget() / 100).toFixed(2)} {isRTL ? 'ج.م' : 'EGP'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-blue-600">{isRTL ? 'يُخصم من رصيدك' : 'Deducted from balance'}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting || calculateBudget() === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 py-6"
                >
                  {isSubmitting ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
                      {isRTL ? 'حفظ وإطلاق الحملة' : 'Save & Launch Campaign'}
                    </>
                  )}
                </Button>

                <div className="flex items-start gap-2 mt-4">
                  <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500">
                    {isRTL 
                      ? 'بمجرد الإطلاق، سيتم خصم الميزانية المحجوزة من رصيدك وستكون الحملة مرئية فوراً للمستخدمين المتوافقين مع شروطك.'
                      : 'Once launched, the reserved budget will be deducted and the campaign becomes live immediately for matching users.'}
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

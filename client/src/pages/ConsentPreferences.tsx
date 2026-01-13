import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, Bell, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from 'react-i18next';

export default function ConsentPreferences() {
  const { t, i18n } = useTranslation();
  const { user } = useApp();
  const isRTL = i18n.language === 'ar';
  
  const [consent, setConsent] = useState({
    layer2Behavioral: false,
    layer3Marketing: false,
    marketingFrequency: 'off' as 'off' | 'low' | 'medium' | 'high',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current consent preferences
  const { data: consentData, refetch } = trpc.consent.getPreferences.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // Update mutation
  const updateConsent = trpc.consent.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success(isRTL ? 'تم تحديث تفضيلات الموافقة' : 'Consent preferences updated');
      setHasChanges(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (consentData) {
      setConsent({
        layer2Behavioral: consentData.layer2Behavioral,
        layer3Marketing: consentData.layer3Marketing,
        marketingFrequency: consentData.marketingFrequency || 'off',
      });
      setIsLoading(false);
    }
  }, [consentData]);

  const handleToggle = (key: 'layer2Behavioral' | 'layer3Marketing') => {
    setConsent(prev => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleFrequencyChange = (value: string) => {
    setConsent(prev => ({ 
      ...prev, 
      marketingFrequency: value as 'off' | 'low' | 'medium' | 'high' 
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!user?.id) return;
    updateConsent.mutate({
      userId: user.id,
      layer2Behavioral: consent.layer2Behavioral,
      layer3Marketing: consent.layer3Marketing,
      marketingFrequency: consent.marketingFrequency,
    });
  };

  const frequencyOptions = [
    { value: 'off', label: isRTL ? 'إيقاف' : 'Off', description: isRTL ? 'لا إشعارات تسويقية' : 'No marketing notifications' },
    { value: 'low', label: isRTL ? 'منخفض' : 'Low', description: isRTL ? 'مرة واحدة أسبوعياً' : 'Once a week' },
    { value: 'medium', label: isRTL ? 'متوسط' : 'Medium', description: isRTL ? '2-3 مرات أسبوعياً' : '2-3 times a week' },
    { value: 'high', label: isRTL ? 'مرتفع' : 'High', description: isRTL ? 'يومياً' : 'Daily' },
  ];

  return (
    <MobileLayout title={isRTL ? 'تفضيلات الموافقة' : 'Consent Preferences'} showBack>
      <div className="p-4 space-y-6 pb-24">
        {/* Layer 1 - Security (Always ON) */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">
                  {isRTL ? 'بيانات الأمان الأساسية' : 'Essential Security Data'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isRTL ? 'مطلوبة لتشغيل الخدمة' : 'Required for service operation'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? 'معلومات الجهاز، عنوان IP، وبيانات التحقق من الاحتيال'
                    : 'Device info, IP address, and fraud prevention data'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  {isRTL ? 'مُفعّل دائماً' : 'Always ON'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layer 2 - Behavioral Profiling (Optional) */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">
                  {isRTL ? 'التحليل السلوكي' : 'Behavioral Profiling'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isRTL ? 'اختياري - لتخصيص المهام' : 'Optional - for task personalization'}
                </CardDescription>
              </div>
              <Switch
                checked={consent.layer2Behavioral}
                onCheckedChange={() => handleToggle('layer2Behavioral')}
                disabled={isLoading}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {isRTL 
                ? 'يسمح لنا بتحليل اهتماماتك وتفضيلاتك لعرض مهام أكثر ملاءمة لك'
                : 'Allows us to analyze your interests and preferences to show more relevant tasks'}
            </p>
            
            {consent.layer2Behavioral && (
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  {isRTL 
                    ? 'بتفعيل هذا الخيار، ستتمكن من الوصول إلى مهام ذات أجور أعلى تتناسب مع اهتماماتك'
                    : 'By enabling this, you can access higher-paying tasks that match your interests'}
                </AlertDescription>
              </Alert>
            )}
            
            {!consent.layer2Behavioral && consentData?.layer2Behavioral && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm text-amber-800">
                  {isRTL 
                    ? 'إيقاف هذا الخيار سيحذف بيانات ملفك الشخصي السلوكي'
                    : 'Disabling this will delete your behavioral profile data'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Layer 3 - Marketing (Optional) */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">
                  {isRTL ? 'إشعارات التسويق' : 'Marketing Notifications'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isRTL ? 'اختياري - عروض ومهام خاصة' : 'Optional - special offers and tasks'}
                </CardDescription>
              </div>
              <Switch
                checked={consent.layer3Marketing}
                onCheckedChange={() => handleToggle('layer3Marketing')}
                disabled={isLoading}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isRTL 
                ? 'تلقي إشعارات حول العروض الخاصة والمهام الجديدة والمكافآت'
                : 'Receive notifications about special offers, new tasks, and rewards'}
            </p>
            
            {consent.layer3Marketing && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {isRTL ? 'معدل الإشعارات' : 'Notification Frequency'}
                </Label>
                <RadioGroup
                  value={consent.marketingFrequency}
                  onValueChange={handleFrequencyChange}
                  className="space-y-2"
                >
                  {frequencyOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 space-x-reverse">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground block">
                          {option.description}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Rights Info */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  {isRTL 
                    ? 'يمكنك تغيير هذه الإعدادات في أي وقت. لديك الحق في:'
                    : 'You can change these settings at any time. You have the right to:'}
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>{isRTL ? 'الوصول إلى بياناتك' : 'Access your data'}</li>
                  <li>{isRTL ? 'تصدير بياناتك' : 'Export your data'}</li>
                  <li>{isRTL ? 'حذف بياناتك' : 'Delete your data'}</li>
                </ul>
                <Button variant="link" className="p-0 h-auto text-primary text-xs">
                  {isRTL ? 'زيارة مركز الخصوصية' : 'Visit Privacy Center'} →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        {hasChanges && (
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t">
            <Button 
              onClick={handleSave} 
              className="w-full"
              disabled={updateConsent.isPending}
            >
              {updateConsent.isPending 
                ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
                : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, Download, Trash2, Eye, FileText, Clock, 
  AlertTriangle, CheckCircle2, Mail, ExternalLink, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from 'react-i18next';

export default function PrivacyCenter() {
  const { t, i18n } = useTranslation();
  const { user } = useApp();
  const isRTL = i18n.language === 'ar';
  
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [selectedDeletionType, setSelectedDeletionType] = useState<'behavioral_only' | 'income_only' | 'full_account'>('behavioral_only');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch user data
  const { data: userData, isLoading } = trpc.privacy.getMyData.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // Export mutation
  const exportData = trpc.privacy.requestExport.useMutation({
    onSuccess: (data) => {
      toast.success(isRTL ? 'تم إنشاء رابط التحميل' : 'Download link created');
      // In production, would open the download URL
      window.open(data.downloadUrl, '_blank');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Deletion mutation
  const requestDeletion = trpc.privacy.requestDeletion.useMutation({
    onSuccess: (data) => {
      toast.success(
        isRTL 
          ? `تم إنشاء طلب الحذف. رقم التذكرة: ${data.ticketId}` 
          : `Deletion request created. Ticket: ${data.ticketId}`
      );
      setShowDeleteDialog(false);
      setDeleteConfirmation('');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleExport = (format: 'json' | 'csv') => {
    if (!user?.id) return;
    exportData.mutate({ userId: user.id, format });
  };

  const handleDelete = () => {
    if (!user?.id || deleteConfirmation !== 'DELETE') return;
    requestDeletion.mutate({
      userId: user.id,
      dataType: selectedDeletionType,
      confirmationText: deleteConfirmation,
    });
  };

  const deletionOptions = [
    {
      value: 'behavioral_only' as const,
      title: isRTL ? 'البيانات السلوكية فقط' : 'Behavioral Data Only',
      description: isRTL 
        ? 'حذف إجابات الملف الشخصي (المستوى 1-3) وبيانات الدخل. يبقى الحساب نشطاً.'
        : 'Delete profile answers (Tier 1-3) and income data. Account remains active.',
      impact: isRTL ? 'ستعود إلى المستوى البرونزي' : 'You will return to Bronze tier',
    },
    {
      value: 'income_only' as const,
      title: isRTL ? 'بيانات الدخل فقط' : 'Income Data Only',
      description: isRTL 
        ? 'حذف معلومات الدخل الشهري فقط'
        : 'Delete monthly income information only',
      impact: isRTL ? 'لن يؤثر على مستواك' : 'Will not affect your tier',
    },
    {
      value: 'full_account' as const,
      title: isRTL ? 'الحساب الكامل' : 'Full Account',
      description: isRTL 
        ? 'حذف جميع البيانات وإغلاق الحساب. بيانات KYC تُحفظ لمدة 5-7 سنوات قانونياً.'
        : 'Delete all data and close account. KYC data retained 5-7 years per legal requirement.',
      impact: isRTL ? 'سيتم إغلاق حسابك نهائياً' : 'Your account will be permanently closed',
    },
  ];

  return (
    <MobileLayout title={isRTL ? 'مركز الخصوصية' : 'Privacy Center'} showBack>
      <div className="p-4 space-y-6 pb-24">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">
            {isRTL ? 'حقوق البيانات الخاصة بك' : 'Your Data Rights'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isRTL 
              ? 'وفقاً للائحة حماية البيانات العامة (GDPR) وقانون حماية البيانات الشخصية'
              : 'In accordance with GDPR and Personal Data Protection Law'}
          </p>
        </div>

        <Tabs defaultValue="view" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="view">
              <Eye className="w-4 h-4 mr-1" />
              {isRTL ? 'عرض' : 'View'}
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="w-4 h-4 mr-1" />
              {isRTL ? 'تصدير' : 'Export'}
            </TabsTrigger>
            <TabsTrigger value="delete">
              <Trash2 className="w-4 h-4 mr-1" />
              {isRTL ? 'حذف' : 'Delete'}
            </TabsTrigger>
          </TabsList>

          {/* View Tab - GDPR Article 15 */}
          <TabsContent value="view" className="space-y-4 mt-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{isRTL ? 'حق الوصول (المادة 15)' : 'Right of Access (Article 15)'}</AlertTitle>
              <AlertDescription>
                {isRTL 
                  ? 'لديك الحق في معرفة البيانات التي نحتفظ بها عنك'
                  : 'You have the right to know what data we hold about you'}
              </AlertDescription>
            </Alert>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : userData && (
              <div className="space-y-4">
                {/* Personal Info */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {isRTL ? 'المعلومات الشخصية' : 'Personal Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isRTL ? 'الاسم' : 'Name'}</span>
                      <span>{userData.personalInfo?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isRTL ? 'البريد' : 'Email'}</span>
                      <span>{userData.personalInfo?.email || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isRTL ? 'الهاتف' : 'Phone'}</span>
                      <span>{userData.personalInfo?.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isRTL ? 'المستوى' : 'Tier'}</span>
                      <Badge variant="secondary">{userData.personalInfo?.profileTier}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Data */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {isRTL ? 'بيانات الملف الشخصي' : 'Profile Data'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span>{isRTL ? 'المستوى 1' : 'Tier 1'}</span>
                      <Badge variant={userData.profileData?.tier1Responses?.length > 0 ? 'default' : 'secondary'}>
                        {userData.profileData?.tier1Responses?.length || 0} {isRTL ? 'إجابة' : 'answers'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{isRTL ? 'المستوى 2' : 'Tier 2'}</span>
                      <Badge variant={userData.profileData?.tier2Responses?.length > 0 ? 'default' : 'secondary'}>
                        {userData.profileData?.tier2Responses?.length || 0} {isRTL ? 'إجابة' : 'answers'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{isRTL ? 'المستوى 3' : 'Tier 3'}</span>
                      <Badge variant={userData.profileData?.tier3Responses?.length > 0 ? 'default' : 'secondary'}>
                        {userData.profileData?.tier3Responses?.length || 0} {isRTL ? 'إجابة' : 'answers'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* KYC Status */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {isRTL ? 'حالة التحقق' : 'Verification Status'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="flex justify-between items-center">
                      <span>{isRTL ? 'حالة KYC' : 'KYC Status'}</span>
                      <Badge variant={userData.kycData?.status === 'approved' ? 'default' : 'secondary'}>
                        {userData.kycData?.status || (isRTL ? 'غير مكتمل' : 'Not completed')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Export Tab - GDPR Article 20 */}
          <TabsContent value="export" className="space-y-4 mt-4">
            <Alert>
              <Download className="h-4 w-4" />
              <AlertTitle>{isRTL ? 'حق نقل البيانات (المادة 20)' : 'Right to Data Portability (Article 20)'}</AlertTitle>
              <AlertDescription>
                {isRTL 
                  ? 'يمكنك تحميل نسخة من جميع بياناتك بتنسيق قابل للقراءة'
                  : 'You can download a copy of all your data in a machine-readable format'}
              </AlertDescription>
            </Alert>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="text-center space-y-2">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? 'اختر تنسيق التصدير المفضل لديك'
                      : 'Choose your preferred export format'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleExport('json')}
                    disabled={exportData.isPending}
                    className="h-auto py-4 flex-col"
                  >
                    <FileText className="w-6 h-6 mb-2" />
                    <span>JSON</span>
                    <span className="text-xs text-muted-foreground">{isRTL ? 'للمطورين' : 'For developers'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExport('csv')}
                    disabled={exportData.isPending}
                    className="h-auto py-4 flex-col"
                  >
                    <FileText className="w-6 h-6 mb-2" />
                    <span>CSV</span>
                    <span className="text-xs text-muted-foreground">{isRTL ? 'لـ Excel' : 'For Excel'}</span>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  {isRTL 
                    ? 'رابط التحميل صالح لمدة ساعة واحدة فقط'
                    : 'Download link valid for 1 hour only'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delete Tab - GDPR Article 17 */}
          <TabsContent value="delete" className="space-y-4 mt-4">
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">
                {isRTL ? 'حق المحو (المادة 17)' : 'Right to Erasure (Article 17)'}
              </AlertTitle>
              <AlertDescription className="text-red-700">
                {isRTL 
                  ? 'يمكنك طلب حذف بياناتك. بعض البيانات قد تُحفظ لأسباب قانونية.'
                  : 'You can request deletion of your data. Some data may be retained for legal reasons.'}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {deletionOptions.map((option) => (
                <Card 
                  key={option.value}
                  className={`cursor-pointer transition-colors ${
                    selectedDeletionType === option.value 
                      ? 'border-red-300 bg-red-50/50' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedDeletionType(option.value)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedDeletionType === option.value 
                          ? 'border-red-500 bg-red-500' 
                          : 'border-muted-foreground'
                      }`}>
                        {selectedDeletionType === option.value && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{option.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                        <p className="text-xs text-amber-600 mt-2">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          {option.impact}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isRTL ? 'طلب حذف البيانات' : 'Request Data Deletion'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-red-600">
                    {isRTL ? 'تأكيد حذف البيانات' : 'Confirm Data Deletion'}
                  </DialogTitle>
                  <DialogDescription>
                    {isRTL 
                      ? 'هذا الإجراء لا يمكن التراجع عنه. اكتب DELETE للتأكيد.'
                      : 'This action cannot be undone. Type DELETE to confirm.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Label htmlFor="confirmation">
                    {isRTL ? 'اكتب DELETE للتأكيد' : 'Type DELETE to confirm'}
                  </Label>
                  <Input
                    id="confirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={deleteConfirmation !== 'DELETE' || requestDeletion.isPending}
                  >
                    {requestDeletion.isPending 
                      ? (isRTL ? 'جاري الحذف...' : 'Deleting...') 
                      : (isRTL ? 'تأكيد الحذف' : 'Confirm Delete')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>

        {/* Contact DPO */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {isRTL ? 'مسؤول حماية البيانات' : 'Data Protection Officer'}
                </p>
                <p className="text-xs text-muted-foreground">dpo@taskkash.com</p>
              </div>
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}

import React, { useState, useRef } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, Camera, Upload, CheckCircle2, Clock, AlertTriangle,
  Zap, FileText, User, Eye, Trash2, Info, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

type VerificationStep = 'method' | 'id-upload' | 'selfie' | 'processing' | 'complete';

export default function KYCVerification() {
  const { t, i18n } = useTranslation();
  const { user } = useApp();
  const [, setLocation] = useLocation();
  const isRTL = i18n.language === 'ar';
  
  const [step, setStep] = useState<VerificationStep>('method');
  const [method, setMethod] = useState<'biometric_fast' | 'id_only_standard' | null>(null);
  const [biometricConsent, setBiometricConsent] = useState(false);
  const [verificationId, setVerificationId] = useState<number | null>(null);
  const [idFrontImage, setIdFrontImage] = useState<string | null>(null);
  const [idBackImage, setIdBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  // Fetch KYC status
  const { data: kycStatus, refetch } = trpc.kyc.getStatus.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // Start verification mutation
  const startVerification = trpc.kyc.startVerification.useMutation({
    onSuccess: (data) => {
      setVerificationId(data.verificationId);
      setStep('id-upload');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Upload ID mutation
  const uploadId = trpc.kyc.uploadId.useMutation({
    onSuccess: (data) => {
      if (data.nextStep === '/upload-selfie') {
        setStep('selfie');
      } else {
        setStep('processing');
        // Simulate processing
        setTimeout(() => {
          setStep('complete');
          refetch();
        }, 3000);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Upload selfie mutation
  const uploadSelfie = trpc.kyc.uploadSelfie.useMutation({
    onSuccess: () => {
      setStep('processing');
      setTimeout(() => {
        setStep('complete');
        refetch();
      }, 3000);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleMethodSelect = (selectedMethod: 'biometric_fast' | 'id_only_standard') => {
    setMethod(selectedMethod);
  };

  const handleStartVerification = () => {
    if (!user?.id || !method) return;
    if (method === 'biometric_fast' && !biometricConsent) {
      toast.error(isRTL ? 'يجب الموافقة على معالجة البيانات البيومترية' : 'Biometric consent is required');
      return;
    }
    startVerification.mutate({
      userId: user.id,
      method,
      biometricConsent: method === 'biometric_fast' ? biometricConsent : undefined,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back' | 'selfie') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'front') setIdFrontImage(base64);
      else if (type === 'back') setIdBackImage(base64);
      else setSelfieImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleIdSubmit = () => {
    if (!user?.id || !verificationId || !idFrontImage) return;
    uploadId.mutate({
      userId: user.id,
      verificationId,
      idFrontImage,
      idBackImage: idBackImage || undefined,
    });
  };

  const handleSelfieSubmit = () => {
    if (!user?.id || !verificationId || !selfieImage) return;
    uploadSelfie.mutate({
      userId: user.id,
      verificationId,
      selfieImage,
      livenessData: { blink: true, turnHead: true }, // Simulated
    });
  };

  // If already verified
  if (kycStatus?.status === 'approved') {
    return (
      <MobileLayout title={isRTL ? 'التحقق من الهوية' : 'Identity Verification'} showBack>
        <div className="p-4 space-y-6">
          <div className="text-center space-y-4 py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-600">
              {isRTL ? 'تم التحقق بنجاح!' : 'Verified Successfully!'}
            </h2>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'حسابك موثق بالكامل. يمكنك الآن سحب أرباحك.'
                : 'Your account is fully verified. You can now withdraw your earnings.'}
            </p>
            <Badge className="bg-green-100 text-green-800">
              {isRTL ? 'المستوى: النخبة' : 'Tier: Elite'}
            </Badge>
          </div>

          {kycStatus.biometricDeleted && (
            <Alert className="bg-blue-50 border-blue-200">
              <Trash2 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {isRTL 
                  ? 'تم حذف صورة السيلفي تلقائياً خلال 24 ساعة وفقاً لسياسة الخصوصية'
                  : 'Selfie image was automatically deleted within 24 hours per privacy policy'}
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={() => setLocation('/profile')} className="w-full">
            {isRTL ? 'العودة للملف الشخصي' : 'Back to Profile'}
          </Button>
        </div>
      </MobileLayout>
    );
  }

  // Progress indicator
  const getProgress = () => {
    switch (step) {
      case 'method': return 25;
      case 'id-upload': return 50;
      case 'selfie': return 75;
      case 'processing': return 90;
      case 'complete': return 100;
      default: return 0;
    }
  };

  return (
    <MobileLayout title={isRTL ? 'التحقق من الهوية' : 'Identity Verification'} showBack>
      <div className="p-4 space-y-6 pb-24">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {isRTL ? 'تقدم التحقق' : 'Verification Progress'}
            </span>
            <span className="font-medium">{getProgress()}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {/* Step: Method Selection */}
        {step === 'method' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Shield className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-lg font-bold">
                {isRTL ? 'اختر طريقة التحقق' : 'Choose Verification Method'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isRTL 
                  ? 'التحقق مطلوب لسحب الأرباح والوصول للمستوى النخبة'
                  : 'Verification is required to withdraw earnings and reach Elite tier'}
              </p>
            </div>

            {/* Fast Biometric Option */}
            <Card 
              className={`cursor-pointer transition-all ${
                method === 'biometric_fast' 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleMethodSelect('biometric_fast')}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {isRTL ? 'التحقق السريع' : 'Fast Verification'}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {isRTL ? '~2 دقيقة' : '~2 min'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isRTL 
                        ? 'صورة الهوية + سيلفي مباشر للتحقق الفوري'
                        : 'ID photo + live selfie for instant verification'}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-amber-600">
                      <Camera className="w-3 h-3" />
                      {isRTL ? 'يتطلب كاميرا' : 'Requires camera'}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Standard ID Only Option */}
            <Card 
              className={`cursor-pointer transition-all ${
                method === 'id_only_standard' 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleMethodSelect('id_only_standard')}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {isRTL ? 'التحقق القياسي' : 'Standard Verification'}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {isRTL ? '24-48 ساعة' : '24-48 hours'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isRTL 
                        ? 'صورة الهوية فقط - مراجعة يدوية'
                        : 'ID photo only - manual review'}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
                      <Upload className="w-3 h-3" />
                      {isRTL ? 'رفع صورة' : 'Upload image'}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Biometric Consent (only for fast method) */}
            {method === 'biometric_fast' && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">
                  {isRTL ? 'موافقة البيانات البيومترية' : 'Biometric Data Consent'}
                </AlertTitle>
                <AlertDescription className="text-amber-700 space-y-3">
                  <p>
                    {isRTL 
                      ? 'سيتم استخدام صورة السيلفي للتحقق من هويتك فقط.'
                      : 'Your selfie will be used only to verify your identity.'}
                  </p>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="biometric-consent"
                      checked={biometricConsent}
                      onCheckedChange={(checked) => setBiometricConsent(checked as boolean)}
                    />
                    <Label htmlFor="biometric-consent" className="text-sm cursor-pointer">
                      {isRTL 
                        ? 'أوافق على معالجة بياناتي البيومترية. أفهم أن صورة السيلفي ستُحذف تلقائياً خلال 24 ساعة.'
                        : 'I consent to biometric processing. I understand my selfie will be automatically deleted within 24 hours.'}
                    </Label>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleStartVerification}
              disabled={!method || (method === 'biometric_fast' && !biometricConsent) || startVerification.isPending}
              className="w-full"
            >
              {startVerification.isPending 
                ? (isRTL ? 'جاري البدء...' : 'Starting...') 
                : (isRTL ? 'بدء التحقق' : 'Start Verification')}
            </Button>
          </div>
        )}

        {/* Step: ID Upload */}
        {step === 'id-upload' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <FileText className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-lg font-bold">
                {isRTL ? 'رفع صورة الهوية' : 'Upload ID Photo'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isRTL 
                  ? 'التقط صورة واضحة للوجه الأمامي لبطاقتك الوطنية'
                  : 'Take a clear photo of the front of your national ID'}
              </p>
            </div>

            {/* Front ID */}
            <Card>
              <CardContent className="pt-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'front')}
                />
                {idFrontImage ? (
                  <div className="space-y-3">
                    <img 
                      src={idFrontImage} 
                      alt="ID Front" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isRTL ? 'إعادة التقاط' : 'Retake'}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full h-48 flex-col gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-8 h-8" />
                    <span>{isRTL ? 'الوجه الأمامي للهوية' : 'ID Front Side'}</span>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Back ID (Optional) */}
            <Card>
              <CardContent className="pt-4">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  id="id-back-input"
                  onChange={(e) => handleFileUpload(e, 'back')}
                />
                {idBackImage ? (
                  <div className="space-y-3">
                    <img 
                      src={idBackImage} 
                      alt="ID Back" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => document.getElementById('id-back-input')?.click()}
                    >
                      {isRTL ? 'إعادة التقاط' : 'Retake'}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full h-32 flex-col gap-2"
                    onClick={() => document.getElementById('id-back-input')?.click()}
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-sm">{isRTL ? 'الوجه الخلفي (اختياري)' : 'ID Back Side (Optional)'}</span>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Button 
              onClick={handleIdSubmit}
              disabled={!idFrontImage || uploadId.isPending}
              className="w-full"
            >
              {uploadId.isPending 
                ? (isRTL ? 'جاري الرفع...' : 'Uploading...') 
                : (isRTL ? 'متابعة' : 'Continue')}
            </Button>
          </div>
        )}

        {/* Step: Selfie */}
        {step === 'selfie' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <User className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-lg font-bold">
                {isRTL ? 'التقاط سيلفي' : 'Take a Selfie'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isRTL 
                  ? 'التقط صورة واضحة لوجهك للتحقق من هويتك'
                  : 'Take a clear photo of your face to verify your identity'}
              </p>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {isRTL 
                  ? 'سيتم حذف صورة السيلفي تلقائياً خلال 24 ساعة'
                  : 'Selfie will be automatically deleted within 24 hours'}
              </AlertDescription>
            </Alert>

            <Card>
              <CardContent className="pt-4">
                <input
                  type="file"
                  ref={selfieInputRef}
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'selfie')}
                />
                {selfieImage ? (
                  <div className="space-y-3">
                    <img 
                      src={selfieImage} 
                      alt="Selfie" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => selfieInputRef.current?.click()}
                    >
                      {isRTL ? 'إعادة التقاط' : 'Retake'}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full h-64 flex-col gap-2"
                    onClick={() => selfieInputRef.current?.click()}
                  >
                    <Camera className="w-12 h-12" />
                    <span>{isRTL ? 'التقاط سيلفي' : 'Take Selfie'}</span>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Button 
              onClick={handleSelfieSubmit}
              disabled={!selfieImage || uploadSelfie.isPending}
              className="w-full"
            >
              {uploadSelfie.isPending 
                ? (isRTL ? 'جاري التحقق...' : 'Verifying...') 
                : (isRTL ? 'إرسال للتحقق' : 'Submit for Verification')}
            </Button>
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div className="text-center space-y-6 py-12">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isRTL ? 'جاري التحقق...' : 'Verifying...'}
            </h2>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'يرجى الانتظار بينما نتحقق من هويتك'
                : 'Please wait while we verify your identity'}
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <div className="text-center space-y-6 py-12">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-600">
              {isRTL ? 'تم التحقق بنجاح!' : 'Verification Complete!'}
            </h2>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'تهانينا! حسابك الآن موثق بالكامل.'
                : 'Congratulations! Your account is now fully verified.'}
            </p>
            <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
              {isRTL ? 'المستوى: النخبة' : 'Tier: Elite'}
            </Badge>
            <Button onClick={() => setLocation('/profile')} className="w-full">
              {isRTL ? 'العودة للملف الشخصي' : 'Back to Profile'}
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

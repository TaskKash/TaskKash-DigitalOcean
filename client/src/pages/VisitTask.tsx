import { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLocation, useParams } from 'wouter';
import { CheckCircle2, MapPin, Navigation, Camera, Clock, Store } from 'lucide-react';
import { useNavigationWarning } from '@/hooks/useNavigationWarning';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useCurrency } from "@/contexts/CurrencyContext";

interface VisitLocation {
  id: number;
  nameEn: string;
  nameAr: string;
  address: string;
  addressAr: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

interface VisitTaskData {
  locations: VisitLocation[];
  requirePhoto: boolean;
  requireGeolocation: boolean;
  verificationQuestions: {
    id: number;
    questionEn: string;
    questionAr: string;
    options: string[];
    optionsAr: string[];
    correctAnswer: number;
  }[];
  visitDuration: number; // minimum time in minutes
}

export default function VisitTask() {
  const { currency, symbol, formatAmount } = useCurrency();
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const taskId = parseInt(params.id || '0');
  
  const [step, setStep] = useState<'locations' | 'checkin' | 'questions'>('locations');
  const [selectedLocation, setSelectedLocation] = useState<VisitLocation | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const isArabic = i18n.language === 'ar';

  // Fetch task details
  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch task');
      return res.json();
    }
  });

  // Submit task mutation
  const submitMutation = useMutation({
    mutationFn: async (data: { answers: string[], locationId: number, coordinates?: { lat: number; lng: number } }) => {
      const res = await fetch(`/api/tasks/${taskId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to submit task');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.passed) {
        toast.success(isArabic ? `تم إكمال المهمة! حصلت على ${task?.reward} {symbol}` : `Task completed! You earned ${task?.reward} {symbol}`);
        setLocation('/tasks');
      } else {
        toast.error(isArabic ? 'لم تجتاز المهمة. حاول مرة أخرى.' : 'Task not passed. Try again.');
      }
    },
    onError: () => {
      toast.error(isArabic ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.');
    }
  });

  // Navigation warning when task is in progress
  const isTaskInProgress = checkedIn && step !== 'questions';
  useNavigationWarning(isTaskInProgress, isArabic 
    ? 'لديك مهمة قيد التنفيذ. هل أنت متأكد أنك تريد المغادرة؟'
    : 'You have an active task in progress. Are you sure you want to leave?');

  const taskData: VisitTaskData = task?.taskData ? 
    (typeof task.taskData === 'string' ? JSON.parse(task.taskData) : task.taskData) : null;

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(isArabic ? 'المتصفح لا يدعم تحديد الموقع' : 'Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
      },
      (error) => {
        setLocationError(isArabic ? 'فشل في تحديد الموقع. يرجى تفعيل GPS' : 'Failed to get location. Please enable GPS');
      }
    );
  };

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const handleSelectLocation = (location: VisitLocation) => {
    setSelectedLocation(location);
    setStep('checkin');
    if (taskData?.requireGeolocation) {
      getUserLocation();
    }
  };

  const handleCheckIn = () => {
    if (taskData?.requireGeolocation && selectedLocation) {
      if (!userLocation) {
        toast.error(isArabic ? 'يرجى تفعيل GPS للتحقق من موقعك' : 'Please enable GPS to verify your location');
        getUserLocation();
        return;
      }

      const distance = calculateDistance(
        userLocation.lat, userLocation.lng,
        selectedLocation.latitude, selectedLocation.longitude
      );

      if (distance > selectedLocation.radius) {
        toast.error(isArabic 
          ? `أنت بعيد عن الموقع (${Math.round(distance)}م). يجب أن تكون ضمن ${selectedLocation.radius}م`
          : `You are too far (${Math.round(distance)}m). Must be within ${selectedLocation.radius}m`);
        return;
      }
    }

    setCheckedIn(true);
    setCheckInTime(new Date());
    toast.success(isArabic ? 'تم تسجيل الوصول!' : 'Checked in successfully!');
  };

  const handleContinue = () => {
    if (taskData?.requirePhoto && !photoUploaded) {
      toast.error(isArabic ? 'يرجى رفع صورة للتأكيد' : 'Please upload a photo for verification');
      return;
    }
    setStep('questions');
  };

  const handleSubmit = () => {
    const answerArray = Object.values(answers);
    if (answerArray.length < (taskData?.verificationQuestions?.length || 0)) {
      toast.error(isArabic ? 'الرجاء الإجابة على جميع الأسئلة' : 'Please answer all questions');
      return;
    }

    setIsSubmitting(true);
    submitMutation.mutate({ 
      answers: answerArray, 
      locationId: selectedLocation?.id || 0,
      coordinates: userLocation || undefined
    });
  };

  const handlePhotoUpload = () => {
    // Simulate photo upload
    setPhotoUploaded(true);
    toast.success(isArabic ? 'تم رفع الصورة' : 'Photo uploaded');
  };

  if (isLoading) {
    return (
      <MobileLayout title={isArabic ? 'زيارة موقع' : 'Visit Location'} showBack>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={isArabic ? task?.titleAr : task?.titleEn} showBack>
      <div className="p-4 space-y-4">
        {/* Locations Step */}
        {step === 'locations' && (
          <>
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {isArabic ? 'اختر موقعاً للزيارة:' : 'Select a location to visit:'}
              </h3>
              <div className="space-y-3">
                {taskData?.locations?.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleSelectLocation(location)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Store className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{isArabic ? location.nameAr : location.nameEn}</p>
                      <p className="text-sm text-muted-foreground">{isArabic ? location.addressAr : location.address}</p>
                    </div>
                    <Navigation className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Check-in Step */}
        {step === 'checkin' && selectedLocation && (
          <>
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{isArabic ? selectedLocation.nameAr : selectedLocation.nameEn}</p>
                  <p className="text-sm text-muted-foreground">{isArabic ? selectedLocation.addressAr : selectedLocation.address}</p>
                </div>
              </div>

              {!checkedIn ? (
                <Button onClick={handleCheckIn} className="w-full" size="lg">
                  <MapPin className="w-5 h-5 mr-2" />
                  {isArabic ? 'تسجيل الوصول' : 'Check In'}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{isArabic ? 'تم تسجيل الوصول' : 'Checked In'}</span>
                    {checkInTime && (
                      <span className="text-sm text-muted-foreground">
                        ({checkInTime.toLocaleTimeString()})
                      </span>
                    )}
                  </div>

                  {taskData?.requirePhoto && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{isArabic ? 'رفع صورة للتأكيد:' : 'Upload verification photo:'}</p>
                      <Button 
                        variant={photoUploaded ? "outline" : "default"} 
                        onClick={handlePhotoUpload}
                        className="w-full"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        {photoUploaded 
                          ? (isArabic ? 'تم رفع الصورة ✓' : 'Photo Uploaded ✓')
                          : (isArabic ? 'التقاط صورة' : 'Take Photo')}
                      </Button>
                    </div>
                  )}

                  <Button onClick={handleContinue} className="w-full" size="lg">
                    {isArabic ? 'متابعة' : 'Continue'}
                  </Button>
                </div>
              )}

              {locationError && (
                <p className="text-sm text-red-500 mt-2">{locationError}</p>
              )}
            </Card>
          </>
        )}

        {/* Questions Step */}
        {step === 'questions' && taskData?.verificationQuestions && (
          <Card className="p-4 space-y-6">
            <h4 className="font-semibold">{isArabic ? 'أسئلة التحقق:' : 'Verification Questions:'}</h4>
            
            {taskData.verificationQuestions.map((q, qIdx) => (
              <div key={q.id} className="space-y-3">
                <p className="font-medium">{qIdx + 1}. {isArabic ? q.questionAr : q.questionEn}</p>
                <RadioGroup
                  value={answers[qIdx] || ''}
                  onValueChange={(value) => setAnswers(prev => ({ ...prev, [qIdx]: value }))}
                >
                  {(isArabic ? q.optionsAr : q.options).map((option, oIdx) => (
                    <div key={oIdx} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value={oIdx.toString()} id={`q${qIdx}-o${oIdx}`} />
                      <Label htmlFor={`q${qIdx}-o${oIdx}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}

            <Button 
              onClick={handleSubmit} 
              className="w-full" 
              size="lg"
              disabled={isSubmitting || Object.keys(answers).length < taskData.verificationQuestions.length}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {isArabic ? 'إرسال' : 'Submit'}
                </>
              )}
            </Button>
          </Card>
        )}

        {/* Reward Info */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{isArabic ? 'المكافأة:' : 'Reward:'}</span>
            <span className="font-bold text-primary text-lg">{task?.reward} {isArabic ? symbol : currency}</span>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}

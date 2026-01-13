import { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLocation, useParams } from 'wouter';
import { CheckCircle2, Camera, Upload, Image, X, Info } from 'lucide-react';
import { useNavigationWarning } from '@/hooks/useNavigationWarning';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';

interface PhotoRequirement {
  id: number;
  descriptionEn: string;
  descriptionAr: string;
  exampleUrl?: string;
  required: boolean;
}

interface PhotoTaskData {
  requirements: PhotoRequirement[];
  maxPhotos: number;
  minPhotos: number;
  allowCaption: boolean;
  guidelinesEn: string[];
  guidelinesAr: string[];
}

interface UploadedPhoto {
  id: string;
  url: string;
  caption?: string;
}

export default function PhotoTask() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const taskId = parseInt(params.id || '0');
  
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    mutationFn: async (data: { photos: { url: string; caption?: string }[] }) => {
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
      if (data.passed || data.status === 'pending') {
        toast.success(isArabic 
          ? 'تم إرسال الصور للمراجعة. ستحصل على المكافأة بعد الموافقة.'
          : 'Photos submitted for review. You will receive the reward after approval.');
        setLocation('/tasks');
      } else {
        toast.error(isArabic ? 'لم يتم قبول الصور. حاول مرة أخرى.' : 'Photos not accepted. Try again.');
      }
    },
    onError: () => {
      toast.error(isArabic ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.');
    }
  });

  // Navigation warning when task is in progress
  const isTaskInProgress = uploadedPhotos.length > 0;
  useNavigationWarning(isTaskInProgress, isArabic 
    ? 'لديك صور لم يتم إرسالها. هل أنت متأكد أنك تريد المغادرة؟'
    : 'You have unsent photos. Are you sure you want to leave?');

  const taskData: PhotoTaskData = task?.taskData ? 
    (typeof task.taskData === 'string' ? JSON.parse(task.taskData) : task.taskData) : null;

  const handlePhotoUpload = () => {
    // Simulate photo upload - in production, this would open file picker or camera
    if (uploadedPhotos.length >= (taskData?.maxPhotos || 5)) {
      toast.error(isArabic 
        ? `الحد الأقصى ${taskData?.maxPhotos} صور`
        : `Maximum ${taskData?.maxPhotos} photos allowed`);
      return;
    }

    const newPhoto: UploadedPhoto = {
      id: `photo_${Date.now()}`,
      url: `/placeholder-photo-${uploadedPhotos.length + 1}.jpg`
    };
    setUploadedPhotos(prev => [...prev, newPhoto]);
    toast.success(isArabic ? 'تم رفع الصورة' : 'Photo uploaded');
  };

  const handleRemovePhoto = (photoId: string) => {
    setUploadedPhotos(prev => prev.filter(p => p.id !== photoId));
    const newCaptions = { ...captions };
    delete newCaptions[photoId];
    setCaptions(newCaptions);
  };

  const handleCaptionChange = (photoId: string, caption: string) => {
    setCaptions(prev => ({ ...prev, [photoId]: caption }));
  };

  const handleSubmit = () => {
    if (uploadedPhotos.length < (taskData?.minPhotos || 1)) {
      toast.error(isArabic 
        ? `يجب رفع ${taskData?.minPhotos} صور على الأقل`
        : `Please upload at least ${taskData?.minPhotos} photos`);
      return;
    }

    setIsSubmitting(true);
    const photos = uploadedPhotos.map(p => ({
      url: p.url,
      caption: captions[p.id]
    }));
    submitMutation.mutate({ photos });
  };

  if (isLoading) {
    return (
      <MobileLayout title={isArabic ? 'مهمة صور' : 'Photo Task'} showBack>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={isArabic ? task?.titleAr : task?.titleEn} showBack>
      <div className="p-4 space-y-4">
        {/* Task Description */}
        <Card className="p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            {isArabic ? 'وصف المهمة' : 'Task Description'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isArabic ? task?.descriptionAr : task?.descriptionEn}
          </p>
        </Card>

        {/* Photo Requirements */}
        {taskData?.requirements && taskData.requirements.length > 0 && (
          <Card className="p-4">
            <h4 className="font-semibold mb-3">{isArabic ? 'متطلبات الصور:' : 'Photo Requirements:'}</h4>
            <div className="space-y-2">
              {taskData.requirements.map((req) => (
                <div key={req.id} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                  <span className="text-sm">{isArabic ? req.descriptionAr : req.descriptionEn}</span>
                  {req.required && <span className="text-red-500 text-xs">*</span>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Guidelines */}
        {taskData?.guidelinesEn && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">{isArabic ? 'إرشادات:' : 'Guidelines:'}</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {(isArabic ? taskData.guidelinesAr : taskData.guidelinesEn).map((g, idx) => (
                    <li key={idx}>• {g}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Uploaded Photos */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">{isArabic ? 'الصور المرفوعة:' : 'Uploaded Photos:'}</h4>
            <span className="text-sm text-muted-foreground">
              {uploadedPhotos.length} / {taskData?.maxPhotos || 5}
            </span>
          </div>

          {uploadedPhotos.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <Image className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'لم يتم رفع صور بعد' : 'No photos uploaded yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {uploadedPhotos.map((photo) => (
                <div key={photo.id} className="relative">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-primary/50" />
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {taskData?.allowCaption && (
                    <Textarea
                      value={captions[photo.id] || ''}
                      onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                      placeholder={isArabic ? 'أضف وصفاً...' : 'Add caption...'}
                      className="mt-2 text-xs h-16 resize-none"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {uploadedPhotos.length < (taskData?.maxPhotos || 5) && (
            <Button 
              onClick={handlePhotoUpload} 
              variant="outline" 
              className="w-full mt-4"
            >
              <Upload className="w-5 h-5 mr-2" />
              {isArabic ? 'رفع صورة' : 'Upload Photo'}
            </Button>
          )}
        </Card>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          className="w-full" 
          size="lg"
          disabled={isSubmitting || uploadedPhotos.length < (taskData?.minPhotos || 1)}
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {isArabic ? 'إرسال للمراجعة' : 'Submit for Review'}
            </>
          )}
        </Button>

        {/* Reward Info */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{isArabic ? 'المكافأة:' : 'Reward:'}</span>
            <span className="font-bold text-primary text-lg">{task?.reward} {isArabic ? 'ج.م' : 'EGP'}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isArabic ? 'سيتم مراجعة الصور قبل الموافقة' : 'Photos will be reviewed before approval'}
          </p>
        </Card>
      </div>
    </MobileLayout>
  );
}

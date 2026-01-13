import { useState } from 'react';
import { Upload, X, Camera, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface ProofImage {
  id: string;
  url: string;
  thumbnail: string;
  size: number;
  uploadedAt: Date;
}

interface ProofUploadProps {
  taskId: string;
  maxImages?: number;
  onUploadComplete: (images: ProofImage[]) => void;
}

export function ProofUpload({ taskId, maxImages = 5, onUploadComplete }: ProofUploadProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + images.length > maxImages) {
      alert(`يمكنك رفع ${maxImages} صور كحد أقصى`);
      return;
    }

    // Check file sizes
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setImages(prev => [...prev, ...files]);
  };

  const handleRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      alert('الرجاء اختيار صورة واحدة على الأقل');
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Upload to server/S3
      const uploadedImages: ProofImage[] = images.map((img, i) => ({
        id: `proof-${taskId}-${Date.now()}-${i}`,
        url: previews[i],
        thumbnail: previews[i],
        size: img.size,
        uploadedAt: new Date(),
      }));

      onUploadComplete(uploadedImages);
      setUploadSuccess(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('فشل رفع الصور. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsUploading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-emerald-700 text-lg mb-2">
              تم رفع الإثبات بنجاح! ✅
            </h3>
            <p className="text-sm text-emerald-600">
              سيتم مراجعة المهمة خلال 24 ساعة
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-2">📸 رفع إثبات إكمال المهمة</h3>
        <p className="text-sm text-muted-foreground mb-4">
          ارفع صور واضحة تثبت إكمالك للمهمة حسب التعليمات
        </p>

        {/* Upload Buttons */}
        <div className="flex gap-3 mb-4">
          <Button variant="outline" className="flex-1" asChild>
            <label className="cursor-pointer">
              <Upload className="w-4 h-4 ml-2" />
              اختر صور
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <label className="cursor-pointer">
              <Camera className="w-4 h-4 ml-2" />
              التقط صورة
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </Button>
        </div>

        {/* Image Previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square group">
                <img
                  src={preview}
                  alt={`صورة ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {(images[index].size / 1024).toFixed(0)} KB
                </div>
              </div>
            ))}
            {previews.length < maxImages && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">إضافة صورة</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            )}
          </div>
        )}

        {/* Empty State */}
        {previews.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              لم يتم اختيار أي صور بعد
            </p>
            <p className="text-xs text-muted-foreground">
              يمكنك رفع حتى {maxImages} صور (حد أقصى 5 ميجابايت لكل صورة)
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-700 font-medium mb-2">💡 نصائح مهمة:</p>
          <ul className="text-xs text-blue-600 space-y-1 mr-4">
            <li>• تأكد من وضوح الصور وظهور جميع التفاصيل المطلوبة</li>
            <li>• التقط الصور في إضاءة جيدة</li>
            <li>• تجنب الصور المهتزة أو غير الواضحة</li>
            <li>• اتبع التعليمات المحددة في وصف المهمة</li>
          </ul>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={images.length === 0 || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
              جاري الرفع...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 ml-2" />
              رفع الإثبات ({images.length} {images.length === 1 ? 'صورة' : 'صور'})
            </>
          )}
        </Button>

        {/* Image Count */}
        {images.length > 0 && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            {images.length} من {maxImages} صور
          </p>
        )}
      </CardContent>
    </Card>
  );
}

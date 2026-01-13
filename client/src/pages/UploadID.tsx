import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import { toast } from 'sonner';

export default function UploadID() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [idType, setIdType] = useState<'national' | 'license' | null>(null);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  const handleFileUpload = (side: 'front' | 'back', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') {
          setFrontImage(reader.result as string);
        } else {
          setBackImage(reader.result as string);
        }
        toast.success(t(side === 'front' ? 'uploadId.success.front' : 'uploadId.success.back'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    if (!idType) {
      toast.error(t('uploadId.errors.selectType'));
      return;
    }
    if (!frontImage || !backImage) {
      toast.error(t('uploadId.errors.uploadBoth'));
      return;
    }
    toast.success(t('uploadId.success.complete'));
    setLocation('/selfie-capture');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('uploadId.title')} showBack />
      
      <div className="pt-20 pb-24 px-4 max-w-md mx-auto">
        <div className="space-y-6">
          {/* Instructions */}
          <Card className="p-4 bg-blue-50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              {t('uploadId.instructions.title')}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• {t('uploadId.instructions.clear')}</li>
              <li>• {t('uploadId.instructions.readable')}</li>
              <li>• {t('uploadId.instructions.noInternet')}</li>
              <li>• {t('uploadId.instructions.valid')}</li>
            </ul>
          </Card>

          {/* ID Type Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold">{t('uploadId.selectType')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card 
                className={`p-4 cursor-pointer transition-all ${
                  idType === 'national' 
                    ? 'border-primary border-2 bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setIdType('national')}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🪪</div>
                  <p className="font-semibold">{t('uploadId.types.national')}</p>
                </div>
              </Card>
              <Card 
                className={`p-4 cursor-pointer transition-all ${
                  idType === 'license' 
                    ? 'border-primary border-2 bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setIdType('license')}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🚗</div>
                  <p className="font-semibold">{t('uploadId.types.license')}</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Upload Front */}
          <div className="space-y-3">
            <h3 className="font-semibold">{t('uploadId.front')}</h3>
            <Card className="p-6">
              {frontImage ? (
                <div className="space-y-3">
                  <img src={frontImage} alt="Front ID" className="w-full h-48 object-cover rounded-lg" />
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4" />
                    <span>{t('uploadId.uploaded')}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => setFrontImage(null)}
                  >
                    {t('uploadId.changeImage')}
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFileUpload('front', e)}
                  />
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-semibold mb-1">{t('uploadId.captureOrUpload')}</p>
                    <p className="text-sm text-muted-foreground">{t('uploadId.frontSide')}</p>
                  </div>
                </label>
              )}
            </Card>
          </div>

          {/* Upload Back */}
          <div className="space-y-3">
            <h3 className="font-semibold">{t('uploadId.back')}</h3>
            <Card className="p-6">
              {backImage ? (
                <div className="space-y-3">
                  <img src={backImage} alt="Back ID" className="w-full h-48 object-cover rounded-lg" />
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4" />
                    <span>{t('uploadId.uploaded')}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => setBackImage(null)}
                  >
                    {t('uploadId.changeImage')}
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFileUpload('back', e)}
                  />
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-semibold mb-1">{t('uploadId.captureOrUpload')}</p>
                    <p className="text-sm text-muted-foreground">{t('uploadId.backSide')}</p>
                  </div>
                </label>
              )}
            </Card>
          </div>

          {/* Continue Button */}
          <Button 
            onClick={handleContinue}
            disabled={!idType || !frontImage || !backImage}
            className="w-full h-12 bg-gradient-primary text-white"
          >
            {t('continue')}
          </Button>
        </div>
      </div>
    </div>
  );
}

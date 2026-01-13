import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import { toast } from 'sonner';

export default function SelfieCapture() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfieImage(reader.result as string);
        toast.success(t('selfie.success.captured'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    if (!selfieImage) {
      toast.error(t('selfie.errors.required'));
      return;
    }
    
    // Update profile strength to 60%
    localStorage.setItem('profileStrength', '60');
    toast.success(t('selfie.success.verified'));
    
    setTimeout(() => {
      setLocation('/profile-questions-1');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('selfie.title')} showBack />
      
      <div className="pt-20 pb-24 px-4 max-w-md mx-auto">
        <div className="space-y-6">
          {/* Instructions */}
          <Card className="p-4 bg-blue-50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              {t('selfie.instructions.title')}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• {t('selfie.instructions.lookAtCamera')}</li>
              <li>• {t('selfie.instructions.goodLighting')}</li>
              <li>• {t('selfie.instructions.noAccessories')}</li>
              <li>• {t('selfie.instructions.clearFace')}</li>
            </ul>
          </Card>

          {/* Example */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-sm font-semibold text-primary">{t('selfie.examples.correct')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('selfie.examples.correctDesc')}</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-4xl mb-2">❌</div>
                <p className="text-sm font-semibold text-red-600">{t('selfie.examples.wrong')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('selfie.examples.wrongDesc')}</p>
              </div>
            </Card>
          </div>

          {/* Camera/Upload */}
          <Card className="p-6">
            {selfieImage ? (
              <div className="space-y-4">
                <img src={selfieImage} alt="Selfie" className="w-full h-64 object-cover rounded-lg" />
                <div className="flex items-center gap-2 text-sm text-primary">
                  <CheckCircle className="w-4 h-4" />
                  <span>{t('selfie.greatPhoto')}</span>
                </div>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelfieImage(null)}
                >
                  {t('selfie.retake')}
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="user"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Camera className="w-12 h-12 text-white" />
                  </div>
                  <p className="font-semibold text-lg mb-2">{t('selfie.takeSelfie')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('selfie.tapToOpen')}
                  </p>
                </div>
              </label>
            )}
          </Card>

          {/* Why Selfie */}
          <Card className="p-4 bg-gradient-card">
            <h3 className="font-semibold mb-2">{t('selfie.whyNeed.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('selfie.whyNeed.description')}
            </p>
          </Card>

          {/* Profile Strength Progress */}
          <Card className="p-4 bg-gradient-card border-r-4 border-primary">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{t('selfie.strengthAfter')}</span>
              <span className="text-2xl font-bold text-blue-600">60%</span>
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              {t('selfie.strengthIncrease')}
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary w-[60%]"></div>
            </div>
          </Card>

          {/* Continue Button */}
          <Button 
            onClick={handleContinue}
            disabled={!selfieImage}
            className="w-full h-12 bg-gradient-primary text-white"
          >
            {t('selfie.completeVerification')}
          </Button>
        </div>
      </div>
    </div>
  );
}

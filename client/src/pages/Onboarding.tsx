import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const slides = [
  {
    emoji: '💰',
    title: 'اربح المال بسهولة',
    description: 'أكمل مهام بسيطة واحصل على مكافآت فورية'
  },
  {
    emoji: '📱',
    title: 'مهام متنوعة',
    description: 'استبيانات، مشاهدة فيديوهات، تحميل تطبيقات، وأكثر'
  },
  {
    emoji: '⚡',
    title: 'دفع سريع',
    description: 'اسحب أرباحك في أي وقت بدون حد أدنى'
  },
  {
    emoji: '🎯',
    title: 'ابدأ الآن',
    description: 'انضم لآلاف المستخدمين واربح من هاتفك'
  }
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, setLocation] = useLocation();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Mark onboarding as seen
      localStorage.setItem('hasSeenOnboarding', 'true');
      setLocation('/welcome');
    }
  };

  const handleSkip = () => {
    // Mark onboarding as seen
    localStorage.setItem('hasSeenOnboarding', 'true');
    setLocation('/welcome');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex flex-col max-w-md mx-auto">
      {/* Skip Button */}
      <div className="p-4 text-left">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleSkip}
          className="text-white hover:bg-white/20"
        >
          تخطي
        </Button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white">
        <div className="text-8xl mb-8 animate-bounce">
          {slides[currentSlide].emoji}
        </div>
        
        <h1 className="text-3xl font-bold mb-4">
          {slides[currentSlide].title}
        </h1>
        
        <p className="text-lg opacity-90 mb-8">
          {slides[currentSlide].description}
        </p>

        {/* Dots Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="p-6 space-y-3">
        <Button 
          onClick={handleNext}
          className="w-full h-12 bg-white text-primary hover:bg-gray-100 text-lg"
        >
          {currentSlide < slides.length - 1 ? 'التالي' : 'ابدأ الآن'}
          <ChevronRight className="w-5 h-5 mr-2" />
        </Button>

        {currentSlide > 0 && (
          <Button 
            onClick={() => setCurrentSlide(currentSlide - 1)}
            variant="ghost"
            className="w-full text-white hover:bg-white/20"
          >
            <ChevronLeft className="w-5 h-5 ml-2" />
            السابق
          </Button>
        )}
      </div>
    </div>
  );
}


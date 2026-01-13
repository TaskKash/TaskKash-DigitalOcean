import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfilePowerUp from '@/components/gamification/ProfilePowerUp';
import TargetingTiers from '@/components/gamification/TargetingTiers';
import DataBounties from '@/components/gamification/DataBounties';
import { Zap, Shield, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Gamification() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Mock user ID - in production, get from auth context
  const userId = 1;
  const language = i18n.language === 'ar' ? 'ar' : 'en';

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {language === 'ar' ? '🎮 مركز التحفيز' : '🎮 Gamification Center'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? 'عزز أرباحك من خلال إكمال ملفك الشخصي، فتح المستويات، والإجابة على الأسئلة السريعة'
            : 'Boost your earnings by completing your profile, unlocking tiers, and answering quick questions'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'ar' ? 'تعزيز الملف' : 'Power-Up'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="tiers" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'ar' ? 'المستويات' : 'Tiers'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="bounties" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'ar' ? 'المكافآت' : 'Bounties'}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <ProfilePowerUp userId={userId} language={language} />
        </TabsContent>

        <TabsContent value="tiers" className="mt-0">
          <TargetingTiers userId={userId} language={language} />
        </TabsContent>

        <TabsContent value="bounties" className="mt-0">
          <DataBounties userId={userId} language={language} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

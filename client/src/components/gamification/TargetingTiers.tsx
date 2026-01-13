import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Lock, Unlock, Star, CheckCircle2, Clock, DollarSign, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface TargetingTier {
  id: number;
  tierKey: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  iconUrl: string | null;
  requiredData: string[];
  verificationMethod: 'self_reported' | 'document_upload' | 'third_party_api';
  minTaskReward: string;
  isUnlocked?: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected' | null;
  unlockedAt?: string;
}

interface TargetingTiersProps {
  userId: number;
  language?: 'en' | 'ar';
}

export default function TargetingTiers({ userId, language = 'en' }: TargetingTiersProps) {
  const [tiers, setTiers] = useState<TargetingTier[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<TargetingTier | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  // Using sonner toast

  useEffect(() => {
    fetchTargetingTiers();
  }, [userId]);

  const fetchTargetingTiers = async () => {
    try {
      const response = await fetch(`/api/gamification/targeting-tiers/user/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setTiers(data.tiers);
        setUnlockedCount(data.unlockedCount);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error('Error fetching targeting tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockTier = async (tierKey: string) => {
    setUnlocking(true);
    try {
      const response = await fetch('/api/gamification/targeting-tiers/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          tierKey,
          verificationData: {} // In a real app, collect actual verification data
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: language === 'ar' ? '🎉 تم فتح المستوى!' : '🎉 Tier Unlocked!',
          description: language === 'ar' 
            ? `تم فتح ${data.tier.nameAr} بنجاح!`
            : `${data.tier.nameEn} unlocked successfully!`,
        });
        setSelectedTier(null);
        fetchTargetingTiers();
      } else {
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: data.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error unlocking tier:', error);
    } finally {
      setUnlocking(false);
    }
  };

  const getStatusBadge = (tier: TargetingTier) => {
    if (!tier.isUnlocked) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          <Lock className="w-3 h-3 mr-1" />
          {language === 'ar' ? 'مقفل' : 'Locked'}
        </Badge>
      );
    }
    
    if (tier.verificationStatus === 'verified') {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {language === 'ar' ? 'موثق' : 'Verified'}
        </Badge>
      );
    }
    
    if (tier.verificationStatus === 'pending') {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Clock className="w-3 h-3 mr-1" />
          {language === 'ar' ? 'قيد المراجعة' : 'Pending'}
        </Badge>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-500" />
              {language === 'ar' ? 'مستويات الاستهداف' : 'Targeting Tiers'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'ar' 
                ? 'افتح مستويات حصرية للوصول إلى مهام عالية القيمة' 
                : 'Unlock exclusive tiers to access high-value tasks'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-500">{unlockedCount}/{totalCount}</div>
            <div className="text-xs text-muted-foreground">
              {language === 'ar' ? 'المستويات المفتوحة' : 'Unlocked Tiers'}
            </div>
          </div>
        </div>
      </Card>

      {/* Tiers Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {tiers.map((tier) => (
          <Card 
            key={tier.id}
            className={`p-5 transition-all cursor-pointer ${
              tier.verificationStatus === 'verified'
                ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedTier(tier)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    tier.verificationStatus === 'verified' 
                      ? 'bg-purple-100 dark:bg-purple-900/30' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {tier.verificationStatus === 'verified' ? (
                      <Unlock className="w-6 h-6 text-purple-500" />
                    ) : (
                      <Lock className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {language === 'ar' ? tier.nameAr : tier.nameEn}
                    </h3>
                    {getStatusBadge(tier)}
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? tier.descriptionAr : tier.descriptionEn}
              </p>

              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="font-semibold">
                  {language === 'ar' ? 'الحد الأدنى للمهام:' : 'Min Task Reward:'}
                </span>
                <span className="text-green-600 font-bold">{tier.minTaskReward} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
              </div>

              {!tier.isUnlocked && (
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTier(tier);
                  }}
                >
                  {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Tier Details Dialog */}
      <Dialog open={!!selectedTier} onOpenChange={() => setSelectedTier(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTier?.verificationStatus === 'verified' ? (
                <Unlock className="w-5 h-5 text-purple-500" />
              ) : (
                <Lock className="w-5 h-5 text-gray-400" />
              )}
              {selectedTier && (language === 'ar' ? selectedTier.nameAr : selectedTier.nameEn)}
            </DialogTitle>
            <DialogDescription>
              {selectedTier && (language === 'ar' ? selectedTier.descriptionAr : selectedTier.descriptionEn)}
            </DialogDescription>
          </DialogHeader>

          {selectedTier && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    {language === 'ar' ? 'البيانات المطلوبة:' : 'Required Data:'}
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedTier.requiredData.map((field, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-2 text-sm pt-2 border-t">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-semibold">
                    {language === 'ar' ? 'الحد الأدنى للمهام:' : 'Minimum Task Reward:'}
                  </span>
                  <span className="text-green-600 font-bold">
                    {selectedTier.minTaskReward} {language === 'ar' ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              </div>

              {!selectedTier.isUnlocked && (
                <DialogFooter>
                  <Button 
                    onClick={() => selectedTier && unlockTier(selectedTier.tierKey)}
                    disabled={unlocking}
                    className="w-full"
                  >
                    {unlocking 
                      ? (language === 'ar' ? 'جاري الفتح...' : 'Unlocking...') 
                      : (language === 'ar' ? 'فتح المستوى' : 'Unlock Tier')}
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { useRoute } from 'wouter';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, Heart, Share2, MessageCircle, Star, Award,
  TrendingUp, Users, DollarSign, Calendar, Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

// Mock data - in production this would come from API
const mockAdvertisers: Record<string, any> = {
  'samsung-egypt': {
    id: 'samsung-egypt',
    name: 'Samsung Egypt',
    nameAr: 'سامسونج مصر',
    logo: '/samsung-logo.png',
    coverImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1200&h=400&fit=crop',
    verified: true,
    category: 'تكنولوجيا',
    description: 'سامسونج هي الشركة الرائدة عالمياً في مجال التكنولوجيا والابتكار. انضم إلى مهامنا واستكشف تقنيات المستقبل مع أحدث الهواتف الذكية والأجهزة الإلكترونية. نوفر لك فرصة تجربة منتجاتنا الجديدة والإجابة على استبيانات حول تجربتك.',
    followers: 250000,
    stats: {
      activeCampaigns: 65,
      totalUsers: 85000,
      paymentRate: 99.9,
      avgRating: 4.9,
      reviewsCount: 15420,
      totalPaid: 4250000
    },
    completedTasks: [
      {
        id: 1,
        title: 'Ultra Unfolds | Galaxy Z Fold7 | Samsung',
        titleAr: 'شاهد فيديو Galaxy Z Fold7 التروي',
        reward: 50,
        completions: 1850,
        completionRate: 92.5,
        type: 'فيديو',
        achievements: [
          { icon: '🏆', text: 'أكمل 1,850 مستخدم هذه المهمة بنجاح' }
        ]
      }
    ],
    upcomingTasks: [
      {
        id: 2,
        title: 'Galaxy S25 Ultra Preview',
        titleAr: 'معاينة Galaxy S25 Ultra',
        reward: 200,
        type: 'فيديو',
        startDate: '2025-11-20'
      },
      {
        id: 3,
        title: 'Samsung Galaxy AI Survey',
        titleAr: 'استبيان Samsung Galaxy AI',
        reward: 55,
        type: 'استبيان',
        startDate: '2025-11-18'
      }
    ],
    reviews: [
      {
        id: 1,
        user: 'أحمد محمد',
        rating: 5,
        comment: 'مهام رائعة ودفع سريع! شكراً سامسونج',
        date: '2025-11-05'
      },
      {
        id: 2,
        user: 'فاطمة علي',
        rating: 5,
        comment: 'أفضل معلن على المنصة، مهام ممتعة ومكافآت عالية',
        date: '2025-11-04'
      }
    ]
  }
};

export default function AdvertiserPage() {
  const [, params] = useRoute('/advertiser/:slug');
  const slug = params?.slug || '';
  const advertiser = mockAdvertisers[slug];
  
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [customCoverImage, setCustomCoverImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentCoverImage = customCoverImage || advertiser?.coverImage;

  if (!advertiser) {
    return (
      <MobileLayout title="Advertiser Not Found">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card className="p-8 text-center">
            <p className="text-lg text-muted-foreground">Advertiser not found</p>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (previewImage) {
      setCustomCoverImage(previewImage);
      localStorage.setItem(`cover-${slug}`, previewImage);
      toast.success('تم حفظ صورة الغلاف!');
      setShowUploadDialog(false);
      setPreviewImage(null);
    }
  };

  const handleReset = () => {
    setCustomCoverImage(null);
    setPreviewImage(null);
    localStorage.removeItem(`cover-${slug}`);
    toast.success('تم استعادة الصورة الأصلية!');
  };

  React.useEffect(() => {
    const saved = localStorage.getItem(`cover-${slug}`);
    if (saved) {
      setCustomCoverImage(saved);
    }
  }, [slug]);

  return (
    <MobileLayout title={advertiser.nameAr}>
      <div className="space-y-4">
        {/* Compact Cover Image */}
        <div className="relative h-32 rounded-lg overflow-hidden">
          <img 
            src={currentCoverImage} 
            alt={advertiser.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm text-xs h-8"
            onClick={() => setShowUploadDialog(true)}
          >
            <Eye className="h-3 w-3 ml-1" />
            تغيير
          </Button>
        </div>

        {/* Profile Card - Compact */}
        <Card className="p-4">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-xl bg-white p-2 shadow-md border-2 border-background">
                <img 
                  src={advertiser.logo} 
                  alt={advertiser.name}
                  className="w-full h-full object-contain"
                />
              </div>
              {advertiser.verified && (
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-xl font-bold">{advertiser.nameAr}</h2>
                {advertiser.verified && (
                  <Badge className="gap-1 bg-primary text-xs h-5">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    موثوق
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {advertiser.description}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" className="gap-1 h-8 text-xs">
                  <Heart className="h-3 w-3" />
                  متابعة ({(advertiser.followers / 1000).toFixed(0)}K)
                </Button>
                <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
                  <Share2 className="h-3 w-3" />
                  مشاركة
                </Button>
                <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
                  <MessageCircle className="h-3 w-3" />
                  تواصل
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="text-2xl font-bold text-primary">{advertiser.stats.activeCampaigns}</div>
            <div className="text-xs text-muted-foreground">حملة نشطة</div>
          </Card>
          <Card className="p-3 text-center bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <div className="text-2xl font-bold text-secondary">{(advertiser.stats.totalUsers / 1000).toFixed(0)}K+</div>
            <div className="text-xs text-muted-foreground">مستخدم نشط</div>
          </Card>
          <Card className="p-3 text-center bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <div className="text-2xl font-bold text-green-600">{advertiser.stats.paymentRate}%</div>
            <div className="text-xs text-muted-foreground">معدل الدفع</div>
          </Card>
          <Card className="p-3 text-center bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              {advertiser.stats.avgRating}
            </div>
            <div className="text-xs text-muted-foreground">{(advertiser.stats.reviewsCount / 1000).toFixed(1)}K تقييم</div>
          </Card>
        </div>

        {/* Impact Banner - Compact */}
        <Card className="p-4 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                <Award className="h-5 w-5" />
                التأثير الاجتماعي
              </h3>
              <p className="text-sm text-white/90">
                دفعنا {(advertiser.stats.totalPaid / 1000000).toFixed(1)} مليون ج.م لـ {(advertiser.stats.totalUsers / 1000).toFixed(0)}K مستخدم
              </p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </Card>

        {/* Completed Tasks */}
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            آخر المهام المكتملة
          </h3>
          <div className="space-y-3">
            {advertiser.completedTasks.map((task: any) => (
              <Card key={task.id} className="p-4">
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&h=200&fit=crop"
                      alt={task.titleAr}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm line-clamp-2">{task.titleAr}</h4>
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">مكتملة</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {task.completions.toLocaleString()} مستخدم
                      </span>
                      <span className="flex items-center gap-1 text-primary font-semibold">
                        <DollarSign className="h-3 w-3" />
                        {task.reward} ج.م
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${task.completionRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-green-600">{task.completionRate}%</span>
                    </div>
                    {task.achievements && (
                      <div className="mt-2 flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                        <span>{task.achievements[0].icon}</span>
                        <span>{task.achievements[0].text}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-secondary" />
            المهام القادمة
          </h3>
          <div className="space-y-3">
            {advertiser.upcomingTasks.map((task: any) => (
              <Card key={task.id} className="p-4 bg-gradient-to-r from-secondary/5 to-transparent border-secondary/20">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{task.titleAr}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{task.type}</Badge>
                      <span>يبدأ {task.startDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-secondary">{task.reward} ج.م</div>
                    <div className="text-xs text-muted-foreground">مكافأة</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            تقييمات المستخدمين
          </h3>
          <div className="space-y-3">
            {advertiser.reviews.map((review: any) => (
              <Card key={review.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{review.user}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تغيير صورة الغلاف</DialogTitle>
            <DialogDescription>
              اختر صورة جديدة لغلاف صفحة المعلن (الحد الأقصى 5 ميجابايت)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewImage ? (
              <div className="space-y-4">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-primary">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  اختيار صورة أخرى
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">انقر لاختيار صورة</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, GIF (حتى 5MB)</p>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileSelect}
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {customCoverImage && (
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="w-full sm:w-auto"
              >
                استعادة الصورة الأصلية
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              disabled={!previewImage}
              className="w-full sm:w-auto"
            >
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}

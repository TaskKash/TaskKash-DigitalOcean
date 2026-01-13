import { useParams, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Award,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  MessageCircle
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/layout/Header";

export default function UserProfile() {
  const { userId } = useParams();
  const [, setLocation] = useLocation();

  // Mock user data - في الإنتاج، سيتم جلب البيانات من API
  const user = {
    id: userId,
    name: "أحمد محمد",
    username: "ahmed_mohamed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed",
    coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop",
    bio: "متخصص في المهام التسويقية والاستبيانات. أحب مساعدة الشركات في تحسين منتجاتها من خلال تقديم آراء صادقة.",
    location: "القاهرة، مصر",
    joinedDate: "يناير 2024",
    verified: true,
    stats: {
      tasksCompleted: 87,
      totalEarnings: 12750,
      rating: 4.9,
      reviewsCount: 45
    },
    badges: [
      { id: 1, name: "مبتدئ", icon: "🌟", earned: true },
      { id: 2, name: "محترف", icon: "⭐", earned: true },
      { id: 3, name: "خبير", icon: "🏆", earned: false },
      { id: 4, name: "نجم", icon: "💎", earned: false }
    ],
    successStories: [
      {
        id: 1,
        title: "ساعدت في تحسين تطبيق فودافون",
        description: "شاركت في اختبار التطبيق الجديد وقدمت ملاحظات قيمة ساعدت في تحسين تجربة المستخدم",
        date: "منذ أسبوعين",
        likes: 24,
        comments: 8,
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop"
      },
      {
        id: 2,
        title: "أكملت 50 مهمة في شهر واحد",
        description: "تحدي شخصي لإكمال 50 مهمة خلال شهر. النتيجة: 12,500 ج.م وخبرة رائعة!",
        date: "منذ شهر",
        likes: 42,
        comments: 15
      }
    ],
    reviews: [
      {
        id: 1,
        advertiser: "فودافون مصر",
        advertiserLogo: "/advertisers/vodafone.png",
        rating: 5,
        comment: "مستخدم ممتاز، يقدم ملاحظات دقيقة ومفيدة",
        date: "منذ 3 أيام"
      },
      {
        id: 2,
        advertiser: "أوبر مصر",
        advertiserLogo: "/advertisers/uber.png",
        rating: 5,
        comment: "سريع ودقيق في إنجاز المهام",
        date: "منذ أسبوع"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="الملف الشخصي" showBack />
      
      <div className="pt-16 pb-20">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-r from-primary to-secondary">
        <img 
          src={user.coverImage} 
          alt="Cover" 
          className="w-full h-full object-cover opacity-50"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-background/80 hover:bg-background"
          onClick={() => setLocation("/home")}
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Profile Header */}
      <div className="container -mt-16 relative z-10">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-background"
              />
              {user.verified && (
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {user.verified && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    موثق
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">@{user.username}</p>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {user.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  انضم {user.joinedDate}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 ml-2" />
                متابعة
              </Button>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 ml-2" />
                رسالة
              </Button>
            </div>
          </div>

          {user.bio && (
            <p className="mt-4 text-muted-foreground">{user.bio}</p>
          )}
        </Card>
      </div>

      {/* Stats */}
      <div className="container mt-6">
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{user.stats.tasksCompleted}</div>
            <div className="text-sm text-muted-foreground">مهمة مكتملة</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{user.stats.totalEarnings.toLocaleString()} ج.م</div>
            <div className="text-sm text-muted-foreground">إجمالي الأرباح</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              {user.stats.rating}
            </div>
            <div className="text-sm text-muted-foreground">التقييم</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold">{user.stats.reviewsCount}</div>
            <div className="text-sm text-muted-foreground">مراجعة</div>
          </Card>
        </div>
      </div>

      {/* Badges */}
      <div className="container mt-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            الشارات والإنجازات
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {user.badges.map((badge) => (
              <div 
                key={badge.id}
                className={`text-center p-4 rounded-lg border-2 transition-all ${
                  badge.earned 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted bg-muted/20 opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className="text-sm font-medium">{badge.name}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Success Stories */}
      <div className="container mt-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            قصص النجاح
          </h2>
          <div className="space-y-4">
            {user.successStories.map((story) => (
              <Card key={story.id} className="p-4 hover:shadow-md transition-shadow">
                {story.image && (
                  <img 
                    src={story.image} 
                    alt={story.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="font-semibold mb-2">{story.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{story.description}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{story.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      ❤️ {story.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {story.comments}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>

      {/* Reviews from Advertisers */}
      <div className="container mt-6 mb-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            تقييمات المعلنين
          </h2>
          <div className="space-y-4">
            {user.reviews.map((review) => (
              <Card key={review.id} className="p-4">
                <div className="flex items-start gap-3">
                  <img 
                    src={review.advertiserLogo} 
                    alt={review.advertiser}
                    className="w-12 h-12 rounded-full object-contain bg-white p-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{review.advertiser}</h4>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
      </div>
    </div>
  );
}

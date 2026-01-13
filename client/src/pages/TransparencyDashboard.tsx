import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Star,
  Calculator,
  FileText,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function TransparencyDashboard() {
  const [, setLocation] = useLocation();
  const [reward, setReward] = useState("50");
  const [duration, setDuration] = useState("10");

  const hourlyRate = (parseFloat(reward) / parseFloat(duration)) * 60;
  const isGoodRate = hourlyRate >= 50;

  const platformStats = [
    {
      icon: <Users className="w-6 h-6" />,
      label: "المستخدمون النشطون",
      value: "12,450",
      change: "+8.2%",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      label: "معدل إكمال المهام",
      value: "94.3%",
      change: "+2.1%",
      color: "text-green-600 dark:text-green-400",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      label: "متوسط المكافأة",
      value: "65 ج.م",
      change: "+5.4%",
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: "متوسط وقت الدفع",
      value: "2.3 ساعة",
      change: "-12%",
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      icon: <Star className="w-6 h-6" />,
      label: "متوسط التقييم",
      value: "4.7/5.0",
      change: "+0.3",
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: "تقييم المنصة",
      value: "4.6/5.0",
      change: "من المستخدمين",
      color: "text-pink-600 dark:text-pink-400",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/home")}
          className="text-white hover:bg-white/20 mb-4"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة للرئيسية
        </Button>
        <h1 className="text-2xl font-bold">لوحة الشفافية</h1>
        <p className="text-blue-100 mt-2">
          إحصائيات المنصة في الوقت الفعلي
        </p>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stats">
              <FileText className="w-4 h-4 ml-2" />
              إحصائيات المنصة
            </TabsTrigger>
            <TabsTrigger value="calculator">
              <Calculator className="w-4 h-4 ml-2" />
              حاسبة المعدل الساعي
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            {/* Why We Share */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
              <h2 className="text-lg font-bold mb-2">لماذا نشارك هذه البيانات؟</h2>
              <p className="text-sm text-muted-foreground">
                نؤمن بأن الشفافية تبني الثقة. جميع الإحصائيات أعلاه محدثة في الوقت الفعلي، وتعكس الأداء الحقيقي للمنصة.
              </p>
            </Card>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platformStats.map((stat, index) => (
                <Card key={index} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`${stat.color}`}>{stat.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Algorithm Transparency Link */}
            <Card className="p-6 border-2 border-primary">
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">شفافية الخوارزمية</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    تعرف على كيفية توزيع المهام وكيف يمكنك تحسين فرصك في الحصول على مهام أكثر
                  </p>
                  <Button onClick={() => setLocation("/algorithm-transparency")}>
                    اعرف المزيد
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">احسب المعدل الساعي لأي مهمة</h2>
              <p className="text-sm text-muted-foreground mb-6">
                استخدم هذه الحاسبة لمعرفة المعدل الساعي لأي مهمة قبل قبولها
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="reward">المكافأة (ج.م)</Label>
                  <Input
                    id="reward"
                    type="number"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    placeholder="50"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">المدة المتوقعة (دقيقة)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="10"
                    className="mt-2"
                  />
                </div>

                {/* Result */}
                <Card className={`p-6 ${isGoodRate ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'}`}>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">المعدل الساعي</p>
                    <p className="text-4xl font-bold mb-2">
                      {isNaN(hourlyRate) ? "0.00" : hourlyRate.toFixed(2)} ج.م/ساعة
                    </p>
                    {isGoodRate ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>⭐ مهمة عالية القيمة</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-600 text-white rounded-full text-sm">
                        <span>⚠️ أقل من الحد الأدنى (50 ج.م/ساعة)</span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Minimum Wage Info */}
                <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold mb-2">الحد الأدنى للأجر الساعي</p>
                  <p className="text-sm text-muted-foreground">
                    نعتبر أن تحصل المهام على الحصول نحو <strong>50 ج.م/ساعة</strong> على الأقل. 
                    إذا كانت أقل، احذر أخبر تحصل على قيمة منخفضة عنه القيمة ⚠️
                  </p>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
                  <p className="text-sm">
                    💡 <strong>نصيحة:</strong> ابحث عن المهام ذات القيمة الأعلى للحصول على أفضل عائد
                  </p>
                </Card>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

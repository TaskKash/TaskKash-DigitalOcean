import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BarChart3, Target, TrendingUp, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function AlgorithmTransparency() {
  const [, setLocation] = useLocation();

  const distributionFactors = [
    {
      icon: <Target className="w-5 h-5" />,
      name: "معدل الإكمال",
      weight: 35,
      description: "نسبة المهام التي أكملتها بنجاح من إجمالي المهام المقبولة",
      color: "bg-green-500",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      name: "التقييم",
      weight: 25,
      description: "متوسط تقييمك من المعلنين في آخر 30 يوم",
      color: "bg-blue-500",
    },
    {
      icon: <Users className="w-5 h-5" />,
      name: "مستوى الحساب",
      weight: 20,
      description: "مستواك الحالي (برونزي، فضي، ذهبي، بلاتيني)",
      color: "bg-purple-500",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      name: "النشاط",
      weight: 20,
      description: "عدد المهام المكتملة في آخر 7 أيام",
      color: "bg-orange-500",
    },
  ];

  const performanceStats = [
    { label: "معدل الإكمال", value: "92%", change: "+5%" },
    { label: "متوسط التقييم", value: "4.8/5", change: "+0.2" },
    { label: "المهام المكتملة (7 أيام)", value: "12", change: "+3" },
    { label: "نقاط الأولوية", value: "87/100", change: "+7" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/transparency")}
          className="text-white hover:bg-white/20 mb-4"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة للوحة الشفافية
        </Button>
        <h1 className="text-2xl font-bold">شفافية الخوارزمية</h1>
        <p className="text-purple-100 mt-2">
          كيف يتم توزيع المهام عليك؟
        </p>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Introduction */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-bold mb-3">📊 كيف نختار المهام المناسبة لك؟</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            نستخدم خوارزمية عادلة وشفافة لتوزيع المهام على المستخدمين. الهدف هو مكافأة الأداء الجيد وإعطاء الفرص للجميع.
          </p>
        </Card>

        {/* Distribution Factors */}
        <div>
          <h2 className="text-xl font-bold mb-4">العوامل المؤثرة في التوزيع</h2>
          <div className="space-y-4">
            {distributionFactors.map((factor, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${factor.color} text-white`}>
                    {factor.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{factor.name}</h3>
                      <span className="text-sm font-bold text-primary">
                        {factor.weight}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {factor.description}
                    </p>
                    <Progress value={factor.weight} className="h-2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Your Performance */}
        <div>
          <h2 className="text-xl font-bold mb-4">أداؤك الحالي</h2>
          <div className="grid grid-cols-2 gap-3">
            {performanceStats.map((stat, index) => (
              <Card key={index} className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {stat.change} من الأسبوع الماضي
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* How to Improve */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <h2 className="text-lg font-bold mb-3">💡 كيف تحسن فرصك؟</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>أكمل المهام بجودة عالية لتحسين معدل الإكمال</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>احصل على تقييمات إيجابية من المعلنين</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>كن نشطاً وأكمل مهام بانتظام</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>ارفع مستوى حسابك بإكمال التحقق من الهوية</span>
            </li>
          </ul>
        </Card>

        {/* Fairness Guarantee */}
        <Card className="p-6 border-2 border-primary">
          <h2 className="text-lg font-bold mb-3">🛡️ ضمان العدالة</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            نضمن أن الخوارزمية لا تميز بناءً على العمر، الجنس، الموقع، أو أي عامل شخصي آخر. 
            التوزيع يعتمد فقط على الأداء والنشاط والمهارات المطلوبة للمهمة.
          </p>
        </Card>

        {/* Questions */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-3">❓ أسئلة شائعة</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold mb-1">لماذا لا أرى مهام كثيرة؟</p>
              <p className="text-muted-foreground">
                قد يكون بسبب انخفاض معدل الإكمال أو التقييم. حاول تحسين أدائك في المهام الحالية.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">هل يمكنني الاعتراض على التوزيع؟</p>
              <p className="text-muted-foreground">
                نعم! إذا كنت تعتقد أن هناك خطأ، يمكنك التواصل مع الدعم من صفحة "المساعدة".
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">كم مرة يتم تحديث نقاط الأولوية؟</p>
              <p className="text-muted-foreground">
                يتم تحديثها تلقائياً كل ساعة بناءً على أدائك الأخير.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

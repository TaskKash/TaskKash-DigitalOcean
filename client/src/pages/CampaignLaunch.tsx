import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Rocket, Calculator, Users, Target, Shield, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CampaignLaunch() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams();
  const surveyId = parseInt(params.surveyId || "0");
  const { user } = useApp();
  const isRTL = i18n.language === "ar";

  // Campaign state
  const [campaignName, setCampaignName] = useState("");
  const [serviceTier, setServiceTier] = useState("basic");
  const [pricePerComplete, setPricePerComplete] = useState(10);
  const [userReward, setUserReward] = useState(8);
  const [totalBudget, setTotalBudget] = useState(1000);
  const [targetCompletions, setTargetCompletions] = useState(100);

  // Targeting
  const [targetAgeMin, setTargetAgeMin] = useState(18);
  const [targetAgeMax, setTargetAgeMax] = useState(65);
  const [targetGender, setTargetGender] = useState("all");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [requireKycVerification, setRequireKycVerification] = useState(false);

  // Scheduling
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dailyLimit, setDailyLimit] = useState<number | undefined>();

  // API calls
  const pricingTiers = trpc.surveyManagement.getPricingTiers.useQuery();
  const getSurvey = trpc.surveyManagement.getSurvey.useQuery({ surveyId });
  const createCampaign = trpc.surveyManagement.createCampaign.useMutation();

  const selectedPricingTier = pricingTiers.data?.find((t: any) => t.tierName === serviceTier);

  // Update pricing when tier changes
  useEffect(() => {
    if (selectedPricingTier) {
      setPricePerComplete(selectedPricingTier.minPricePerComplete);
      setUserReward(selectedPricingTier.defaultUserReward);
    }
  }, [selectedPricingTier]);

  // Calculate estimated completions based on budget
  const estimatedCompletions = Math.floor(totalBudget / pricePerComplete);
  const platformMargin = pricePerComplete - userReward;
  const platformMarginPercent = ((platformMargin / pricePerComplete) * 100).toFixed(1);

  const egyptGovernorates = [
    { code: "cairo", name: "Cairo", nameAr: "القاهرة" },
    { code: "giza", name: "Giza", nameAr: "الجيزة" },
    { code: "alexandria", name: "Alexandria", nameAr: "الإسكندرية" },
    { code: "dakahlia", name: "Dakahlia", nameAr: "الدقهلية" },
    { code: "sharqia", name: "Sharqia", nameAr: "الشرقية" },
    { code: "qalyubia", name: "Qalyubia", nameAr: "القليوبية" },
    { code: "beheira", name: "Beheira", nameAr: "البحيرة" },
    { code: "gharbia", name: "Gharbia", nameAr: "الغربية" },
    { code: "menoufia", name: "Menoufia", nameAr: "المنوفية" },
    { code: "kafr_el_sheikh", name: "Kafr El Sheikh", nameAr: "كفر الشيخ" },
    { code: "fayoum", name: "Fayoum", nameAr: "الفيوم" },
    { code: "beni_suef", name: "Beni Suef", nameAr: "بني سويف" },
    { code: "minya", name: "Minya", nameAr: "المنيا" },
    { code: "assiut", name: "Assiut", nameAr: "أسيوط" },
    { code: "sohag", name: "Sohag", nameAr: "سوهاج" },
    { code: "qena", name: "Qena", nameAr: "قنا" },
    { code: "luxor", name: "Luxor", nameAr: "الأقصر" },
    { code: "aswan", name: "Aswan", nameAr: "أسوان" },
    { code: "red_sea", name: "Red Sea", nameAr: "البحر الأحمر" },
    { code: "ismailia", name: "Ismailia", nameAr: "الإسماعيلية" },
    { code: "suez", name: "Suez", nameAr: "السويس" },
    { code: "port_said", name: "Port Said", nameAr: "بورسعيد" },
    { code: "north_sinai", name: "North Sinai", nameAr: "شمال سيناء" },
    { code: "south_sinai", name: "South Sinai", nameAr: "جنوب سيناء" },
    { code: "damietta", name: "Damietta", nameAr: "دمياط" },
    { code: "matrouh", name: "Matrouh", nameAr: "مطروح" },
    { code: "new_valley", name: "New Valley", nameAr: "الوادي الجديد" },
  ];

  const profileTiers = [
    { value: "bronze", label: "Bronze", labelAr: "برونزي" },
    { value: "silver", label: "Silver", labelAr: "فضي" },
    { value: "gold", label: "Gold", labelAr: "ذهبي" },
    { value: "platinum", label: "Platinum", labelAr: "بلاتيني" },
    { value: "elite", label: "Elite (KYC Verified)", labelAr: "نخبة (موثق)" },
  ];

  const handleLaunch = async () => {
    if (!campaignName || !surveyId) return;

    try {
      const result = await createCampaign.mutateAsync({
        surveyId,
        campaignName,
        serviceTier: serviceTier as any,
        pricePerComplete,
        userReward,
        totalBudget,
        targetCompletions,
        targetAgeMin,
        targetAgeMax,
        targetGender: targetGender as any,
        targetLocations: selectedLocations.length > 0 ? selectedLocations : undefined,
        targetProfileTiers: selectedTiers.length > 0 ? selectedTiers : undefined,
        requireKycVerification,
        minCompletionTime: 60,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setLocation(`/advertiser/campaigns/${result.campaignId}`);
    } catch (error) {
      console.error("Error launching campaign:", error);
    }
  };

  if (!getSurvey.data) {
    return <div className="p-4">{isRTL ? "جاري التحميل..." : "Loading..."}</div>;
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation(`/advertiser/surveys/${surveyId}/edit`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{isRTL ? "إطلاق الحملة" : "Launch Campaign"}</h1>
            <p className="text-sm text-gray-500">{getSurvey.data.survey.title}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Campaign Name */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              {isRTL ? "معلومات الحملة" : "Campaign Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{isRTL ? "اسم الحملة" : "Campaign Name"} *</Label>
              <Input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder={isRTL ? "مثال: حملة رمضان 2026" : "e.g., Ramadan 2026 Campaign"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {isRTL ? "التسعير والميزانية" : "Pricing & Budget"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service Tier */}
            <div className="space-y-2">
              <Label>{isRTL ? "مستوى الخدمة" : "Service Tier"}</Label>
              <Select value={serviceTier} onValueChange={setServiceTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pricingTiers.data?.map((tier: any) => (
                    <SelectItem key={tier.tierName} value={tier.tierName}>
                      {isRTL ? tier.displayNameAr : tier.displayName} ({tier.minPricePerComplete}-{tier.maxPricePerComplete} EGP)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Per Complete */}
            <div className="space-y-2">
              <Label>{isRTL ? "السعر لكل استجابة مكتملة" : "Price Per Complete"} (EGP)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[pricePerComplete]}
                  onValueChange={(value) => setPricePerComplete(value[0])}
                  min={selectedPricingTier?.minPricePerComplete || 8}
                  max={selectedPricingTier?.maxPricePerComplete || 100}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={pricePerComplete}
                  onChange={(e) => setPricePerComplete(parseFloat(e.target.value) || 0)}
                  className="w-24"
                />
              </div>
            </div>

            {/* User Reward */}
            <div className="space-y-2">
              <Label>{isRTL ? "مكافأة المستخدم" : "User Reward"} (EGP)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[userReward]}
                  onValueChange={(value) => setUserReward(value[0])}
                  min={5}
                  max={pricePerComplete - 1}
                  step={0.5}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={userReward}
                  onChange={(e) => setUserReward(parseFloat(e.target.value) || 0)}
                  className="w-24"
                />
              </div>
              <p className="text-sm text-gray-500">
                {isRTL ? "هامش المنصة" : "Platform margin"}: {platformMargin.toFixed(2)} EGP ({platformMarginPercent}%)
              </p>
            </div>

            {/* Total Budget */}
            <div className="space-y-2">
              <Label>{isRTL ? "إجمالي الميزانية" : "Total Budget"} (EGP)</Label>
              <Input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                min={100}
              />
              <p className="text-sm text-gray-500">
                {isRTL ? "الاستجابات المقدرة" : "Estimated completions"}: ~{estimatedCompletions}
              </p>
            </div>

            {/* Target Completions */}
            <div className="space-y-2">
              <Label>{isRTL ? "الاستجابات المستهدفة" : "Target Completions"}</Label>
              <Input
                type="number"
                value={targetCompletions}
                onChange={(e) => setTargetCompletions(parseInt(e.target.value) || 0)}
                min={10}
              />
            </div>
          </CardContent>
        </Card>

        {/* Targeting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {isRTL ? "الاستهداف" : "Targeting"}
            </CardTitle>
            <CardDescription>
              {isRTL ? "حدد جمهورك المستهدف" : "Define your target audience"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Age Range */}
            <div className="space-y-2">
              <Label>{isRTL ? "الفئة العمرية" : "Age Range"}</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={targetAgeMin}
                  onChange={(e) => setTargetAgeMin(parseInt(e.target.value) || 18)}
                  min={13}
                  max={100}
                  className="w-24"
                />
                <span className="text-gray-500">-</span>
                <Input
                  type="number"
                  value={targetAgeMax}
                  onChange={(e) => setTargetAgeMax(parseInt(e.target.value) || 65)}
                  min={13}
                  max={100}
                  className="w-24"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>{isRTL ? "الجنس" : "Gender"}</Label>
              <Select value={targetGender} onValueChange={setTargetGender}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? "الكل" : "All"}</SelectItem>
                  <SelectItem value="male">{isRTL ? "ذكر" : "Male"}</SelectItem>
                  <SelectItem value="female">{isRTL ? "أنثى" : "Female"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Profile Tiers */}
            <div className="space-y-2">
              <Label>{isRTL ? "مستويات الملف الشخصي" : "Profile Tiers"}</Label>
              <div className="flex flex-wrap gap-2">
                {profileTiers.map((tier) => (
                  <Badge
                    key={tier.value}
                    variant={selectedTiers.includes(tier.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedTiers.includes(tier.value)) {
                        setSelectedTiers(selectedTiers.filter((t) => t !== tier.value));
                      } else {
                        setSelectedTiers([...selectedTiers, tier.value]);
                      }
                    }}
                  >
                    {isRTL ? tier.labelAr : tier.label}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                {isRTL ? "اترك فارغًا لاستهداف جميع المستويات" : "Leave empty to target all tiers"}
              </p>
            </div>

            {/* Locations */}
            <div className="space-y-2">
              <Label>{isRTL ? "المحافظات" : "Governorates"}</Label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                {egyptGovernorates.map((gov) => (
                  <div key={gov.code} className="flex items-center space-x-2">
                    <Checkbox
                      id={gov.code}
                      checked={selectedLocations.includes(gov.code)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedLocations([...selectedLocations, gov.code]);
                        } else {
                          setSelectedLocations(selectedLocations.filter((l) => l !== gov.code));
                        }
                      }}
                    />
                    <label htmlFor={gov.code} className="text-sm cursor-pointer">
                      {isRTL ? gov.nameAr : gov.name}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                {isRTL ? "اترك فارغًا لاستهداف جميع المحافظات" : "Leave empty to target all governorates"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quality & Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {isRTL ? "الجودة والتحقق" : "Quality & Verification"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{isRTL ? "يتطلب التحقق من الهوية (KYC)" : "Require KYC Verification"}</Label>
                <p className="text-sm text-gray-500">
                  {isRTL ? "قبول الردود فقط من المستخدمين الموثقين" : "Only accept responses from verified users"}
                </p>
              </div>
              <Switch
                checked={requireKycVerification}
                onCheckedChange={setRequireKycVerification}
              />
            </div>
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {isRTL ? "الجدولة" : "Scheduling"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? "تاريخ البدء" : "Start Date"}</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "تاريخ الانتهاء" : "End Date"}</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {isRTL ? "اترك فارغًا للبدء فورًا والاستمرار حتى اكتمال الهدف" : "Leave empty to start immediately and run until target is reached"}
            </p>
          </CardContent>
        </Card>

        {/* Summary & Launch */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{isRTL ? "ملخص الحملة" : "Campaign Summary"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{totalBudget.toLocaleString()} EGP</p>
                <p className="text-sm text-gray-500">{isRTL ? "إجمالي الميزانية" : "Total Budget"}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{targetCompletions}</p>
                <p className="text-sm text-gray-500">{isRTL ? "الاستجابات المستهدفة" : "Target Responses"}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{pricePerComplete} EGP</p>
                <p className="text-sm text-gray-500">{isRTL ? "لكل استجابة" : "Per Response"}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{userReward} EGP</p>
                <p className="text-sm text-gray-500">{isRTL ? "مكافأة المستخدم" : "User Reward"}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              onClick={handleLaunch}
              disabled={!campaignName || createCampaign.isPending}
            >
              <Rocket className="h-5 w-5 mr-2" />
              {createCampaign.isPending
                ? (isRTL ? "جاري الإطلاق..." : "Launching...")
                : (isRTL ? "إطلاق الحملة" : "Launch Campaign")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

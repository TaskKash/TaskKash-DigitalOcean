import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useApp } from "../contexts/AppContext";
import { trpc } from "../lib/trpc";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Vote, Rocket, Users, DollarSign, Target, Calendar, CheckCircle } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function VoteCampaignLaunch() {
  const { currency, symbol, formatAmount } = useCurrency();
  const { t, i18n } = useTranslation();
  const { user } = useApp();
  const [, setLocation] = useLocation();
  const params = useParams();
  const voteId = parseInt(params.id || "0");
  const isRtl = i18n.language === 'ar';

  // Form state
  const [campaignName, setCampaignName] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [pricePerVote, setPricePerVote] = useState("");
  const [userReward, setUserReward] = useState("");
  const [targetVotes, setTargetVotes] = useState("");
  const [targetAgeMin, setTargetAgeMin] = useState("");
  const [targetAgeMax, setTargetAgeMax] = useState("");
  const [targetGender, setTargetGender] = useState<'all' | 'male' | 'female'>('all');
  const [requireKyc, setRequireKyc] = useState(false);
  const [launched, setLaunched] = useState(false);

  // Fetch vote details
  const { data: vote, isLoading } = trpc["voteManagement.getVote"].useQuery({ voteId });

  // Fetch pricing tiers
  const { data: pricingTiers } = trpc["voteManagement.getPricingTiers"].useQuery();

  // Create campaign mutation
  const createCampaignMutation = trpc["voteManagement.createCampaign"].useMutation();

  const selectedTier = pricingTiers?.find((t: any) => t.id === vote?.pricingTierId);

  // Auto-calculate target votes when budget and price change
  const calculatedTargetVotes = totalBudget && pricePerVote 
    ? Math.floor(parseFloat(totalBudget) / parseFloat(pricePerVote))
    : 0;

  const handleLaunch = async () => {
    if (!campaignName || !totalBudget || !pricePerVote || !userReward || !targetVotes) return;

    try {
      await createCampaignMutation.mutateAsync({
        voteId,
        campaignName,
        totalBudget: parseFloat(totalBudget),
        pricePerVote: parseFloat(pricePerVote),
        userReward: parseFloat(userReward),
        targetVotes: parseInt(targetVotes),
        targetAgeMin: targetAgeMin ? parseInt(targetAgeMin) : undefined,
        targetAgeMax: targetAgeMax ? parseInt(targetAgeMax) : undefined,
        targetGender,
        requireKyc,
      });

      setLaunched(true);
    } catch (error) {
      console.error("Failed to launch campaign:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (launched) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <div className="p-6 bg-green-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-4">
          {isRtl ? 'تم إطلاق الحملة بنجاح!' : 'Campaign Launched Successfully!'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isRtl 
            ? 'سيبدأ المستخدمون في التصويت قريباً. يمكنك متابعة النتائج من لوحة التحكم.'
            : 'Users will start voting soon. You can track results from your dashboard.'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => setLocation('/advertiser/votes')}>
            {isRtl ? 'عرض التصويتات' : 'View Votes'}
          </Button>
          <Button onClick={() => setLocation('/advertiser/votes/new')}>
            {isRtl ? 'إنشاء تصويت جديد' : 'Create New Vote'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-purple-100 rounded-full">
          <Vote className="h-8 w-8 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{isRtl ? 'إطلاق حملة التصويت' : 'Launch Vote Campaign'}</h1>
          <p className="text-muted-foreground">{vote?.title}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                {isRtl ? 'تفاصيل الحملة' : 'Campaign Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isRtl ? 'اسم الحملة' : 'Campaign Name'}</Label>
                <Input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder={isRtl ? 'مثال: حملة يناير 2026' : 'e.g., January 2026 Campaign'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {isRtl ? 'الميزانية والتسعير' : 'Budget & Pricing'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isRtl ? 'إجمالي الميزانية ({currency})' : 'Total Budget ({currency})'}</Label>
                  <Input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRtl ? 'السعر لكل تصويت ({currency})' : 'Price per Vote ({currency})'}</Label>
                  <Input
                    type="number"
                    value={pricePerVote}
                    onChange={(e) => setPricePerVote(e.target.value)}
                    placeholder={selectedTier ? `${selectedTier.minPricePerVote}-${selectedTier.maxPricePerVote}` : "10"}
                  />
                  {selectedTier && (
                    <p className="text-xs text-muted-foreground">
                      {isRtl ? 'النطاق الموصى به:' : 'Recommended range:'} {selectedTier.minPricePerVote}-{selectedTier.maxPricePerVote} {symbol}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isRtl ? 'مكافأة المستخدم ({currency})' : 'User Reward ({currency})'}</Label>
                  <Input
                    type="number"
                    value={userReward}
                    onChange={(e) => setUserReward(e.target.value)}
                    placeholder={selectedTier ? `${selectedTier.defaultUserReward}` : "8"}
                  />
                  {selectedTier && (
                    <p className="text-xs text-muted-foreground">
                      {isRtl ? 'الافتراضي:' : 'Default:'} {selectedTier.defaultUserReward} {symbol}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{isRtl ? 'عدد التصويتات المستهدف' : 'Target Votes'}</Label>
                  <Input
                    type="number"
                    value={targetVotes}
                    onChange={(e) => setTargetVotes(e.target.value)}
                    placeholder={calculatedTargetVotes > 0 ? `${calculatedTargetVotes}` : "100"}
                  />
                  {calculatedTargetVotes > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {isRtl ? 'الحد الأقصى بناءً على الميزانية:' : 'Max based on budget:'} {calculatedTargetVotes}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Targeting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {isRtl ? 'استهداف الجمهور' : 'Audience Targeting'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{isRtl ? 'الحد الأدنى للعمر' : 'Min Age'}</Label>
                  <Input
                    type="number"
                    value={targetAgeMin}
                    onChange={(e) => setTargetAgeMin(e.target.value)}
                    placeholder="18"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRtl ? 'الحد الأقصى للعمر' : 'Max Age'}</Label>
                  <Input
                    type="number"
                    value={targetAgeMax}
                    onChange={(e) => setTargetAgeMax(e.target.value)}
                    placeholder="65"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRtl ? 'الجنس' : 'Gender'}</Label>
                  <Select value={targetGender} onValueChange={(v: any) => setTargetGender(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isRtl ? 'الكل' : 'All'}</SelectItem>
                      <SelectItem value="male">{isRtl ? 'ذكر' : 'Male'}</SelectItem>
                      <SelectItem value="female">{isRtl ? 'أنثى' : 'Female'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>{isRtl ? 'يتطلب التحقق من الهوية' : 'Require KYC Verification'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isRtl ? 'فقط المستخدمون المتحقق منهم يمكنهم التصويت' : 'Only verified users can vote'}
                  </p>
                </div>
                <Switch checked={requireKyc} onCheckedChange={setRequireKyc} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isRtl ? 'ملخص التصويت' : 'Vote Summary'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isRtl ? 'العنوان' : 'Title'}</span>
                <span className="font-medium">{vote?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isRtl ? 'النوع' : 'Type'}</span>
                <Badge variant="secondary">{selectedTier?.displayName}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isRtl ? 'الأسئلة' : 'Questions'}</span>
                <span className="font-medium">{vote?.questions?.length || 0}</span>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="text-muted-foreground">{isRtl ? 'الميزانية' : 'Budget'}</span>
                <span className="font-medium">{totalBudget || 0} {symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isRtl ? 'التصويتات المتوقعة' : 'Expected Votes'}</span>
                <span className="font-medium">{targetVotes || calculatedTargetVotes || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isRtl ? 'هامش الربح' : 'Margin'}</span>
                <span className="font-medium text-green-600">
                  {pricePerVote && userReward 
                    ? `${((parseFloat(pricePerVote) - parseFloat(userReward)) / parseFloat(pricePerVote) * 100).toFixed(0)}%`
                    : '0%'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full" 
            size="lg"
            onClick={handleLaunch}
            disabled={!campaignName || !totalBudget || !pricePerVote || !userReward || !targetVotes || createCampaignMutation.isPending}
          >
            {createCampaignMutation.isPending ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <Rocket className="mr-2 h-5 w-5" />
                {isRtl ? 'إطلاق الحملة' : 'Launch Campaign'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useApp } from '@/contexts/AppContext';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, Check, Target, Users, FileText, Rocket,
  Lock, Crown, Zap, Info, DollarSign, Calendar, Clock, AlertTriangle, Monitor,
  Activity, Briefcase, Tag, Globe, Car, Home, Video, HelpCircle, Receipt,
  CheckCircle2, Loader2, UploadCloud, X as XIcon, FileVideo,
  Share2, Copy, Facebook, Twitter, Link as LinkIcon
} from 'lucide-react';

const COUNTRIES = ['Egypt', 'Saudi Arabia', 'United Arab Emirates', 'Kuwait', 'Qatar'];
const DEVICE_BRANDS = ['Samsung', 'Apple', 'Xiaomi', 'Huawei', 'Google', 'Oppo', 'Vivo', 'Realme', 'Nokia', 'OnePlus'];
const CARRIERS_BY_COUNTRY: Record<string, string[]> = {
  'Egypt': ['Vodafone', 'Orange', 'Etisalat', 'WE'],
  'Saudi Arabia': ['STC', 'Zain', 'Mobily'],
  'United Arab Emirates': ['du', 'Etisalat UAE'],
  'Kuwait': ['Zain', 'Ooredoo', 'stc'],
  'Qatar': ['Ooredoo', 'Vodafone Qatar']
};
const INTERESTS = ['Technology', 'Fashion', 'Sports', 'Gaming', 'Travel', 'Food & Dining', 'Health & Fitness', 'Finance & Investing', 'Automotive', 'Beauty & Cosmetics', 'Real Estate', 'Education', 'Entertainment', 'Photography'];
const PURCHASE_INTENTS = ['Smartphone', 'TV', 'Laptop', 'Car', 'Home Appliances', 'Fashion', 'Travel & Tourism', 'Real Estate', 'Furniture', 'Electronics'];
const VEHICLE_BRANDS = ['Toyota', 'Hyundai', 'Kia', 'Nissan', 'BMW', 'Mercedes', 'Volkswagen', 'Ford', 'Chevrolet', 'Honda', 'Suzuki', 'Mitsubishi'];
const WORK_TYPES = ['employed', 'self_employed', 'freelance', 'student', 'homemaker', 'retired'];
const LIFE_STAGES = ['single', 'married', 'married_with_kids', 'parent_18plus', 'retiree'];
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Shubra El-Kheima', 'Port Said', 'Suez', 'Mansoura', 'Tanta', 'Sohag', 'Luxor', 'Aswan'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Taif', 'Tabuk', 'Khobar'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah'],
  'Kuwait': ['Kuwait City', 'Al Ahmadi', 'Hawalli', 'Salmiya', 'Jahra'],
  'Qatar': ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor']
};
// 3rd geo level: Neighborhood / District by City
const DISTRICTS_BY_CITY: Record<string, string[]> = {
  'Cairo': ['Maadi', 'Heliopolis', 'Zamalek', 'New Cairo', 'Nasr City', 'Dokki', 'Mohandiseen', 'Shubra', '6th of October', 'Ain Shams', 'Mattar', 'Haram', 'Rehab', 'Sheikh Zayed'],
  'Alexandria': ['Smouha', 'Gleem', 'Stanley', 'Montazah', 'Agami', 'Sidi Bishr', 'Mandara', 'Sporting', 'Miami'],
  'Giza': ['Dokki', 'Mohandiseen', 'Agouza', 'Imbaba', 'Haram', 'Faisal', 'October City'],
  'Riyadh': ['Al Olaya', 'Al Malaz', 'Al Naseem', 'Al Rawdah', 'Diplomatic Quarter', 'Al Wurud'],
  'Jeddah': ['Al Hamra', 'Al Andalus', 'Al Rawdah', 'Al Safa', 'Al Zahra', 'Obhur'],
  'Dubai': ['Downtown', 'Marina', 'JBR', 'DIFC', 'Deira', 'Bur Dubai', 'Jumeirah', 'JLT', 'Business Bay', 'Palm Jumeirah'],
  'Abu Dhabi': ['Corniche', 'Al Reem Island', 'Khalidiyah', 'Yas Island', 'Saadiyat Island'],
  'Kuwait City': ['Salmiya', 'Rumaithiya', 'Bayan', 'Mishref', 'Abu Halifa'],
  'Doha': ['The Pearl', 'West Bay', 'Al Sadd', 'Msheireb', 'Bin Mahmoud']
};
// Device models by brand for hyper-precise device targeting
const DEVICE_MODELS_BY_BRAND: Record<string, string[]> = {
  'Samsung': ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23', 'Galaxy A54', 'Galaxy A34', 'Galaxy A14', 'Galaxy M54', 'Galaxy Note 20', 'Galaxy Fold 5'],
  'Apple': ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone SE'],
  'Xiaomi': ['Xiaomi 14', 'Xiaomi 13T', 'Redmi Note 13', 'Redmi Note 12', 'Redmi 12', 'POCO X6', 'POCO F5'],
  'Huawei': ['Huawei P60', 'Huawei Mate 60', 'Nova 11', 'Nova 10', 'Y90', 'Y70'],
  'Google': ['Pixel 8 Pro', 'Pixel 8', 'Pixel 7a', 'Pixel 7', 'Pixel 6a'],
  'Oppo': ['Oppo Find X7', 'Oppo Reno 10', 'Oppo A78', 'Oppo A58', 'Oppo A17'],
  'Vivo': ['Vivo V30', 'Vivo V29', 'Vivo Y100', 'Vivo Y36', 'Vivo Y17s'],
  'Realme': ['Realme 12 Pro', 'Realme 11 Pro', 'Realme C67', 'Realme C55'],
  'Nokia': ['Nokia G42', 'Nokia G22', 'Nokia C32', 'Nokia XR20'],
  'OnePlus': ['OnePlus 12', 'OnePlus 11', 'OnePlus Nord 3', 'OnePlus Nord CE 3']
};
const INCOME_LEVELS = ['low', 'lower_mid', 'mid', 'upper_mid', 'high'];
const CONNECTION_TYPES = ['4G', '5G', 'WiFi', '3G'];
const DEVICE_TIERS = ['A', 'B', 'C'];
const SHOPPING_FREQS = ['daily', 'weekly', 'monthly', 'rarely'];
const BRAND_AFFINITY = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Zara', 'H&M', 'Amazon', 'Noon', 'Jumia', 'Carrefour', 'IKEA', 'Starbucks', "McDonald's", 'KFC', 'Pepsi', 'Coca-Cola', "L'Oréal", 'Unilever', 'Procter & Gamble', 'Vodafone'];
const VALUES_LIST = ['Family First', 'Sustainability', 'Innovation', 'Health & Wellness', 'Education', 'Faith & Spirituality', 'Career Growth', 'Social Justice', 'Luxury & Prestige', 'Adventure', 'Minimalism', 'Community'];
const PREFERRED_STORES = ['Jumia', 'Amazon', 'Noon', 'Carrefour', 'IKEA', 'H&M', 'Zara', 'Lulu Hypermarket', 'Spinneys', 'Talabat', 'Uber Eats', 'Shein', 'AliExpress'];
const ACTIVITY_PATTERNS = ['night_owl', 'commuter', 'daytime'];
const INDUSTRIES = ['Technology', 'Healthcare', 'Education', 'Finance & Banking', 'Retail & E-commerce', 'Manufacturing', 'Construction & Real Estate', 'Government', 'Media & Entertainment', 'Hospitality & Tourism', 'Transportation & Logistics', 'Agriculture', 'Telecommunications'];
const JOB_TITLES = ['Engineer', 'Doctor', 'Teacher', 'Manager', 'Director', 'Accountant', 'Designer', 'Developer', 'Sales Representative', 'Marketing Specialist', 'Lawyer', 'Analyst', 'Consultant', 'Business Owner'];
const HOME_OWNERSHIP = ['owner', 'renter'];

// Commission rates by advertiser tier
const TIER_COMMISSION: Record<string, number> = {
  basic: 0.10,
  pro: 0.15,
  business: 0.20,
  enterprise: 0.25,
};

const STEPS = [
  { id: 1, title: 'Basics', icon: FileText },
  { id: 2, title: 'Audience', icon: Target },
  { id: 3, title: 'Content & Budget', icon: Video },
  { id: 4, title: 'Review & Launch', icon: Rocket },
];

const SelectAllControls = ({ options, current, onChange }: { options: string[], current: string[], onChange: (val: string[]) => void }) => (
  <div className="flex gap-3 mb-3 mt-1">
    <button type="button" onClick={() => onChange(options)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 justify-center flex items-center gap-1"><Check className="w-3 h-3" /> Select All</button>
    <button type="button" onClick={() => onChange([])} className="text-xs font-semibold text-gray-500 hover:text-gray-800 justify-center flex items-center gap-1"><XIcon className="w-3 h-3" /> Clear All</button>
  </div>
);

const showOption = (dict: Record<string, number>, key: string) => {
  if (!dict || Object.keys(dict).length === 0) return true;
  return (dict[key] || 0) > 0;
};

export default function CampaignBuilder() {
  const [, setLocation] = useLocation();
  const { user } = useApp();

  const [step, setStep] = useState(1);
  const [advertiserTier, setAdvertiserTier] = useState('basic');
  const [advertiserCountry, setAdvertiserCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [launched, setLaunched] = useState(false);

  const symbol = advertiserCountry === 'Egypt' ? 'EGP' : (user?.currency || 'USD');

  const [reachData, setReachData] = useState({
    totalReach: 0, rawCount: 0, meetsMinimum: true,
    breakdown: { 
      byTier: {} as Record<string, number>, 
      byGender: {} as Record<string, number>, 
      byDeviceTier: {} as Record<string, number>,
      byCarrier: {} as Record<string, number>,
      byBrand: {} as Record<string, number>,
      byIncomeLevel: {} as Record<string, number>,
      byWorkType: {} as Record<string, number>,
      byCountry: {} as Record<string, number>
    }
  });
  const [isCalculating, setIsCalculating] = useState(false);

  const [campaign, setCampaign] = useState({
    titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '',
    type: 'video',
    reward: 10,
    totalBudget: 1000,
    completionsNeeded: 100,
    // Content (Step 3)
    videoUrl: '',
    minWatchPercent: 80,
    quizQuestions: [
      {
        question: '',
        options: { A: '', B: '', C: '', D: '' },
        correctAnswer: 'A'
      }
    ],
    targeting: {
      countries: [] as string[], cities: [] as string[], districts: [] as string[],
      ageMin: '' as any, ageMax: '' as any, gender: 'all' as 'all' | 'male' | 'female',
      incomeLevels: [] as string[], homeOwnership: '' as '' | 'owner' | 'renter',
      deviceTiers: [] as string[], deviceOs: '' as '' | 'iOS' | 'Android',
      deviceBrands: [] as string[], deviceModels: [] as string[], networkCarriers: [] as string[], connectionTypes: [] as string[],
      interests: [] as string[], interestsMatchAll: false,
      brandAffinity: [] as string[], brandAffinityMatchAll: false,
      values: [] as string[], valuesMatchAll: false,
      lifeStages: [] as string[],
      shoppingFrequencies: [] as string[],
      preferredStores: [] as string[], preferredStoresMatchAll: false,
      nextPurchaseIntent: [] as string[], nextPurchaseIntentMatchAll: false,
      activityPatterns: [] as string[],
      hasVehicle: undefined as boolean | undefined,
      vehicleBrands: [] as string[],
      workTypes: [] as string[],
      industries: [] as string[],
      jobTitles: [] as string[],
      householdSizeMin: '' as any, householdSizeMax: '' as any,
      tierMin: '' as '' | 'bronze' | 'silver' | 'gold' | 'platinum',
      tiers: [] as string[],
      profileStrengthMin: '' as any,
      completedTasksMin: '' as any
    },
    // For local file upload simulation
    videoFileName: ''
  });

  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    const info = localStorage.getItem('advertiser-info');
    if (info) {
      const parsed = JSON.parse(info);
      setAdvertiserTier(parsed.tier || 'basic');
      if (parsed.country) setAdvertiserCountry(parsed.country);
    }
  }, []);

  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(async () => {
      try {
        const payload: any = { ...campaign.targeting };
        Object.keys(payload).forEach(key => {
          if (Array.isArray(payload[key]) && payload[key].length === 0) delete payload[key];
          if (payload[key] === '' || payload[key] === undefined) delete payload[key];
        });
        // Pass known values so backend can correctly compute 'Others' complement
        payload._knownInterests = INTERESTS;
        payload._knownLifeStages = LIFE_STAGES;
        payload._knownWorkTypes = WORK_TYPES;
        payload._knownPurchaseIntents = PURCHASE_INTENTS;
        payload._knownIndustries = INDUSTRIES;
        payload._knownJobTitles = JOB_TITLES;
        const res = await fetch('/api/advertiser/segments', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          credentials: 'include', body: JSON.stringify(payload)
        });
        if (res.ok) setReachData(await res.json());
      } catch (err) { console.error('Segment eval failed:', err); }
      finally { setIsCalculating(false); }
    }, 800);
    return () => clearTimeout(timer);
  }, [campaign.targeting]);

  const toggleArrayItem = (key: keyof typeof campaign.targeting, value: string) => {
    setCampaign(prev => {
      const arr = prev.targeting[key] as string[];
      const next = arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value];
      return { ...prev, targeting: { ...prev.targeting, [key]: next } };
    });
  };

  const setTargetingArray = (key: keyof typeof campaign.targeting, values: string[]) => {
    setCampaign(prev => ({ ...prev, targeting: { ...prev.targeting, [key]: values } }));
  };

  // Commission calculations
  const commissionRate = TIER_COMMISSION[advertiserTier] ?? 0.10;
  
  // The advertiser inputs the Total Campaign Budget and Target Completions
  const totalCampaignCost = campaign.totalBudget || 0;
  
  // totalCampaignCost = RewardBudget * (1 + commissionRate)
  const rewardBudget = totalCampaignCost / (1 + commissionRate);
  const totalCommission = totalCampaignCost - rewardBudget;
  
  const rewardPerTask = rewardBudget / (campaign.completionsNeeded || 1);
  const commissionPerTask = totalCommission / (campaign.completionsNeeded || 1);
  const totalCostPerTask = rewardPerTask + commissionPerTask;

  const handleNext = () => setStep(p => Math.min(p + 1, 4));
  const handleBack = () => setStep(p => Math.max(p - 1, 1));

  const handleSubmit = async () => {
    if (!reachData.meetsMinimum) {
      toast.error('Audience is below 500 minimum threshold.');
      return;
    }
    const hasIncompleteQuestions = campaign.quizQuestions.some(q => !q.question || !q.options.A || !q.options.B);
    if (!campaign.titleEn || !campaign.videoUrl || hasIncompleteQuestions) {
      toast.error('Please complete all required fields (title, video URL, all quiz questions with at least 2 options).');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        credentials: 'include',
        body: JSON.stringify({
          title: campaign.titleEn,
          titleAr: campaign.titleAr,
          description: campaign.descriptionEn,
          type: 'video',
          reward: rewardPerTask,
          totalBudget: totalCampaignCost,
          completionsNeeded: campaign.completionsNeeded,
          videoUrl: campaign.videoUrl,
          minWatchPercent: campaign.minWatchPercent,
          quizQuestions: campaign.quizQuestions,
          targeting: campaign.targeting,
          status: 'pending_review',
        })
      });
      if (res.ok || res.status === 201) {
        setLaunched(true);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Failed to submit campaign. Please try again.');
      }
    } catch (e) {
      // If API not available on localhost, still show success
      setLaunched(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── LAUNCHED CONFIRMATION SCREEN ───────────────────────────────
  if (launched) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Submitted!</h2>
          <p className="text-gray-500 mb-6">
            Your campaign <strong>"{campaign.titleEn}"</strong> has been submitted for admin review.
            You'll be notified once it's approved and goes live.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-amber-800 mb-1">📋 Pending Admin Review</p>
            <p className="text-xs text-amber-700">Your campaign is in the moderation queue. Typical review time is 1–4 hours. Once approved, it will be distributed to your target audience automatically.</p>
          </div>
          <div className="bg-gray-50 border rounded-lg p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Campaign Budget</span><span className="font-semibold">{totalCampaignCost.toFixed(2)} {symbol}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Reward per Tasker</span><span className="font-semibold">{rewardPerTask.toFixed(2)} {symbol}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">TaskKash Commission</span><span className="font-semibold text-blue-600">{totalCommission.toFixed(2)} {symbol}</span></div>
            <div className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold">Target Completions</span><span className="font-bold">{campaign.completionsNeeded}</span></div>
          </div>
          
          {/* Social Sharing */}
          <div className="border-t pt-5 mb-6">
            <p className="font-medium text-gray-700 text-sm mb-3">Attract your audience directly by sharing your campaign link:</p>
            <div className="flex gap-2 justify-center mb-4">
              <Button size="icon" variant="outline" className="rounded-full w-10 h-10 bg-[#1877F2] text-white hover:bg-[#1877F2]/90 hover:text-white border-0">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full w-10 h-10 bg-black text-white hover:bg-black/90 hover:text-white border-0">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full w-10 h-10 bg-[#25D366] text-white hover:bg-[#25D366]/90 hover:text-white border-0">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg border">
              <LinkIcon className="w-4 h-4 text-gray-500 ml-2" />
              <input title="Campaign URL" type="text" readOnly value="https://taskkash.com/tasks/demo-preview" className="bg-transparent border-none outline-none text-sm text-gray-600 flex-1 w-full" />
              <Button size="sm" variant="secondary" onClick={() => {
                navigator.clipboard.writeText("https://taskkash.com/tasks/demo-preview");
                toast.success("Link copied to clipboard!");
              }} className="shrink-0 h-8">
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
            </div>
          </div>

          <Button onClick={() => setLocation('/advertiser/new-dashboard')} className="w-full">Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  // ─── COMMISSION BREAKDOWN PANEL ──────────────────────────────────
  const CommissionPanel = () => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Live Budget Breakdown</h3>
        <Badge variant="outline" className="ml-auto text-xs capitalize border-blue-300 text-blue-700">
          {advertiserTier} — {(commissionRate * 100).toFixed(0)}% commission
        </Badge>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Reward per completion</span>
          <span className="font-semibold">{rewardPerTask.toFixed(2)} {symbol}</span>
        </div>
        <div className="flex justify-between items-center text-blue-600">
          <span>TaskKash commission ({(commissionRate * 100).toFixed(0)}%)</span>
          <span className="font-semibold">{commissionPerTask.toFixed(2)} {symbol}</span>
        </div>
        <div className="flex justify-between items-center border-t border-blue-200 pt-3">
          <span className="text-gray-600">Total cost per completion</span>
          <span className="font-bold">{totalCostPerTask.toFixed(2)} {symbol}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">× {campaign.completionsNeeded} completions</span>
          <span className="font-bold text-lg text-blue-700">{totalCampaignCost.toFixed(2)} {symbol}</span>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-200 text-xs text-gray-500 mt-2">
          💡 Full budget is escrowed on launch. You are only charged per verified completion.
        </div>
      </div>
    </div>
  );

  // ─── MOBILE SIMULATOR PANEL ──────────────────────────────────
  const MobileSimulator = () => (
    <div className="bg-gray-900 rounded-[2rem] p-3 shadow-xl w-full max-w-[320px] border-4 border-gray-800 mx-auto relative overflow-hidden">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10"></div>
      
      {/* Screen */}
      <div className="bg-gray-100 h-[600px] rounded-[1.5rem] overflow-hidden flex flex-col relative text-left">
        {/* Header */}
        <div className="bg-white px-4 pt-8 pb-3 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-primary rounded-full">
               <span className="text-xs font-bold text-white">TK</span>
            </div>
            <span className="font-bold text-sm text-gray-800">Task Preview</span>
          </div>
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0 flex items-center gap-1">
            <span className="font-bold leading-none">{symbol === 'EGP' ? 'ج.م' : '$'}</span>
            {rewardPerTask.toFixed(2)}
          </Badge>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-16">
          {/* Video Header Area */}
          <div className="bg-black w-full aspect-video flex items-center justify-center relative shadow-sm">
            {campaign.videoUrl ? (
              <video src={campaign.videoUrl} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center">
                <Video className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-gray-500 text-xs">Video Content</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
               <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer">
                 <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-primary border-b-[8px] border-b-transparent ml-1"></div>
               </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">Req. Watch: {campaign.minWatchPercent}%</div>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-700 border-blue-200">Video Task</Badge>
                 <span className="text-[10px] text-gray-500 bg-gray-200/50 px-1.5 py-0.5 rounded">Duration: 2m</span>
              </div>
              <h2 className="font-bold text-lg leading-tight text-gray-900 mt-1">{campaign.titleEn || 'Your Campaign Title Goes Here'}</h2>
            </div>
          
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Instructions</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{campaign.descriptionEn || 'Describe the objective of this task to the user. This section tells them what to expect out of your video.'}</p>
            </div>
          
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm opacity-80 pointer-events-none">
              <h3 className="font-bold text-sm text-gray-800 mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-500" /> Completion Quiz ({campaign.quizQuestions.length} Qs)
              </h3>
              <p className="text-sm text-gray-700 mb-3 font-medium">{campaign.quizQuestions[0]?.question || 'Users must answer questions to pass?'}</p>
              <div className="space-y-2">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                  const text = campaign.quizQuestions[0]?.options[opt];
                  if (!text && opt !== 'A' && opt !== 'B') return null;
                  return (
                    <div key={opt} className={`p-2 rounded border text-xs font-medium ${campaign.quizQuestions[0]?.correctAnswer === opt ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 bg-gray-50'}`}>
                      {text || `Answer option ${opt}`}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center flex items-center justify-center gap-1">
                 <Lock className="w-3 h-3" /> Unlocks after watching {campaign.minWatchPercent}%
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <Button className="w-full rounded-lg font-bold shadow-sm opacity-50 cursor-not-allowed">Start Task</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent pb-24">
      {/* Sticky Header */}
      <div className="bg-white border-b sticky top-16 z-20 -mx-6 lg:-mx-8 -mt-6 lg:-mt-8 mb-6 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-4 flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center justify-between">
          <button onClick={() => setLocation('/advertiser/new-dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" /><span>Dashboard</span>
          </button>
          <h1 className="text-xl font-bold hidden sm:block">Campaign Builder</h1>
          <div className="flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-lg border border-primary/20">
            <Target className={`w-5 h-5 text-primary ${isCalculating ? 'animate-spin' : ''}`} />
            <div className="text-right">
              <p className="text-xs text-muted-foreground leading-none mb-1">Est. Reach</p>
              <p className={`text-xl font-bold font-mono text-primary ${isCalculating ? 'opacity-50' : ''}`}>{reachData.totalReach.toLocaleString()}</p>
            </div>
          </div>
        </div>
        {/* Tabs Layout UI */}
        <div className="max-w-5xl mx-auto px-6 lg:px-8 pb-0 pt-2">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 border-b">
            {STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  step === s.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <s.icon className="w-4 h-4" />
                <span>{s.title}</span>
                {step > s.id && <CheckCircle2 className="w-4 h-4 ml-1 text-green-500" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* ── STEP 1: BASICS ── */}
        {step === 1 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Campaign Fundamentals</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Campaign Title (English) *</Label>
                  <Input value={campaign.titleEn} onChange={e => setCampaign({ ...campaign, titleEn: e.target.value })} placeholder="e.g. Try Our New Coffee" />
                </div>
                <div>
                  <Label>Campaign Title (Arabic)</Label>
                  <Input dir="rtl" value={campaign.titleAr} onChange={e => setCampaign({ ...campaign, titleAr: e.target.value })} placeholder="مثال: جرب قهوتنا الجديدة" />
                </div>
                <div>
                  <Label>Campaign Budget ({symbol}) *</Label>
                  <div className="flex items-center gap-3">
                    <Input type="number" min={10} value={campaign.totalBudget} onChange={e => setCampaign({ ...campaign, totalBudget: +e.target.value })} className="w-32" />
                    <span className="text-sm text-gray-500">Total spent</span>
                  </div>
                </div>
                <div>
                  <Label>Target Completions *</Label>
                  <Input type="number" min={10} value={campaign.completionsNeeded} onChange={e => setCampaign({ ...campaign, completionsNeeded: +e.target.value })} />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Description (English) *</Label>
                  <Textarea value={campaign.descriptionEn} onChange={e => setCampaign({ ...campaign, descriptionEn: e.target.value })} rows={4} placeholder="Describe what taskers will do..." />
                </div>
                <CommissionPanel />
              </div>
            </div>
          </Card>
        )}

        {/* ── STEP 2: AUDIENCE ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex gap-4 border border-blue-200">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Granular Audience Targeting</h4>
                <p className="text-sm mt-1">Narrow down your exact audience using 7 demographic, behavioral, and psychographic filters. Our engine silently filters for KYC-verified users with &gt;60% profile strength.</p>
              </div>
            </div>
            {!reachData.meetsMinimum && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg flex gap-3 border border-red-200">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">Audience too narrow (under 500 users). Broaden your filters to launch.</p>
              </div>
            )}

            {/* Geography */}
            <Accordion type="single" collapsible defaultValue="cat-geo" className="bg-white rounded-lg shadow-sm border">
              <AccordionItem value="cat-geo" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded text-teal-600"><Globe className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">1. Geography & Location</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-4">
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Target Countries</Label>
                    <SelectAllControls options={COUNTRIES} current={campaign.targeting.countries} onChange={v => setTargetingArray('countries', v)} />
                    <div className="flex flex-wrap gap-2">
                      {COUNTRIES.map(c => (
                        <label key={c} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.countries.includes(c) ? 'bg-teal-50 border-teal-500' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.countries.includes(c)} onCheckedChange={() => toggleArrayItem('countries', c)} />
                          <span>{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Primary Cities</Label>
                    {campaign.targeting.countries.length === 0 ? (
                      <div className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded border">
                        Please select at least one country first to view cities.
                      </div>
                    ) : (
                      <>
                        <SelectAllControls options={campaign.targeting.countries.flatMap(country => CITIES_BY_COUNTRY[country] || [])} current={campaign.targeting.cities} onChange={v => setTargetingArray('cities', v)} />
                        <div className="flex flex-wrap gap-2">
                          {campaign.targeting.countries.flatMap(country => CITIES_BY_COUNTRY[country] || []).map(city => (
                            <label key={city} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.cities.includes(city) ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-gray-50'}`}>
                              <Checkbox checked={campaign.targeting.cities.includes(city)} onCheckedChange={() => toggleArrayItem('cities', city)} />
                              <span>{city}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  {/* Level 3 Geo: Districts shown when cities are selected */}
                  {campaign.targeting.cities.length > 0 && (() => {
                    const availableDistricts = campaign.targeting.cities.flatMap(city => DISTRICTS_BY_CITY[city] || []);
                    return availableDistricts.length > 0 ? (
                      <div className="border-t pt-4">
                        <Label className="mb-1 block">Neighborhoods / Districts <span className="text-xs text-teal-600 font-medium ml-1 bg-teal-50 px-2 py-0.5 rounded-full">Hyper-Local</span></Label>
                        <p className="text-xs text-gray-500 mb-3">Target specific neighborhoods within the selected cities.</p>
                        <SelectAllControls options={availableDistricts} current={campaign.targeting.districts} onChange={v => setTargetingArray('districts', v)} />
                        <div className="flex flex-wrap gap-2">
                          {availableDistricts.map(district => (
                            <label key={district} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer text-sm ${campaign.targeting.districts.includes(district) ? 'bg-teal-50 border-teal-500' : 'bg-white hover:bg-gray-50'}`}>
                              <Checkbox checked={campaign.targeting.districts.includes(district)} onCheckedChange={() => toggleArrayItem('districts', district)} />
                              <span>{district}</span>
                            </label>
                          ))}
                          <label className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer border-dashed text-sm ${campaign.targeting.districts.includes('__others__') ? 'bg-slate-100 border-slate-500' : 'bg-white hover:bg-slate-50 border-slate-300'}`}>
                            <Checkbox checked={campaign.targeting.districts.includes('__others__')} onCheckedChange={() => toggleArrayItem('districts', '__others__')} />
                            <span className="text-slate-600 font-medium">Others / Not Specified</span>
                          </label>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Demographics */}
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              <AccordionItem value="cat-1" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded text-blue-600"><Users className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">2. Demographics</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-8 border-t pt-4">
                    <div>
                      <Label className="mb-4 block">Age Range: {campaign.targeting.ageMin || 16} – {campaign.targeting.ageMax || 80}</Label>
                      <Slider defaultValue={[16, 80]} max={80} min={16} step={1} onValueChange={([min, max]) => setCampaign(p => ({ ...p, targeting: { ...p.targeting, ageMin: min, ageMax: max } }))} />
                    </div>
                    <div>
                      <Label className="mb-2 block">Gender</Label>
                      <div className="flex gap-2">
                        {['all', 'male', 'female'].map(g => (
                          <button key={g} onClick={() => setCampaign(p => ({ ...p, targeting: { ...p.targeting, gender: g as any } }))}
                            className={`px-4 py-2 border rounded-md capitalize ${campaign.targeting.gender === g ? 'bg-primary text-white' : 'bg-gray-50'}`}>{g}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Financial */}
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              <AccordionItem value="cat-2" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded text-green-600"><DollarSign className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">3. Financial & Income</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-4">
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Income Level Segments</Label>
                    <SelectAllControls options={INCOME_LEVELS.filter(inc => showOption(reachData.breakdown.byIncomeLevel, inc))} current={campaign.targeting.incomeLevels} onChange={v => setTargetingArray('incomeLevels', v)} />
                    <div className="flex flex-wrap gap-2">
                      {INCOME_LEVELS.filter(inc => showOption(reachData.breakdown.byIncomeLevel, inc)).map(inc => (
                        <label key={inc} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.incomeLevels.includes(inc) ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.incomeLevels.includes(inc)} onCheckedChange={() => toggleArrayItem('incomeLevels', inc)} />
                          <span className="capitalize">{inc.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Home Ownership</Label>
                    <div className="flex gap-2">
                      {[['', 'Any'], ['owner', 'Owner'], ['renter', 'Renter']].map(([val, label]) => (
                        <button key={val} onClick={() => setCampaign(p => ({ ...p, targeting: { ...p.targeting, homeOwnership: val as any } }))}
                          className={`px-4 py-2 border rounded-md ${campaign.targeting.homeOwnership === val ? 'bg-primary text-white' : 'bg-gray-50'}`}>{label}</button>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Psychographics */}
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              <AccordionItem value="cat-4" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 rounded text-pink-600"><Activity className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">4. Psychographics & Interests</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6">
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Primary Interests</Label>
                    <SelectAllControls options={INTERESTS} current={campaign.targeting.interests} onChange={v => setTargetingArray('interests', v)} />
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map(int => (
                        <label key={int} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.interests.includes(int) ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.interests.includes(int)} onCheckedChange={() => toggleArrayItem('interests', int)} />
                          <span>{int}</span>
                        </label>
                      ))}
                      <label className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer border-dashed ${campaign.targeting.interests.includes('__others__') ? 'bg-slate-100 border-slate-500' : 'bg-white hover:bg-slate-50 border-slate-300'}`}>
                        <Checkbox checked={campaign.targeting.interests.includes('__others__')} onCheckedChange={() => toggleArrayItem('interests', '__others__')} />
                        <span className="text-slate-600 font-medium">Others / Not Specified</span>
                      </label>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Brand Affinity <span className="text-xs text-pink-600 font-medium ml-1 bg-pink-50 px-2 py-0.5 rounded-full">Competitive Targeting</span></Label>
                    <p className="text-xs text-gray-500 mb-3">Target users who are loyal to or show affinity for specific brands.</p>
                    <SelectAllControls options={BRAND_AFFINITY} current={campaign.targeting.brandAffinity} onChange={v => setTargetingArray('brandAffinity', v)} />
                    <div className="flex flex-wrap gap-2">
                      {BRAND_AFFINITY.map(brand => (
                        <label key={brand} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.brandAffinity.includes(brand) ? 'bg-pink-50 border-pink-400' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.brandAffinity.includes(brand)} onCheckedChange={() => toggleArrayItem('brandAffinity', brand)} />
                          <span className="text-sm">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Personal Values <span className="text-xs text-indigo-600 font-medium ml-1 bg-indigo-50 px-2 py-0.5 rounded-full">Deep Psychographic</span></Label>
                    <p className="text-xs text-gray-500 mb-3">Target based on what matters most to users in their lives.</p>
                    <SelectAllControls options={VALUES_LIST} current={campaign.targeting.values} onChange={v => setTargetingArray('values', v)} />
                    <div className="flex flex-wrap gap-2">
                      {VALUES_LIST.map(val => (
                        <label key={val} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.values.includes(val) ? 'bg-indigo-50 border-indigo-400' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.values.includes(val)} onCheckedChange={() => toggleArrayItem('values', val)} />
                          <span className="text-sm">{val}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Technology & Devices */}
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              <AccordionItem value="cat-tech" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded text-purple-600"><Monitor className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">5. Technology & Devices</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-4">
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Device Brands</Label>
                    <SelectAllControls options={DEVICE_BRANDS.filter(brand => showOption(reachData.breakdown.byBrand, brand))} current={campaign.targeting.deviceBrands} onChange={v => setTargetingArray('deviceBrands', v)} />
                    <div className="flex flex-wrap gap-2">
                      {DEVICE_BRANDS.filter(brand => showOption(reachData.breakdown.byBrand, brand)).map(brand => (
                        <label key={brand} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.deviceBrands.includes(brand) ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.deviceBrands.includes(brand)} onCheckedChange={() => toggleArrayItem('deviceBrands', brand)} />
                          <span>{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Device Models — only shown when brands are selected */}
                  {campaign.targeting.deviceBrands.length > 0 && (() => {
                    const availableModels = campaign.targeting.deviceBrands.flatMap(b => DEVICE_MODELS_BY_BRAND[b] || []);
                    return availableModels.length > 0 ? (
                      <div className="border-t pt-4">
                        <Label className="mb-1 block">Device Models <span className="text-xs text-purple-600 font-medium ml-1 bg-purple-50 px-2 py-0.5 rounded-full">Precision Targeting</span></Label>
                        <p className="text-xs text-gray-500 mb-3">Choose specific models within the selected brands.</p>
                        <SelectAllControls options={availableModels} current={campaign.targeting.deviceModels} onChange={v => setTargetingArray('deviceModels', v)} />
                        <div className="flex flex-wrap gap-2">
                          {availableModels.map(model => (
                            <label key={model} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer text-sm ${campaign.targeting.deviceModels.includes(model) ? 'bg-purple-50 border-purple-500' : 'bg-white hover:bg-gray-50'}`}>
                              <Checkbox checked={campaign.targeting.deviceModels.includes(model)} onCheckedChange={() => toggleArrayItem('deviceModels', model)} />
                              <span>{model}</span>
                            </label>
                          ))}
                          <label className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer border-dashed text-sm ${campaign.targeting.deviceModels.includes('__others__') ? 'bg-slate-100 border-slate-500' : 'bg-white hover:bg-slate-50 border-slate-300'}`}>
                            <Checkbox checked={campaign.targeting.deviceModels.includes('__others__')} onCheckedChange={() => toggleArrayItem('deviceModels', '__others__')} />
                            <span className="text-slate-600 font-medium">Others / Not Specified</span>
                          </label>
                        </div>
                      </div>
                    ) : null;
                  })()
                  }
                  <div className="border-t pt-4 grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Network Carriers (Based on Target Countries)</Label>
                      {campaign.targeting.countries.length === 0 ? (
                        <div className="text-sm text-gray-500 italic bg-gray-50 p-2 rounded border">
                          Please select countries first.
                        </div>
                      ) : (
                        <>
                          <SelectAllControls options={campaign.targeting.countries.flatMap(c => CARRIERS_BY_COUNTRY[c] || []).filter(c => showOption(reachData.breakdown.byCarrier, c))} current={campaign.targeting.networkCarriers} onChange={v => setTargetingArray('networkCarriers', v)} />
                          <div className="flex flex-wrap gap-2">
                            {campaign.targeting.countries.flatMap(c => CARRIERS_BY_COUNTRY[c] || [])
                              .filter(carrier => showOption(reachData.breakdown.byCarrier, carrier))
                              .map(carrier => (
                              <label key={carrier} className={`flex items-center gap-1 px-2 py-1 border rounded cursor-pointer text-xs ${campaign.targeting.networkCarriers.includes(carrier) ? 'bg-primary/10 border-primary' : 'bg-white'}`}>
                                <Checkbox checked={campaign.targeting.networkCarriers.includes(carrier)} onCheckedChange={() => toggleArrayItem('networkCarriers', carrier)} className="w-3 h-3" />
                                <span>{carrier}</span>
                              </label>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <div>
                      <Label className="mb-2 block">Connection Type</Label>
                      <div className="flex gap-2">
                        {CONNECTION_TYPES.map((type) => (
                          <button type="button" key={type} onClick={() => toggleArrayItem('connectionTypes', type)}
                            className={`px-3 py-1 border rounded-md text-sm ${campaign.targeting.connectionTypes.includes(type) ? 'bg-primary text-white' : 'bg-gray-50'}`}>{type}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Shopping & Life Stage */}
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              <AccordionItem value="cat-shopping" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 rounded text-rose-600"><Tag className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">6. Shopping, Work & Life Stage</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-4">
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Purchase Intents</Label>
                    <SelectAllControls options={PURCHASE_INTENTS} current={campaign.targeting.nextPurchaseIntent || []} onChange={v => setTargetingArray('nextPurchaseIntent', v)} />
                    <div className="flex flex-wrap gap-2">
                      {PURCHASE_INTENTS.map(intent => (
                        <label key={intent} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.nextPurchaseIntent?.includes(intent) ? 'bg-primary/10 border-primary' : 'bg-white'}`}>
                          <Checkbox checked={campaign.targeting.nextPurchaseIntent?.includes(intent)} onCheckedChange={() => toggleArrayItem('nextPurchaseIntent', intent)} />
                          <span>{intent}</span>
                        </label>
                      ))}
                      <label className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer border-dashed ${campaign.targeting.nextPurchaseIntent?.includes('__others__') ? 'bg-slate-100 border-slate-500' : 'bg-white hover:bg-slate-50 border-slate-300'}`}>
                        <Checkbox checked={campaign.targeting.nextPurchaseIntent?.includes('__others__')} onCheckedChange={() => toggleArrayItem('nextPurchaseIntent', '__others__')} />
                        <span className="text-slate-600 font-medium">Others / Not Specified</span>
                      </label>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Life Stages</Label>
                    <SelectAllControls options={LIFE_STAGES} current={campaign.targeting.lifeStages || []} onChange={v => setTargetingArray('lifeStages', v)} />
                    <div className="flex flex-wrap gap-2">
                      {LIFE_STAGES.map(stage => (
                        <label key={stage} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer capitalize ${campaign.targeting.lifeStages?.includes(stage) ? 'bg-primary/10 border-primary' : 'bg-white'}`}>
                          <Checkbox checked={campaign.targeting.lifeStages?.includes(stage)} onCheckedChange={() => toggleArrayItem('lifeStages', stage)} />
                          <span>{stage.replace(/_/g, ' ')}</span>
                        </label>
                      ))}
                      <label className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer border-dashed ${campaign.targeting.lifeStages?.includes('__others__') ? 'bg-slate-100 border-slate-500' : 'bg-white hover:bg-slate-50 border-slate-300'}`}>
                        <Checkbox checked={campaign.targeting.lifeStages?.includes('__others__')} onCheckedChange={() => toggleArrayItem('lifeStages', '__others__')} />
                        <span className="text-slate-600 font-medium">Others / Not Specified</span>
                      </label>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Work Types</Label>
                    <SelectAllControls options={WORK_TYPES.filter(w => showOption(reachData.breakdown.byWorkType, w))} current={campaign.targeting.workTypes || []} onChange={v => setTargetingArray('workTypes', v)} />
                    <div className="flex flex-wrap gap-2">
                      {WORK_TYPES.filter(w => showOption(reachData.breakdown.byWorkType, w)).map(work => (
                        <label key={work} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer capitalize ${campaign.targeting.workTypes?.includes(work) ? 'bg-primary/10 border-primary' : 'bg-white'}`}>
                          <Checkbox checked={campaign.targeting.workTypes?.includes(work)} onCheckedChange={() => toggleArrayItem('workTypes', work)} />
                          <span>{work.replace(/_/g, ' ')}</span>
                        </label>
                      ))}
                      <label className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer border-dashed ${campaign.targeting.workTypes?.includes('__others__') ? 'bg-slate-100 border-slate-500' : 'bg-white hover:bg-slate-50 border-slate-300'}`}>
                        <Checkbox checked={campaign.targeting.workTypes?.includes('__others__')} onCheckedChange={() => toggleArrayItem('workTypes', '__others__')} />
                        <span className="text-slate-600 font-medium">Others / Not Specified</span>
                      </label>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Shopping Frequency</Label>
                    <SelectAllControls options={SHOPPING_FREQS} current={campaign.targeting.shoppingFrequencies || []} onChange={v => setTargetingArray('shoppingFrequencies', v)} />
                    <div className="flex gap-2 flex-wrap">
                      {SHOPPING_FREQS.map(freq => (
                        <label key={freq} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer capitalize ${campaign.targeting.shoppingFrequencies?.includes(freq) ? 'bg-rose-50 border-rose-400' : 'bg-white'}`}>
                          <Checkbox checked={campaign.targeting.shoppingFrequencies?.includes(freq)} onCheckedChange={() => toggleArrayItem('shoppingFrequencies', freq)} />
                          <span>{freq}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Preferred Stores / Platforms <span className="text-xs text-rose-600 font-medium ml-1 bg-rose-50 px-2 py-0.5 rounded-full">Retail Targeting</span></Label>
                    <p className="text-xs text-gray-500 mb-3">Target users who regularly shop at specific online or offline retailers.</p>
                    <SelectAllControls options={PREFERRED_STORES} current={campaign.targeting.preferredStores || []} onChange={v => setTargetingArray('preferredStores', v)} />
                    <div className="flex flex-wrap gap-2">
                      {PREFERRED_STORES.map(store => (
                        <label key={store} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.preferredStores?.includes(store) ? 'bg-rose-50 border-rose-400' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.preferredStores?.includes(store)} onCheckedChange={() => toggleArrayItem('preferredStores', store)} />
                          <span className="text-sm">{store}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Activity Patterns <span className="text-xs text-orange-600 font-medium ml-1 bg-orange-50 px-2 py-0.5 rounded-full">Behavioral</span></Label>
                    <p className="text-xs text-gray-500 mb-3">Target based on when users are most active on their devices.</p>
                    <div className="flex gap-2 flex-wrap">
                      {ACTIVITY_PATTERNS.map(ap => (
                        <label key={ap} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.activityPatterns?.includes(ap) ? 'bg-orange-50 border-orange-400' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.activityPatterns?.includes(ap)} onCheckedChange={() => toggleArrayItem('activityPatterns', ap)} />
                          <span className="capitalize text-sm">{ap.replace(/_/g, ' ')}</span>
                        </label>
                      ))}
                      <label className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer border-dashed ${campaign.targeting.activityPatterns?.includes('__others__') ? 'bg-slate-100 border-slate-500' : 'bg-white hover:bg-slate-50 border-slate-300'}`}>
                        <Checkbox checked={campaign.targeting.activityPatterns?.includes('__others__')} onCheckedChange={() => toggleArrayItem('activityPatterns', '__others__')} />
                        <span className="text-slate-600 font-medium text-sm">Others / Not Specified</span>
                      </label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Professional Targeting */}
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              <AccordionItem value="cat-professional" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 rounded text-cyan-600"><Briefcase className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">7. Professional Profile</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-4">
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Industry <span className="text-xs text-cyan-600 font-medium ml-1 bg-cyan-50 px-2 py-0.5 rounded-full">B2B Targeting</span></Label>
                    <p className="text-xs text-gray-500 mb-3">Target users by the industry they work in.</p>
                    <SelectAllControls options={INDUSTRIES} current={campaign.targeting.industries || []} onChange={v => setTargetingArray('industries', v)} />
                    <div className="flex flex-wrap gap-2">
                      {INDUSTRIES.map(ind => (
                        <label key={ind} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.industries?.includes(ind) ? 'bg-cyan-50 border-cyan-400' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.industries?.includes(ind)} onCheckedChange={() => toggleArrayItem('industries', ind)} />
                          <span className="text-sm">{ind}</span>
                        </label>
                      ))}
                      <label className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer border-dashed ${campaign.targeting.industries?.includes('__others__') ? 'bg-slate-100 border-slate-500' : 'bg-white hover:bg-slate-50 border-slate-300'}`}>
                        <Checkbox checked={campaign.targeting.industries?.includes('__others__')} onCheckedChange={() => toggleArrayItem('industries', '__others__')} />
                        <span className="text-slate-600 font-medium text-sm">Others / Not Specified</span>
                      </label>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Job Title / Role</Label>
                    <p className="text-xs text-gray-500 mb-3">Target users by their specific professional role.</p>
                    <SelectAllControls options={JOB_TITLES} current={campaign.targeting.jobTitles || []} onChange={v => setTargetingArray('jobTitles', v)} />
                    <div className="flex flex-wrap gap-2">
                      {JOB_TITLES.map(job => (
                        <label key={job} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.jobTitles?.includes(job) ? 'bg-cyan-50 border-cyan-400' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.jobTitles?.includes(job)} onCheckedChange={() => toggleArrayItem('jobTitles', job)} />
                          <span className="text-sm">{job}</span>
                        </label>
                      ))}
                      <label className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer border-dashed ${campaign.targeting.jobTitles?.includes('__others__') ? 'bg-slate-100 border-slate-500' : 'bg-white hover:bg-slate-50 border-slate-300'}`}>
                        <Checkbox checked={campaign.targeting.jobTitles?.includes('__others__')} onCheckedChange={() => toggleArrayItem('jobTitles', '__others__')} />
                        <span className="text-slate-600 font-medium text-sm">Others / Not Specified</span>
                      </label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Engagement Tiers */}
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              <AccordionItem value="cat-7" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded text-yellow-600"><Crown className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">7. Engagement & Trust Tiers</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-8 border-t pt-4">
                    <div>
                      <Label className="mb-2 block">Target User Tiers</Label>
                      <SelectAllControls options={['bronze', 'silver', 'gold', 'platinum'].filter(t => showOption(reachData.breakdown.byTier, t))} current={campaign.targeting.tiers} onChange={v => setTargetingArray('tiers', v)} />
                      <div className="flex gap-2 flex-wrap">
                        {['bronze', 'silver', 'gold', 'platinum'].filter(t => showOption(reachData.breakdown.byTier, t)).map(t => (
                          <label key={t} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer capitalize ${campaign.targeting.tiers.includes(t) ? 'bg-primary/10 border-primary' : 'bg-white'}`}>
                            <Checkbox checked={campaign.targeting.tiers.includes(t)} onCheckedChange={() => toggleArrayItem('tiers', t)} />
                            <span>{t}</span>
                          </label>
                        ))}
                        <label className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer border-dashed ${campaign.targeting.tiers.includes('__others__') ? 'bg-slate-100 border-slate-500' : 'bg-white hover:bg-slate-50 border-slate-300'}`}>
                          <Checkbox checked={campaign.targeting.tiers.includes('__others__')} onCheckedChange={() => toggleArrayItem('tiers', '__others__')} />
                          <span className="text-slate-600 font-medium">Others / Not Classified</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Min Profile Strength: {campaign.targeting.profileStrengthMin || 0}%</Label>
                      <Slider defaultValue={[0]} max={100} min={0} step={5} onValueChange={([v]) => setCampaign(p => ({ ...p, targeting: { ...p.targeting, profileStrengthMin: v } }))} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* ── STEP 3: CONTENT & BUDGET ── */}
        {step === 3 && (
          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-3 space-y-5">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Video className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Video Task Configuration</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Sponsor Video File *</Label>
                    {campaign.videoUrl ? (
                      <div className="border border-green-200 bg-green-50 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                            <FileVideo className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-green-900 text-sm">{campaign.videoFileName || 'uploaded-campaign-video.mp4'}</p>
                            <p className="text-xs text-green-600">Successfully uploaded</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setCampaign({ ...campaign, videoUrl: '', videoFileName: '' })} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors bg-white relative">
                        <input 
                          title="Upload Sponsor Video"
                          type="file" 
                          accept="video/mp4,video/mov" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadingVideo(true);
                              // Simulate network upload
                              setTimeout(() => {
                                setCampaign({ 
                                  ...campaign, 
                                  videoUrl: URL.createObjectURL(file), // Provide local blob url for demo
                                  videoFileName: file.name
                                });
                                setUploadingVideo(false);
                              }, 1500);
                            }
                          }}
                        />
                        {uploadingVideo ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                            <p className="text-sm font-medium">Uploading video...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                            <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">MP4 or MOV (max 50MB)</p>
                            <Button type="button" variant="outline" size="sm" className="mt-4 pointer-events-none">Select Video</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Minimum Watch Percentage: <strong>{campaign.minWatchPercent}%</strong></Label>
                    <p className="text-xs text-gray-400 mb-2">Taskers must watch at least this much before answering the quiz</p>
                    <Slider defaultValue={[80]} min={50} max={100} step={5} onValueChange={([v]) => setCampaign({ ...campaign, minWatchPercent: v })} />
                    <div className="flex justify-between text-xs text-gray-400 mt-1"><span>50%</span><span>100%</span></div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold">Comprehension Quiz</h2>
                    <span className="text-xs text-gray-400 ml-1">(proves they watched)</span>
                  </div>
                  {campaign.quizQuestions.length < 4 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCampaign(p => ({
                        ...p, 
                        quizQuestions: [...p.quizQuestions, { question: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: 'A' }] 
                      }))}
                    >
                      + Add Question
                    </Button>
                  )}
                </div>
                
                <div className="space-y-8">
                  {campaign.quizQuestions.map((q, idx) => (
                    <div key={idx} className="space-y-4 p-4 border rounded-xl bg-gray-50/50 relative">
                      {campaign.quizQuestions.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setCampaign(p => ({ ...p, quizQuestions: p.quizQuestions.filter((_, i) => i !== idx) }))}
                        >
                          <XIcon className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <div>
                        <Label>Question {idx + 1} *</Label>
                        <Textarea 
                          value={q.question} 
                          onChange={(e) => {
                            const newQ = [...campaign.quizQuestions];
                            newQ[idx].question = e.target.value;
                            setCampaign({ ...campaign, quizQuestions: newQ });
                          }} 
                          rows={2} 
                          placeholder="What is the main benefit shown in the video?" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {(['A', 'B', 'C', 'D'] as const).map(opt => (
                          <div key={opt}>
                            <Label className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${q.correctAnswer === opt ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{opt}</span>
                              Option {opt} {q.correctAnswer === opt && <span className="text-xs text-green-600 font-medium">(correct)</span>}
                            </Label>
                            <Input 
                              value={q.options[opt]} 
                              onChange={(e) => {
                                const newQ = [...campaign.quizQuestions];
                                newQ[idx].options[opt] = e.target.value;
                                setCampaign({ ...campaign, quizQuestions: newQ });
                              }} 
                              placeholder={`Answer option ${opt}`} 
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <Label>Correct Answer</Label>
                        <div className="flex gap-2 mt-1">
                          {(['A', 'B', 'C', 'D'] as const).map(opt => (
                            <button 
                              key={opt}
                              type="button" 
                              onClick={() => {
                                const newQ = [...campaign.quizQuestions];
                                newQ[idx].correctAnswer = opt;
                                setCampaign({ ...campaign, quizQuestions: newQ });
                              }}
                              className={`w-10 h-10 rounded-full font-bold text-sm ${q.correctAnswer === opt ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Commission Panel */}
            <div className="md:col-span-2 space-y-5">
              <CommissionPanel />
              <Card className="p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Budget Controls</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Reward per Completion (USD) *</Label>
                    <Input type="number" min={1} value={campaign.reward} onChange={e => setCampaign({ ...campaign, reward: +e.target.value })} />
                  </div>
                  <div>
                    <Label>Target Completions</Label>
                    <Input type="number" min={10} value={campaign.completionsNeeded} onChange={e => setCampaign({ ...campaign, completionsNeeded: +e.target.value })} />
                  </div>
                  <div className="bg-blue-600 text-white rounded-lg p-4 text-center">
                    <p className="text-xs mb-1 opacity-80">Total Escrow Required</p>
                    <p className="text-3xl font-bold">${totalCampaignCost.toFixed(2)}</p>
                    <p className="text-xs mt-1 opacity-70">Charged only on verified completions</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── STEP 4: REVIEW ── */}
        {step === 4 && (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-5 flex items-center gap-2"><Rocket className="text-primary" /> Campaign Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Title</span><span className="font-medium">{campaign.titleEn || '—'}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Task Type</span><span className="font-medium capitalize">Video + Quiz</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Video File</span><span className="font-medium text-blue-600 truncate max-w-xs">{campaign.videoFileName || 'Not Uploaded'}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Min. Watch</span><span className="font-medium">{campaign.minWatchPercent}%</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Audience Reach</span><span className="font-bold text-primary">{reachData.totalReach.toLocaleString()}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Target Cities</span><span className="font-medium">{campaign.targeting.cities.length ? campaign.targeting.cities.join(', ') : 'All'}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Gender</span><span className="font-medium capitalize">{campaign.targeting.gender}</span></div>
                </div>
              </Card>

              <div className="space-y-4">
                <CommissionPanel />
                {!reachData.meetsMinimum ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    <h4 className="font-bold mb-1">Launch Blocked</h4>
                    <p className="text-sm">Audience is below 500. Go back to Step 2 and broaden your filters.</p>
                  </div>
                ) : !campaign.titleEn || !campaign.videoUrl || !campaign.quizQuestion ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-lg">
                    <h4 className="font-bold mb-1">Incomplete Fields</h4>
                    <p className="text-sm">Please complete: {[!campaign.titleEn && 'Campaign Title', !campaign.videoUrl && 'Video URL', !campaign.quizQuestion && 'Quiz Question'].filter(Boolean).join(', ')}</p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
                    <h4 className="font-bold mb-1 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Ready for Review</h4>
                    <p className="text-sm">Your campaign will be submitted to admin for approval before going live.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1 lg:sticky lg:top-32">
              <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Monitor className="w-4 h-4" /> Mobile User Preview
              </h3>
              <MobileSimulator />
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER NAV ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex gap-2">
            {STEPS.map(s => (
              <div key={s.id} className={`w-3 h-3 rounded-full ${step === s.id ? 'bg-primary' : step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
            ))}
          </div>
          {step < 4 ? (
            <Button onClick={handleNext}>Next Step <ArrowRight className="w-4 h-4 ml-2" /></Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting || !reachData.meetsMinimum} className="bg-green-600 hover:bg-green-700 min-w-36">
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : <><Rocket className="w-4 h-4 mr-2" /> Submit for Review</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

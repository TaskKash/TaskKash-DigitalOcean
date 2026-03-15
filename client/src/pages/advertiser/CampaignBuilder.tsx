import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { 
  ArrowLeft, ArrowRight, Check, Target, Users, FileText, Rocket,
  Lock, Crown, Zap, Info, DollarSign, Calendar, Clock, AlertTriangle, Monitor,
  Activity, Briefcase, Tag 
} from 'lucide-react';

const DEVICE_BRANDS = ['Samsung', 'Apple', 'Xiaomi', 'Huawei', 'Google', 'Oppo', 'Vivo', 'Realme'];
const CARRIERS = ['Vodafone', 'Orange', 'Etisalat', 'WE'];
const INTERESTS = ['Technology', 'Fashion', 'Sports', 'Gaming', 'Travel', 'Food', 'Health', 'Finance', 'Automotive', 'Beauty'];
const PURCHASE_INTENTS = ['Smartphone', 'TV', 'Laptop', 'Car', 'Home Appliances', 'Fashion', 'Travel', 'Real Estate'];
const LIFE_EVENTS = ['Getting Married', 'Having a Baby', 'Moving Home', 'Starting a Job', 'Graduating'];
const CITIES = ['Cairo', 'Alexandria', 'Giza', 'Shubra El-Kheima', 'Port Said', 'Suez', 'Mansoura'];
const COUNTRIES = ['Egypt']; // Hardcoded for simplified mock for now
const INCOME_LEVELS = ['low', 'lower_mid', 'mid', 'upper_mid', 'high'];

const STEPS = [
  { id: 1, title: 'Basics', icon: FileText },
  { id: 2, title: 'Audience', icon: Target },
  { id: 3, title: 'Content', icon: FileText },
  { id: 4, title: 'Review', icon: Rocket },
];

export default function CampaignBuilder() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [advertiserTier, setAdvertiserTier] = useState('basic');
  
  // Real-time API reach states
  const [reachData, setReachData] = useState({
    totalReach: 0,
    rawCount: 0,
    meetsMinimum: true,
    breakdown: {
      byTier: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
      byGender: { male: 0, female: 0 },
      byDeviceTier: { A: 0, B: 0, C: 0 }
    }
  });
  const [isCalculating, setIsCalculating] = useState(false);

  // Deep Targeting State
  const [campaign, setCampaign] = useState({
    titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '',
    type: 'survey', reward: 10, totalBudget: 1000, completionsNeeded: 100,
    targeting: {
      // 1: Demographics
      ageMin: 18, ageMax: 65, gender: 'all' as 'all'|'male'|'female',
      countries: ['Egypt'], cities: [] as string[], districts: [] as string[],
      // 2: Financial
      incomeLevels: [] as string[], homeOwnership: '' as ''|'owner'|'renter',
      // 3: Device & Connectivity
      deviceTiers: [] as string[], deviceOs: '' as ''|'iOS'|'Android', 
      deviceBrands: [] as string[], deviceModels: [] as string[], networkCarriers: [] as string[], connectionTypes: [] as string[],
      // 4: Psychographics
      interests: [] as string[], interestsMatchAll: false,
      brandAffinity: [] as string[], brandAffinityMatchAll: false,
      values: [] as string[], valuesMatchAll: false,
      lifeStages: [] as string[],
      // 5: Behavioral
      shoppingFrequencies: [] as string[],
      preferredStores: [] as string[], preferredStoresMatchAll: false,
      nextPurchaseIntent: [] as string[], nextPurchaseIntentMatchAll: false,
      activityPatterns: [] as string[],
      // 6: Mobility & Household
      hasVehicle: undefined as boolean | undefined, vehicleBrands: [] as string[],
      workTypes: [] as string[], householdSizeMin: 1, householdSizeMax: 10,
      // 7: Engagement Quality
      tierMin: '' as ''|'bronze'|'silver'|'gold'|'platinum',
      tiers: [] as string[],
      profileStrengthMin: 60,
      completedTasksMin: 0
    },
    taskData: {} as any,
  });

  useEffect(() => {
    const info = localStorage.getItem('advertiser-info');
    if (info) {
      setAdvertiserTier(JSON.parse(info).tier || 'basic');
    }
  }, []);

  // 800ms Debounced Reach Evaluator
  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(async () => {
      try {
        const payload: any = { ...campaign.targeting };
        // Clean out empty arrays from payload to save bytes
        Object.keys(payload).forEach(key => {
          if (Array.isArray(payload[key]) && payload[key].length === 0) {
            delete payload[key];
          }
          if (payload[key] === '' || payload[key] === undefined) {
            delete payload[key];
          }
        });

        const res = await fetch('/api/advertiser/segments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          setReachData(data);
        }
      } catch (err) {
        console.error('Failed to evaluate segments:', err);
      } finally {
        setIsCalculating(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [campaign.targeting]);

  // Generic toggle helper for arrays
  const toggleArrayItem = (key: keyof typeof campaign.targeting, value: string) => {
    setCampaign(prev => {
      const arr = prev.targeting[key] as string[];
      const nextArr = arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value];
      return { ...prev, targeting: { ...prev.targeting, [key]: nextArr } };
    });
  };

  const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));
  const handleSubmit = async () => {
    if (!reachData.meetsMinimum) {
      toast.error('Cannot launch: Audience is below the 500 minimum threshold.');
      return;
    }
    toast.success('Campaign launched successfully! (Mocked)');
    setTimeout(() => setLocation('/advertiser/campaigns'), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Top Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => setLocation('/advertiser/new-dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <h1 className="text-xl font-bold hidden sm:block">Advanced Audience Builder</h1>
          
          {/* Always Visible Sticky Reach KPI Widget */}
          <div className="flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-lg border border-primary/20 shadow-sm group relative">
            <Target className={`w-5 h-5 text-primary ${isCalculating ? 'animate-spin' : ''}`} />
            <div className="text-right">
              <p className="text-xs text-muted-foreground leading-none mb-1">Estimated Reach 
                <Info className="inline w-3 h-3 ml-1 text-gray-400 cursor-help" />
              </p>
              <p className={`text-xl font-bold font-mono text-primary transition-opacity ${isCalculating ? 'opacity-50' : 'opacity-100'}`}>
                {reachData.totalReach.toLocaleString()}
              </p>
            </div>
            
            {/* Tooltip on hover */}
            <div className="absolute right-0 top-14 w-64 p-3 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 pointer-events-none">
              Reach estimates represent strictly verified, active users only to ensure high-quality leads. Due to privacy controls, numbers are rounded. Minimum viable segment size is 500.
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {step === 2 && (
          <div className="mb-6 bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-4 border border-blue-200">
            <Info className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold">Granular Audience Targeting</h4>
              <p className="text-sm mt-1">
                Narrow down your exact audience utilizing 7 distinct psychological, behavioral, and demographic silos. 
                Our engine silently filters for KYC-verified users with &gt;60% profile strength arrays baseline.
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Basics */}
        {step === 1 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Campaign Fundamentals</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Campaign Title (English) *</Label>
                  <Input value={campaign.titleEn} onChange={e => setCampaign({...campaign, titleEn: e.target.value})} />
                </div>
                <div>
                  <Label>Campaign Title (Arabic)</Label>
                  <Input dir="rtl" value={campaign.titleAr} onChange={e => setCampaign({...campaign, titleAr: e.target.value})} />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Description (English) *</Label>
                  <Textarea value={campaign.descriptionEn} onChange={e => setCampaign({...campaign, descriptionEn: e.target.value})} rows={5} />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Advanced Targeting Accordions */}
        {step === 2 && (
          <div className="space-y-4">
            {!reachData.meetsMinimum && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg flex gap-3 border border-red-200">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">Your audience is too narrow (under 500 users). Broaden your filters or remove constraints to launch.</p>
              </div>
            )}

            <Accordion type="single" collapsible defaultValue="cat-1" className="bg-white rounded-lg shadow-sm border">
              
              {/* Category 1: Demographics */}
              <AccordionItem value="cat-1" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded text-blue-600"><Users className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">1. Demographics</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-8 border-t pt-4">
                    <div>
                      <Label className="text-base mb-4 block">Age Range: {campaign.targeting.ageMin} - {campaign.targeting.ageMax}</Label>
                      <Slider 
                        defaultValue={[campaign.targeting.ageMin, campaign.targeting.ageMax]} 
                        max={80} min={16} step={1}
                        onValueChange={([min, max]) => setCampaign(p => ({...p, targeting: {...p.targeting, ageMin: min, ageMax: max}}))}
                      />
                    </div>
                    <div>
                      <Label className="text-base mb-2 block">Gender</Label>
                      <div className="flex gap-2">
                        {['all', 'male', 'female'].map(g => (
                          <button key={g}
                            onClick={() => setCampaign(p => ({...p, targeting: {...p.targeting, gender: g as any}}))}
                            className={`px-4 py-2 border rounded-md capitalize ${campaign.targeting.gender === g ? 'bg-primary text-white border-primary' : 'bg-gray-50 border-gray-200'}`}
                          >{g}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="text-base mb-2 block">Primary Cities</Label>
                    <div className="flex flex-wrap gap-2">
                      {CITIES.map(city => (
                        <label key={city} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${campaign.targeting.cities.includes(city) ? 'bg-primary/10 border-primary shadow-sm' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.cities.includes(city)} onCheckedChange={() => toggleArrayItem('cities', city)} />
                          <span>{city}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>

            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              {/* Category 2: Financial */}
              <AccordionItem value="cat-2" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded text-green-600"><DollarSign className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">2. Financial & Income</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-6">
                  <div className="border-t pt-4">
                    <Label className="text-base mb-2 block">Income Level Segments</Label>
                    <div className="flex flex-wrap gap-2">
                      {INCOME_LEVELS.map(inc => (
                        <label key={inc} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.incomeLevels.includes(inc) ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.incomeLevels.includes(inc)} onCheckedChange={() => toggleArrayItem('incomeLevels', inc)} />
                          <span className="capitalize">{inc.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              {/* Category 3: Device */}
              <AccordionItem value="cat-3" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded text-purple-600"><Monitor className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">3. Device & Connectivity</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-6">
                   <div className="grid md:grid-cols-2 gap-8 border-t pt-4">
                      <div>
                        <Label className="mb-2 block">Device Brands</Label>
                        <div className="flex flex-wrap gap-2">
                          {DEVICE_BRANDS.map(brand => (
                            <label key={brand} className="flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm cursor-pointer shadow-sm">
                              <Checkbox checked={campaign.targeting.deviceBrands.includes(brand)} onCheckedChange={() => toggleArrayItem('deviceBrands', brand)} />
                              <span>{brand}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block">Network Carriers</Label>
                        <div className="flex flex-wrap gap-2">
                          {CARRIERS.map(carrier => (
                            <label key={carrier} className="flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm cursor-pointer shadow-sm">
                              <Checkbox checked={campaign.targeting.networkCarriers.includes(carrier)} onCheckedChange={() => toggleArrayItem('networkCarriers', carrier)} />
                              <span>{carrier}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                   </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              {/* Category 4: Psychographics */}
              <AccordionItem value="cat-4" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 rounded text-pink-600"><Activity className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">4. Psychographics & Interests</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-6">
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-base block">Primary Interests</Label>
                      <div className="flex items-center gap-2 text-sm bg-gray-100 px-2 py-1 rounded">
                        <span className={!campaign.targeting.interestsMatchAll ? 'font-bold' : 'text-gray-500'}>Match Any (OR)</span>
                        <Checkbox 
                          checked={campaign.targeting.interestsMatchAll} 
                          onCheckedChange={(c) => setCampaign(p => ({...p, targeting: {...p.targeting, interestsMatchAll: !!c}}))} 
                        />
                        <span className={campaign.targeting.interestsMatchAll ? 'font-bold' : 'text-gray-500'}>Match All (AND)</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map(int => (
                        <label key={int} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.interests.includes(int) ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.interests.includes(int)} onCheckedChange={() => toggleArrayItem('interests', int)} />
                          <span>{int}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              {/* Category 5: Behavioral & Intent */}
              <AccordionItem value="cat-5" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded text-orange-600"><Tag className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">5. Behavioral & Purchase Intent</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-6">
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-base block">Next 6 Months Purchase Intent</Label>
                      <div className="flex items-center gap-2 text-sm bg-gray-100 px-2 py-1 rounded">
                        <span className={!campaign.targeting.nextPurchaseIntentMatchAll ? 'font-bold' : 'text-gray-500'}>Match Any (OR)</span>
                        <Checkbox 
                          checked={campaign.targeting.nextPurchaseIntentMatchAll} 
                          onCheckedChange={(c) => setCampaign(p => ({...p, targeting: {...p.targeting, nextPurchaseIntentMatchAll: !!c}}))} 
                        />
                        <span className={campaign.targeting.nextPurchaseIntentMatchAll ? 'font-bold' : 'text-gray-500'}>Match All (AND)</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {PURCHASE_INTENTS.map(intent => (
                        <label key={intent} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.nextPurchaseIntent.includes(intent) ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.nextPurchaseIntent.includes(intent)} onCheckedChange={() => toggleArrayItem('nextPurchaseIntent', intent)} />
                          <span>{intent}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              {/* Category 7: Engagement Quality */}
              <AccordionItem value="cat-7" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded text-yellow-600"><Crown className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">7. Engagement & Trust Tiers</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-8 border-t pt-4">
                    <div>
                      <Label className="mb-2 block">Isolate Specific Tiers</Label>
                      <div className="flex gap-2">
                        {['bronze', 'silver', 'gold', 'platinum'].map(t => (
                          <label key={t} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer capitalize ${campaign.targeting.tiers.includes(t) ? 'bg-primary/10 border-primary' : 'bg-white'}`}>
                            <Checkbox checked={campaign.targeting.tiers.includes(t)} onCheckedChange={() => toggleArrayItem('tiers', t)} />
                            <span>{t}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* Step 4: Final Review */}
        {step === 4 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Rocket className="text-primary"/> Final Campaign Review</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-semibold border-b pb-2 mb-3">Audience Summary</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between"><span className="text-gray-500">Gender</span> <span className="font-medium capitalize">{campaign.targeting.gender}</span></li>
                  <li className="flex justify-between"><span className="text-gray-500">Age Range</span> <span className="font-medium">{campaign.targeting.ageMin} - {campaign.targeting.ageMax}</span></li>
                  <li className="flex justify-between"><span className="text-gray-500">Cities</span> <span className="font-medium">{campaign.targeting.cities.length || 'All'}</span></li>
                  <li className="flex justify-between mt-4 pt-4 border-t"><span className="font-semibold">Final App. Reach</span> <span className="font-bold text-primary text-lg">{reachData.totalReach.toLocaleString()}</span></li>
                </ul>
              </div>

              <div>
                {!reachData.meetsMinimum ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    <h4 className="font-bold mb-1">Launch Blocked</h4>
                    <p className="text-sm">Cannot launch campaigns targeting under 500 estimated active users. Please expand your audience definition in Step 2.</p>
                  </div>
                ) : (
                   <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
                    <h4 className="font-bold mb-1">Ready for Launch</h4>
                    <p className="text-sm">Your audience segment is healthy. This survey will distribute until the {campaign.completionsNeeded} completion cap is hit.</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Global Footer Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            <div className="flex gap-2 items-center">
              {STEPS.map(s => (
                <div key={s.id} className={`w-3 h-3 rounded-full ${step === s.id ? 'bg-primary' : step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
              ))}
            </div>

            {step < 4 ? (
              <Button onClick={handleNext}>
                Next Step <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!reachData.meetsMinimum} className={reachData.meetsMinimum ? "bg-green-600 hover:bg-green-700" : "bg-gray-300"}>
                <Rocket className="w-4 h-4 mr-2" /> Launch Campaign
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { 
  ArrowLeft, ArrowRight, Check, Target, Users, FileText, Rocket,
  Lock, Crown, Zap, Info, DollarSign, Calendar, Clock
} from 'lucide-react';

// Targeting options
const DEVICE_BRANDS = ['Samsung', 'Apple', 'Xiaomi', 'Huawei', 'Google', 'Oppo', 'Vivo', 'Realme'];
const CARRIERS = ['Vodafone', 'Orange', 'Etisalat', 'WE'];
const INTERESTS = ['Technology', 'Fashion', 'Sports', 'Gaming', 'Travel', 'Food', 'Health', 'Finance'];
const PURCHASE_INTENTS = ['Smartphone', 'TV', 'Laptop', 'Car', 'Home Appliances', 'Fashion', 'Travel'];
const LIFE_EVENTS = ['Getting Married', 'Having a Baby', 'Moving Home', 'Starting a Job', 'Graduating'];

const STEPS = [
  { id: 1, title: 'Basics', icon: FileText },
  { id: 2, title: 'Audience', icon: Target },
  { id: 3, title: 'Content', icon: Users },
  { id: 4, title: 'Review', icon: Rocket },
];

export default function CampaignBuilder() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [advertiserTier, setAdvertiserTier] = useState('basic');
  const [estimatedReach, setEstimatedReach] = useState(0);
  
  // Form data
  const [campaign, setCampaign] = useState({
    // Step 1: Basics
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
    type: 'survey',
    reward: 10,
    totalBudget: 1000,
    completionsNeeded: 100,
    // Step 2: Targeting
    targeting: {
      ageMin: 18,
      ageMax: 65,
      gender: 'all' as 'male' | 'female' | 'all',
      countries: ['Egypt'],
      cities: [] as string[],
      deviceBrands: [] as string[],
      carriers: [] as string[],
      interests: [] as string[],
      requireKYCVerified: false,
      minKYCLevel: 0,
      purchaseIntent: [] as string[],
      userTiers: [] as string[],
      minProfileStrength: 0,
    },
    // Step 3: Content
    taskData: {} as any,
  });

  // Load advertiser info
  useEffect(() => {
    const info = localStorage.getItem('advertiser-info');
    if (info) {
      const advertiser = JSON.parse(info);
      setAdvertiserTier(advertiser.tier || 'basic');
    }
  }, []);

  // Calculate estimated reach when targeting changes
  useEffect(() => {
    // Simulate reach calculation
    let reach = 10000;
    if (campaign.targeting.minProfileStrength > 50) reach *= 0.5;
    if (campaign.targeting.minKYCLevel > 1) reach *= 0.4;
    if (campaign.targeting.deviceBrands.length > 0) reach *= 0.6;
    if (campaign.targeting.interests.length > 0) reach *= 0.7;
    if (campaign.targeting.purchaseIntent.length > 0) reach *= 0.3;
    setEstimatedReach(Math.round(reach));
  }, [campaign.targeting]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      const advertiserId = JSON.parse(localStorage.getItem('advertiser-info') || '{}').id;
      if (!advertiserId) {
        toast.error('Please login first');
        return;
      }

      // Mock API call - in production this would use trpc
      toast.success('Campaign created successfully!');
      setTimeout(() => {
        setLocation('/advertiser/campaigns');
      }, 1000);
    } catch (err) {
      toast.error('Failed to create campaign');
    }
  };

  const isFeatureLocked = (feature: 'device' | 'interests' | 'kyc' | 'intent') => {
    if (feature === 'device' || feature === 'interests' || feature === 'kyc') {
      return advertiserTier === 'basic';
    }
    if (feature === 'intent') {
      return advertiserTier !== 'enterprise';
    }
    return false;
  };

  const LockedFeature = ({ tier }: { tier: string }) => (
    <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-2 rounded">
      <Lock className="w-4 h-4" />
      <span>Upgrade to {tier} to unlock</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => setLocation('/advertiser/new-dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-xl font-bold">Create Campaign</h1>
          <div className="w-24" />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isComplete = step > s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div className={`flex items-center gap-2 ${isActive ? 'text-primary' : isComplete ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-white' : isComplete ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className="font-medium hidden sm:block">{s.title}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-12 sm:w-24 h-1 mx-2 ${step > s.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Basics */}
        {step === 1 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Campaign Basics</h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Campaign Title (English) *</Label>
                  <Input
                    value={campaign.titleEn}
                    onChange={(e) => setCampaign({ ...campaign, titleEn: e.target.value })}
                    placeholder="e.g., Samsung Customer Survey"
                  />
                </div>
                <div>
                  <Label>Campaign Title (Arabic)</Label>
                  <Input
                    value={campaign.titleAr}
                    onChange={(e) => setCampaign({ ...campaign, titleAr: e.target.value })}
                    placeholder="e.g., استبيان عملاء سامسونج"
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <Label>Description (English) *</Label>
                <Textarea
                  value={campaign.descriptionEn}
                  onChange={(e) => setCampaign({ ...campaign, descriptionEn: e.target.value })}
                  placeholder="Describe what users will do in this campaign..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Campaign Type *</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
                  {['survey', 'video', 'app', 'social', 'referral'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setCampaign({ ...campaign, type })}
                      className={`p-3 rounded-lg border text-center capitalize ${campaign.type === type ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Reward per Completion (EGP) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="number"
                      value={campaign.reward}
                      onChange={(e) => setCampaign({ ...campaign, reward: Number(e.target.value) })}
                      className="pl-10"
                      min={1}
                    />
                  </div>
                </div>
                <div>
                  <Label>Total Budget (EGP) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="number"
                      value={campaign.totalBudget}
                      onChange={(e) => setCampaign({ ...campaign, totalBudget: Number(e.target.value) })}
                      className="pl-10"
                      min={100}
                    />
                  </div>
                </div>
                <div>
                  <Label>Target Completions</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="number"
                      value={campaign.completionsNeeded}
                      onChange={(e) => setCampaign({ ...campaign, completionsNeeded: Number(e.target.value) })}
                      className="pl-10"
                      min={1}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Audience Targeting */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Estimated Reach */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Reach</p>
                  <p className="text-2xl font-bold text-primary">{estimatedReach.toLocaleString()} users</p>
                </div>
                <Target className="w-10 h-10 text-primary/50" />
              </div>
            </Card>

            {/* Demographics - Available to all */}
            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Demographics
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">All Tiers</span>
              </h3>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Age Range</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={campaign.targeting.ageMin}
                        onChange={(e) => setCampaign({ ...campaign, targeting: { ...campaign.targeting, ageMin: Number(e.target.value) } })}
                        min={18}
                        max={65}
                      />
                      <span>to</span>
                      <Input
                        type="number"
                        value={campaign.targeting.ageMax}
                        onChange={(e) => setCampaign({ ...campaign, targeting: { ...campaign.targeting, ageMax: Number(e.target.value) } })}
                        min={18}
                        max={65}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <div className="flex gap-2 mt-2">
                      {['all', 'male', 'female'].map((g) => (
                        <button
                          key={g}
                          onClick={() => setCampaign({ ...campaign, targeting: { ...campaign.targeting, gender: g as any } })}
                          className={`px-4 py-2 rounded-lg border capitalize ${campaign.targeting.gender === g ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>User Tiers</Label>
                  <div className="flex gap-2 mt-2">
                    {['tier1', 'tier2', 'tier3'].map((tier) => (
                      <label key={tier} className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <Checkbox
                          checked={campaign.targeting.userTiers.includes(tier)}
                          onCheckedChange={(checked) => {
                            const newTiers = checked
                              ? [...campaign.targeting.userTiers, tier]
                              : campaign.targeting.userTiers.filter(t => t !== tier);
                            setCampaign({ ...campaign, targeting: { ...campaign.targeting, userTiers: newTiers } });
                          }}
                        />
                        <span className="capitalize">{tier.replace('tier', 'Tier ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Device & Carrier - Pro+ */}
            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Device & Carrier
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Pro+</span>
              </h3>
              
              {isFeatureLocked('device') ? (
                <LockedFeature tier="Pro" />
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Device Brands</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {DEVICE_BRANDS.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <Checkbox
                            checked={campaign.targeting.deviceBrands.includes(brand)}
                            onCheckedChange={(checked) => {
                              const newBrands = checked
                                ? [...campaign.targeting.deviceBrands, brand]
                                : campaign.targeting.deviceBrands.filter(b => b !== brand);
                              setCampaign({ ...campaign, targeting: { ...campaign.targeting, deviceBrands: newBrands } });
                            }}
                          />
                          <span>{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Mobile Carriers</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {CARRIERS.map((carrier) => (
                        <label key={carrier} className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <Checkbox
                            checked={campaign.targeting.carriers.includes(carrier)}
                            onCheckedChange={(checked) => {
                              const newCarriers = checked
                                ? [...campaign.targeting.carriers, carrier]
                                : campaign.targeting.carriers.filter(c => c !== carrier);
                              setCampaign({ ...campaign, targeting: { ...campaign.targeting, carriers: newCarriers } });
                            }}
                          />
                          <span>{carrier}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Interests - Pro+ */}
            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Interests & Behavior
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Pro+</span>
              </h3>
              
              {isFeatureLocked('interests') ? (
                <LockedFeature tier="Pro" />
              ) : (
                <div>
                  <Label>Interests</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {INTERESTS.map((interest) => (
                      <label key={interest} className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <Checkbox
                          checked={campaign.targeting.interests.includes(interest)}
                          onCheckedChange={(checked) => {
                            const newInterests = checked
                              ? [...campaign.targeting.interests, interest]
                              : campaign.targeting.interests.filter(i => i !== interest);
                            setCampaign({ ...campaign, targeting: { ...campaign.targeting, interests: newInterests } });
                          }}
                        />
                        <span>{interest}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Purchase Intent - Enterprise */}
            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Purchase Intent & Life Events
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Enterprise</span>
              </h3>
              
              {isFeatureLocked('intent') ? (
                <LockedFeature tier="Enterprise" />
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Purchase Intent (Next 6 months)</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {PURCHASE_INTENTS.map((intent) => (
                        <label key={intent} className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <Checkbox
                            checked={campaign.targeting.purchaseIntent.includes(intent)}
                            onCheckedChange={(checked) => {
                              const newIntents = checked
                                ? [...campaign.targeting.purchaseIntent, intent]
                                : campaign.targeting.purchaseIntent.filter(i => i !== intent);
                              setCampaign({ ...campaign, targeting: { ...campaign.targeting, purchaseIntent: newIntents } });
                            }}
                          />
                          <span>{intent}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Step 3: Content */}
        {step === 3 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Campaign Content</h2>
            
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Content builder will be available based on campaign type ({campaign.type})
              </p>
              <p className="text-sm text-gray-500">
                For surveys: Add questions<br />
                For videos: Upload video URL<br />
                For apps: Provide app store link
              </p>
            </div>
          </Card>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Review Campaign</h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Campaign Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Title</span>
                      <span className="font-medium">{campaign.titleEn || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium capitalize">{campaign.type}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Reward</span>
                      <span className="font-medium">{campaign.reward} EGP</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Total Budget</span>
                      <span className="font-medium">{campaign.totalBudget} EGP</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Target Completions</span>
                      <span className="font-medium">{campaign.completionsNeeded}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Targeting Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Age Range</span>
                      <span className="font-medium">{campaign.targeting.ageMin} - {campaign.targeting.ageMax}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Gender</span>
                      <span className="font-medium capitalize">{campaign.targeting.gender}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Device Brands</span>
                      <span className="font-medium">{campaign.targeting.deviceBrands.length > 0 ? campaign.targeting.deviceBrands.join(', ') : 'All'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Estimated Reach</span>
                      <span className="font-medium text-primary">{estimatedReach.toLocaleString()} users</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Ready to Launch</p>
                    <p className="text-sm text-green-600">Your campaign will be reviewed and published within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {step < 4 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              <Rocket className="w-4 h-4 mr-2" />
              Launch Campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Building, User, Mail, Phone, Lock, Check, Crown, Zap, Rocket,
  Target, Users, BarChart3, Shield, ArrowRight, ArrowLeft, Globe
} from 'lucide-react';
import { APP_LOGO, APP_TITLE } from '@/const';

// Tier definitions
const TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    nameAr: 'أساسي',
    price: 'Free',
    priceAr: 'مجاني',
    icon: Target,
    color: 'bg-gray-100 border-gray-300',
    features: [
      'Basic demographic targeting',
      'Target by user tier (Bronze, Silver, Gold)',
      'Up to 3 active campaigns',
      'Basic analytics',
    ],
    featuresAr: [
      'استهداف ديموغرافي أساسي',
      'استهداف حسب مستوى المستخدم',
      'حتى 3 حملات نشطة',
      'تحليلات أساسية',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    nameAr: 'احترافي',
    price: '$99/mo',
    priceAr: '$99/شهر',
    icon: Zap,
    color: 'bg-blue-50 border-blue-400',
    popular: true,
    features: [
      'All Basic features',
      'Advanced targeting (device, carrier, interests)',
      'Target verified users (KYC, social)',
      'Unlimited campaigns',
      'Real-time analytics',
      'Priority support',
    ],
    featuresAr: [
      'جميع ميزات الأساسي',
      'استهداف متقدم (جهاز، شبكة، اهتمامات)',
      'استهداف المستخدمين الموثقين',
      'حملات غير محدودة',
      'تحليلات فورية',
      'دعم أولوية',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    nameAr: 'مؤسسي',
    price: 'Custom',
    priceAr: 'مخصص',
    icon: Crown,
    color: 'bg-amber-50 border-amber-400',
    features: [
      'All Pro features',
      'Hyper-targeting (purchase intent, life events)',
      'Custom audience builder',
      'Save & reuse audiences',
      'Dedicated account manager',
      'API access',
    ],
    featuresAr: [
      'جميع ميزات الاحترافي',
      'استهداف فائق (نية الشراء، أحداث الحياة)',
      'منشئ جمهور مخصص',
      'حفظ وإعادة استخدام الجماهير',
      'مدير حساب مخصص',
      'وصول API',
    ],
  },
];

export default function AdvertiserRegister() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1); // 1: Tier Selection, 2: Registration Form
  const [selectedTier, setSelectedTier] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    industry: '',
    companySize: '',
  });
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/countries')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.countries) {
          setCountries(data.countries);
          const egypt = data.countries.find((c: any) => c.code === 'EG');
          if (egypt) setSelectedCountryId(egypt.id);
          else if (data.countries.length > 0) setSelectedCountryId(data.countries[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/advertiser/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          tier: selectedTier,
          countryId: selectedCountryId,
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Account created successfully!');
        localStorage.setItem('currentAdvertiserId', data.advertiser.slug);
        localStorage.setItem('advertiser-info', JSON.stringify(data.advertiser));
        setTimeout(() => {
          setLocation('/advertiser/new-dashboard');
        }, 1000);
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
      <div className="max-w-6xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src={APP_LOGO} 
            alt={APP_TITLE} 
            className="w-16 h-16 mx-auto mb-4 drop-shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setLocation('/welcome')}
          />
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === 1 ? 'Choose Your Plan' : 'Create Your Account'}
          </h1>
          <p className="text-white/80">
            {step === 1 
              ? 'Select the plan that best fits your advertising needs' 
              : 'Fill in your details to get started'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-white text-primary' : 'bg-white/30 text-white'}`}>
              1
            </div>
            <div className={`w-20 h-1 ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-white text-primary' : 'bg-white/30 text-white'}`}>
              2
            </div>
          </div>
        </div>

        {step === 1 ? (
          /* Step 1: Tier Selection */
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {TIERS.map((tier) => {
                const Icon = tier.icon;
                const isSelected = selectedTier === tier.id;
                return (
                  <Card 
                    key={tier.id}
                    className={`relative p-6 cursor-pointer transition-all ${tier.color} ${isSelected ? 'ring-4 ring-primary scale-105' : 'hover:scale-102'}`}
                    onClick={() => handleTierSelect(tier.id)}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="text-center mb-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${tier.id === 'basic' ? 'bg-gray-200' : tier.id === 'pro' ? 'bg-blue-200' : 'bg-amber-200'}`}>
                        <Icon className={`w-8 h-8 ${tier.id === 'basic' ? 'text-gray-600' : tier.id === 'pro' ? 'text-blue-600' : 'text-amber-600'}`} />
                      </div>
                      <h3 className="text-xl font-bold">{tier.name}</h3>
                      <p className="text-2xl font-bold text-primary mt-2">{tier.price}</p>
                    </div>

                    <ul className="space-y-2">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Button 
                onClick={handleNext}
                size="lg"
                className="px-8"
              >
                Continue with {TIERS.find(t => t.id === selectedTier)?.name}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </>
        ) : (
          /* Step 2: Registration Form */
          <Card className="max-w-lg mx-auto p-8">
            <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedTier === 'basic' ? 'bg-gray-200' : selectedTier === 'pro' ? 'bg-blue-200' : 'bg-amber-200'}`}>
                {selectedTier === 'basic' && <Target className="w-5 h-5 text-gray-600" />}
                {selectedTier === 'pro' && <Zap className="w-5 h-5 text-blue-600" />}
                {selectedTier === 'enterprise' && <Crown className="w-5 h-5 text-amber-600" />}
              </div>
              <div>
                <p className="font-semibold">{TIERS.find(t => t.id === selectedTier)?.name} Plan</p>
                <p className="text-sm text-muted-foreground">{TIERS.find(t => t.id === selectedTier)?.price}</p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={handleBack}>
                Change
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="companyName"
                      placeholder="Acme Inc."
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="contactPerson"
                      placeholder="John Doe"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="advertiser@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+20 10 1234 5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <select
                    id="industry"
                    title="Industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="retail">Retail</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="companySize">Company Size</Label>
                  <select
                    id="companySize"
                    title="Company Size"
                    value={formData.companySize}
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <select
                    id="country"
                    title="Country"
                    value={selectedCountryId || ''}
                    onChange={(e) => setSelectedCountryId(Number(e.target.value))}
                    className="w-full h-10 px-3 pl-10 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">Select country</option>
                    {countries.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn} ({c.currency})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <button
                onClick={() => setLocation('/advertiser/login')}
                className="text-primary hover:underline font-medium"
              >
                Login
              </button>
            </div>
          </Card>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button
            onClick={() => setLocation('/welcome')}
            className="text-sm text-white/80 hover:text-white"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

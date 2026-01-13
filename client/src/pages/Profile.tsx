import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, Mail, Phone, Calendar, Award, TrendingUp, 
  Settings, HelpCircle, FileText, LogOut, ChevronRight,
  Shield, Bell, Globe, CreditCard, MapPin
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authApi } from '@/lib/authApi';
import ProfileStrengthBar from '@/components/ProfileStrengthBar';
import { useLocation } from 'wouter';

const countries = [
  { code: 'EG', nameEn: 'Egypt', nameAr: 'مصر' },
  { code: 'SA', nameEn: 'Saudi Arabia', nameAr: 'السعودية' },
  { code: 'AE', nameEn: 'UAE', nameAr: 'الإمارات' },
  { code: 'KW', nameEn: 'Kuwait', nameAr: 'الكويت' },
  { code: 'QA', nameEn: 'Qatar', nameAr: 'قطر' },
  { code: 'BH', nameEn: 'Bahrain', nameAr: 'البحرين' },
  { code: 'OM', nameEn: 'Oman', nameAr: 'عمان' },
  { code: 'JO', nameEn: 'Jordan', nameAr: 'الأردن' },
  { code: 'LB', nameEn: 'Lebanon', nameAr: 'لبنان' },
  { code: 'IQ', nameEn: 'Iraq', nameAr: 'العراق' },
];

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user } = useApp();
  const [, setLocation] = useLocation();
  const [profileStrength, setProfileStrength] = React.useState(30);
  const [selectedCountry, setSelectedCountry] = React.useState('EG');
  
  const handleLogout = async () => {
    try {
      await authApi.logout();
      // Clear all localStorage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('manus-runtime-user-info');
      // Redirect to splash which will then go to welcome
      window.location.href = '/splash';
    } catch (error) {
      console.error('[Profile] Logout error:', error);
      // Still redirect even if API call fails
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('manus-runtime-user-info');
      window.location.href = '/splash';
    }
  };

  React.useEffect(() => {
    // Calculate profile strength based on user data
    let strength = 30; // Base strength
    
    // Add points for completed tasks (up to 40 points)
    if (user.completedTasks > 0) {
      strength += Math.min(40, Math.floor(user.completedTasks / 5) * 10);
    }
    
    // Add points for verified status (30 points)
    if (user.verified) {
      strength += 30;
    }
    
    // Cap at 100%
    strength = Math.min(100, strength);
    
    setProfileStrength(strength);
    const savedCountry = localStorage.getItem('selectedCountry') || 'EG';
    setSelectedCountry(savedCountry);
  }, [user.completedTasks, user.verified]);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    localStorage.setItem('selectedCountry', countryCode);
  };

  const getTierInfo = (tier: string) => {
    const tierMap: Record<string, any> = {
      bronze: { name: t('tier.bronze'), color: 'bg-amber-700', nextTier: t('tier.silver'), tasksNeeded: 23 },
      silver: { name: t('tier.silver'), color: 'bg-gray-400', nextTier: t('tier.gold'), tasksNeeded: 73 },
      gold: { name: t('tier.gold'), color: 'bg-secondary', nextTier: t('tier.platinum'), tasksNeeded: 173 },
      platinum: { name: t('tier.platinum'), color: 'bg-purple-500', nextTier: null, tasksNeeded: 0 }
    };
    return tierMap[tier] || tierMap.bronze;
  };

  const currentTierInfo = getTierInfo(user.tier);

  const menuSections = [
    {
      title: t('profile.sections.account'),
      items: [
        { icon: User, label: t('profile.menu.editProfile'), path: '/profile/edit' },
        { icon: Shield, label: t('profile.menu.privacySecurity'), path: '/profile/security' },
        { icon: Bell, label: t('profile.menu.notifications'), path: '/profile/notifications' },
        { icon: CreditCard, label: t('profile.menu.paymentMethods'), path: '/profile/payment-methods' },
      ]
    },
    {
      title: t('profile.sections.general'),
      items: [
        { icon: Globe, label: t('profile.menu.language'), path: '/profile/language', badge: i18n.language === 'ar' ? 'العربية' : 'English' },
        { icon: MapPin, label: t('profile.menu.country'), isCountrySelector: true },
        { icon: HelpCircle, label: t('profile.menu.helpSupport'), path: '/help' },
        { icon: FileText, label: t('profile.menu.terms'), path: '/terms' },
        { icon: FileText, label: t('profile.menu.privacy'), path: '/privacy' },
      ]
    }
  ];

  return (
    <MobileLayout title={t('profile.title')}>
      <div className="p-4 space-y-6">
        {/* User Info Card */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-20 h-20 rounded-full border-4 border-primary"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{user.name}</h2>
                {user.verified && (
                  <Badge className="bg-primary text-white border-0">
                    ✓ {t('profile.verified')}
                  </Badge>
                )}
              </div>
              <Badge className={`${currentTierInfo.color} text-white border-0 mb-2`}>
                {currentTierInfo.name}
              </Badge>
              <p className="text-sm text-muted-foreground">{t('profile.memberSince')} {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : ''}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{user.phone}</span>
            </div>
          </div>
        </Card>

        {/* Profile Strength */}
        <Card className="p-4">
          <ProfileStrengthBar strength={profileStrength} showDetails={true} />
          {profileStrength < 100 && (
            <Button 
              onClick={() => {
                if (profileStrength < 60) {
                  setLocation('/identity-verification');
                } else {
                  setLocation('/profile-questions-1');
                }
              }}
              className="w-full mt-4 bg-gradient-primary text-white"
            >
              {t('home.boostProfile')}
            </Button>
          )}
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">{t('home.stats.completedTasks')}</p>
            </div>
            <p className="text-2xl font-bold">{user.completedTasks}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">{t('home.stats.totalEarnings')}</p>
            </div>
            <p className="text-2xl font-bold">{user.totalEarnings.toFixed(0)}</p>
          </Card>
        </div>

        {/* Tier Progress */}
        {currentTierInfo.nextTier && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">{t('profile.progressTo')} {currentTierInfo.nextTier}</p>
              <p className="text-xs text-muted-foreground">
                {currentTierInfo.tasksNeeded} {t('profile.tasksRemaining')}
              </p>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`${currentTierInfo.color} h-2 rounded-full transition-all`}
                style={{ width: `${(user.completedTasks / (user.completedTasks + currentTierInfo.tasksNeeded)) * 100}%` }}
              />
            </div>
          </Card>
        )}

        {/* Menu Sections */}
        {menuSections.map((section, index) => (
          <div key={index}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
              {section.title}
            </h3>
            <Card className="divide-y">
              {section.items.map((item, itemIndex) => (
                item.isCountrySelector ? (
                  <div key={itemIndex} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <Select value={selectedCountry} onValueChange={handleCountryChange}>
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries?.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {i18n.language === 'ar' ? country.nameAr : country.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <button
                    key={itemIndex}
                    onClick={() => setLocation(item.path)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                )
              ))}
            </Card>
          </div>
        ))}

        {/* Logout Button */}
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white"
        >
          <LogOut className="mr-2" size={20} />
          {t('logout')}
        </Button>
      </div>
    </MobileLayout>
  );
}

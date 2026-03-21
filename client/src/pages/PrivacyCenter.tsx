import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Shield, Download, Trash2, Eye, ToggleLeft, Info, AlertTriangle,
  CheckCircle, FileText, User, Monitor, Brain, ShoppingBag, BarChart2, FileJson, FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from 'react-i18next';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ConsentMap {
  personalisation: boolean;
  analytics: boolean;
  marketing: boolean;
  income_spi: boolean;
  linked_cards: boolean;
}

interface PrivacyProfile {
  identity: { name: string; email: string; phone: string; city: string; district: string };
  demographic: { age: number; gender: string; incomeLevel: string; tier: string; kycStatus: string; memberSince: string };
  device: { deviceModel: string; deviceOs: string; deviceTier: string; networkCarrier: string; connectionType: string };
  psychographic: { interests: string[]; brandAffinity: string[]; values: string[]; lifeStage: string };
  behavioral: { shoppingFrequency: string; preferredStores: string[]; nextPurchaseIntent: string[]; workType: string; homeOwnership: string; activityPattern: string };
  engagement: { profileStrength: number; completedTasks: number; totalEarnings: number; influenceScore: number };
}

// ─── Consent Toggle Definitions ───────────────────────────────────────────────
const CONSENT_ITEMS = [
  {
    key: 'personalisation' as const,
    labelKey: 'privacy.consent.personalization.label',
    descKey: 'privacy.consent.personalization.desc',
    icon: Brain,
  },
  {
    key: 'analytics' as const,
    labelKey: 'privacy.consent.analytics.label',
    descKey: 'privacy.consent.analytics.desc',
    icon: BarChart2,
  },
  {
    key: 'marketing' as const,
    labelKey: 'privacy.consent.marketing.label',
    descKey: 'privacy.consent.marketing.desc',
    icon: ToggleLeft,
  },
  {
    key: 'income_spi' as const,
    labelKey: 'privacy.consent.income.label',
    descKey: 'privacy.consent.income.desc',
    icon: ShoppingBag,
  },
  {
    key: 'linked_cards' as const,
    labelKey: 'privacy.consent.cards.label',
    descKey: 'privacy.consent.cards.desc',
    icon: CheckCircle,
  },
] as const;

// ─── Tag Chip Component ───────────────────────────────────────────────────────
function TagChips({ tags }: { tags: string[] }) {
  const { t } = useTranslation();
  if (!tags || tags.length === 0) return <span className="text-muted-foreground text-xs">{t('notAvailable')}</span>;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {tags.map(tag => (
        <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
          {tag}
        </span>
      ))}
    </div>
  );
}

// ─── Profile Row ─────────────────────────────────────────────────────────────
function ProfileRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between items-start py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value || '—'}</span>
    </div>
  );
}

// ─── Guest Privacy Policy Component ─────────────────────────────────────────────
function GuestPrivacyPolicy() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [, setLocation] = useLocation();
  return (
    <MobileLayout title={t('welcome.terms.privacy')} showBack>
      <div className="p-4 pb-28 space-y-6 max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{t('welcome.terms.privacy')}</h1>
            <p className="text-white/80 text-xs mt-0.5">TaskKash Data Protection & Privacy</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('privacy.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>At TaskKash, we take your privacy seriously. This policy explains what information we collect, how we use it, and the rights you have concerning your data under GDPR, CCPA, and Egyptian Data Protection Law.</p>
            
            <h3 className="font-semibold text-foreground pt-2">1. Information We Collect</h3>
            <p>We collect information you provide directly to us when creating an account, including your name, email, phone number, and demographic information. We also collect data about your interactions with tasks and offers.</p>

            <h3 className="font-semibold text-foreground pt-2">2. How We Use Your Data</h3>
            <p>Your data is used to personalize your experience, match you with relevant tasks and offers, process payments, and improve our services. We do not sell your personal data to third parties.</p>

            <h3 className="font-semibold text-foreground pt-2">3. Your Data Rights (Registered Users)</h3>
            <p>Once you register, you gain access to our Data & Privacy Center where you can:</p>
            <ul className={`list-disc ${isRTL ? 'pr-5' : 'pl-5'} space-y-1`}>
               <li>Manage your consent for personalization and marketing.</li>
               <li>View the exact profile and behavioral data we hold.</li>
               <li>Download a copy of your data in JSON or CSV format.</li>
               <li>Request the permanent deletion of your account and data.</li>
            </ul>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 rounded-xl text-center">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">{t('home.boostProfile')}</h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">{t('profileComplete.completeToUnlock')}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setLocation('/login')} variant="default">{t('login.submit')}</Button>
                <Button onClick={() => setLocation('/register')} variant="outline">{t('welcome.buttons.register')}</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Footer */}
        <div className="pt-2 pb-2 text-center">
          <p className="text-[10px] text-muted-foreground">
            TaskKash complies with GDPR, CCPA, and Egypt Data Protection Law 2023/82
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Data Protection Officer: <a href="mailto:dpo@taskkash.com" className="underline">dpo@taskkash.com</a>
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PrivacyCenter() {
  const { user } = useApp();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [, setLocation] = useLocation();

  // Consent state - DEFAULT ALL TO TRUE per user request
  const [consents, setConsents] = useState<ConsentMap>({
    personalisation: true, analytics: true, marketing: true,
    income_spi: true, linked_cards: true,
  });
  const [consentsLoading, setConsentsLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  // Profile state
  const [profile, setProfile] = useState<PrivacyProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // ── Fetch initial consent state ──
  useEffect(() => {
    if (!user) {
      setConsentsLoading(false);
      return;
    }
    fetch('/api/privacy/consents', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.consents) setConsents(data.consents);
      })
      .catch(console.error)
      .finally(() => setConsentsLoading(false));
  }, [user]);

  // ── Fetch profile on tab change ──
  const loadProfile = useCallback(() => {
    if (profile || !user) return;
    setProfileLoading(true);
    fetch('/api/privacy/profile', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProfile(data);
      })
      .catch(console.error)
      .finally(() => setProfileLoading(false));
  }, [profile, user]);

  // ── Toggle consent (immediate, append-only) ──
  const handleToggle = async (key: keyof ConsentMap) => {
    if (toggling) return;
    const newValue = !consents[key];
    setToggling(key);
    // Optimistic update
    setConsents(prev => ({ ...prev, [key]: newValue }));
    try {
      const res = await fetch('/api/privacy/consents', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentType: key, granted: newValue }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Your preference has been saved');
    } catch {
      // Revert on error
      setConsents(prev => ({ ...prev, [key]: !newValue }));
      toast.error('Failed to save preference. Please try again.');
    } finally {
      setToggling(null);
    }
  };

  // ── Export data ──
  const handleExport = async (format: 'json' | 'csv') => {
    if (exportLoading) return;
    setExportLoading(true);
    try {
      const res = await fetch(`/api/privacy/export?format=${format}`, { credentials: 'include' });
      if (res.status === 429) {
        const data = await res.json();
        toast.error('Export limit reached: maximum 3 downloads per 24 hours.');
        return;
      }
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `taskkash-my-data-${date}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Your data has been downloaded as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // ── Delete request ──
  const handleDeleteRequest = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm deletion.');
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/privacy/delete-request', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (res.status === 400 && data.error === 'balance_not_zero') {
        toast.error('Please withdraw your remaining balance before deleting your account.');
        setShowDeleteModal(false);
        return;
      }
      if (res.status === 403) {
        toast.error('Incorrect password. Deletion request rejected.');
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Request failed');
      toast.success('Deletion request received. Your account will be deleted within 30 days.');
      setShowDeleteModal(false);
      setDeletePassword('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit deletion request.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) {
    return <GuestPrivacyPolicy />;
  }

  return (
    <MobileLayout title="Your Privacy & Data Rights" showBack>
      <div className="p-4 pb-28 space-y-4 max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{t('privacy.title')}</h1>
            <p className="text-white/80 text-xs mt-0.5">{t('privacy.subtitle')}</p>
          </div>
        </div>

        <Tabs defaultValue="consents" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="consents" className="flex flex-col gap-1 py-2 text-xs">
              <ToggleLeft className="w-4 h-4" />
              {t('privacy.tabs.consent')}
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col gap-1 py-2 text-xs" onClick={loadProfile}>
              <User className="w-4 h-4" />
              {t('privacy.tabs.myData')}
            </TabsTrigger>
            <TabsTrigger value="export" className="flex flex-col gap-1 py-2 text-xs">
              <Download className="w-4 h-4" />
              {t('privacy.tabs.export')}
            </TabsTrigger>
            <TabsTrigger value="delete" className="flex flex-col gap-1 py-2 text-xs">
              <Trash2 className="w-4 h-4" />
              {t('privacy.tabs.delete')}
            </TabsTrigger>
          </TabsList>

          {/* ── Section 1: Consent Preferences ──────────────────────────────── */}
          <TabsContent value="consents" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'قم بتفعيل أو إيقاف كل إذن. التغييرات تسري فوراً.' : 'Toggle each permission on or off. Changes take effect immediately.'}
            </p>

            {CONSENT_ITEMS.map(({ key, labelKey, descKey, icon: Icon }) => (
              <Card key={key} className="border">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{t(labelKey)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{t(descKey)}</p>
                      </div>
                    </div>
                    <Switch
                      id={`consent-${key}`}
                      checked={consents[key]}
                      disabled={consentsLoading || toggling === key}
                      onCheckedChange={() => handleToggle(key)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Mandatory AML notice */}
            <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-snug">
                {isRTL 
                  ? 'بيانات التحقق من الهوية والدفع مطلوبة بموجب القانون (AML/PSD2) ولا يمكن حذفها. جميع البيانات الأخرى تحت سيطرتك الكاملة.'
                  : 'Your identity verification and payment data are required by law (AML/PSD2) and cannot be removed. All other data is under your full control.'}
              </p>
            </div>
          </TabsContent>

          {/* ── Section 2: My Data Profile ───────────────────────────────────── */}
          <TabsContent value="profile" className="mt-4 space-y-3">
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-blue-600 shrink-0 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    {t('home.boostProfile')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-xs text-blue-800 leading-snug">
                {isRTL 
                  ? 'هذا هو الملف الشخصي المستخدم لمطابقتك مع المهام والعروض ذات الصلة.'
                  : 'This is the profile used to match you with relevant tasks and offers.'}
                <strong> {isRTL ? 'إكمال أكثر = أرباح أعلى.' : 'More complete = higher earnings.'}</strong>
              </p>
            </div>

            {profileLoading && (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {profile && !profileLoading && (
              <div className="space-y-3">
                {/* Identity & Contact */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" /> {t('privacy.data.identity')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <ProfileRow label={t('editProfile.fullName')} value={profile.identity.name} />
                    <ProfileRow label={t('editProfile.email')} value={profile.identity.email} />
                    <ProfileRow label={t('editProfile.phone')} value={profile.identity.phone} />
                    <ProfileRow label={isRTL ? 'المدينة' : 'City'} value={profile.identity.city} />
                    <ProfileRow label={isRTL ? 'المنطقة' : 'District'} value={profile.identity.district} />
                  </CardContent>
                </Card>

                {/* Demographic */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-500" /> {t('privacy.data.demographic')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <ProfileRow label={t('profileQuestions.age')} value={profile.demographic.age} />
                    <ProfileRow label={t('profileQuestions.gender')} value={profile.demographic.gender} />
                    <ProfileRow label={t('profileQuestions.income')} value={profile.demographic.incomeLevel} />
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-muted-foreground text-sm">{isRTL ? 'المستوى' : 'Tier'}</span>
                      <Badge variant="secondary" className="capitalize">{profile.demographic.tier}</Badge>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-muted-foreground text-sm">{t('editProfile.verification')}</span>
                      <Badge variant={profile.demographic.kycStatus === 'verified' ? 'default' : 'secondary'} className="capitalize">
                        {profile.demographic.kycStatus === 'verified' ? t('editProfile.verified') : (isRTL ? 'غير موثق' : 'Not verified')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Device Profile */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-green-500" /> {t('privacy.data.device')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <ProfileRow label={isRTL ? 'موديل الجهاز' : 'Device Model'} value={profile.device.deviceModel} />
                    <ProfileRow label={isRTL ? 'نظام التشغيل' : 'OS'} value={profile.device.deviceOs} />
                    <ProfileRow label={isRTL ? 'فئة الجهاز' : 'Device Tier'} value={profile.device.deviceTier} />
                    <ProfileRow label={isRTL ? 'شبكة الاتصال' : 'Network Carrier'} value={profile.device.networkCarrier} />
                    <ProfileRow label={isRTL ? 'نوع الاتصال' : 'Connection'} value={profile.device.connectionType} />
                  </CardContent>
                </Card>

                {/* Interests & Preferences */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4 text-orange-500" /> {t('privacy.data.interests')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><p className="text-xs text-muted-foreground mb-1">{t('profileQuestions.interests')}</p><TagChips tags={profile.psychographic.interests} /></div>
                    <div><p className="text-xs text-muted-foreground mb-1">{isRTL ? 'الانتماء للعلامة التجارية' : 'Brand Affinity'}</p><TagChips tags={profile.psychographic.brandAffinity} /></div>
                    <div><p className="text-xs text-muted-foreground mb-1">{isRTL ? 'القيم' : 'Values'}</p><TagChips tags={profile.psychographic.values} /></div>
                    <ProfileRow label={isRTL ? 'مرحلة الحياة' : 'Life Stage'} value={profile.psychographic.lifeStage} />
                  </CardContent>
                </Card>

                {/* Behavioral Signals */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-pink-500" /> {t('privacy.data.behavioral')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ProfileRow label={isRTL ? 'تكرار التسوق' : 'Shopping Frequency'} value={profile.behavioral.shoppingFrequency} />
                    <div><p className="text-xs text-muted-foreground mb-1">{isRTL ? 'المتاجر المفضلة' : 'Preferred Stores'}</p><TagChips tags={profile.behavioral.preferredStores} /></div>
                    <div><p className="text-xs text-muted-foreground mb-1">{isRTL ? 'نية الشراء القادمة' : 'Next Purchase Intent'}</p><TagChips tags={profile.behavioral.nextPurchaseIntent} /></div>
                    <ProfileRow label={isRTL ? 'نوع العمل' : 'Work Type'} value={profile.behavioral.workType} />
                    <ProfileRow label={isRTL ? 'ملك المنزل' : 'Home Ownership'} value={profile.behavioral.homeOwnership} />
                    <ProfileRow label={isRTL ? 'نمط النشاط' : 'Activity Pattern'} value={profile.behavioral.activityPattern} />
                  </CardContent>
                </Card>

                {/* Engagement Stats */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-cyan-500" /> {t('privacy.data.engagement')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <ProfileRow label={t('profileComplete.profileStrength')} value={`${profile.engagement.profileStrength}%`} />
                    <ProfileRow label={t('editProfile.completedTasks')} value={profile.engagement.completedTasks} />
                    <ProfileRow label={t('editProfile.totalEarnings')} value={profile.engagement.totalEarnings} />
                    <ProfileRow label={isRTL ? 'درجة تأثير الإحالة' : 'Referral Influence Score'} value={profile.engagement.influenceScore} />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ── Section 3: Export My Data ─────────────────────────────────────── */}
          <TabsContent value="export" className="mt-4 space-y-4">
            <div className="text-center space-y-2 py-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                <Download className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold">{t('privacy.export.title')}</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {t('privacy.export.desc')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExport('json')}
                disabled={exportLoading}
                className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all disabled:opacity-50"
              >
                <FileJson className="w-8 h-8 text-blue-600" />
                <span className="font-semibold text-sm">Download JSON</span>
                <span className="text-xs text-muted-foreground">Arrays preserved</span>
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={exportLoading}
                className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-green-200 rounded-xl hover:bg-green-50 hover:border-green-400 transition-all disabled:opacity-50"
              >
                <FileSpreadsheet className="w-8 h-8 text-green-600" />
                <span className="font-semibold text-sm">Download CSV</span>
                <span className="text-xs text-muted-foreground">Excel-friendly</span>
              </button>
            </div>

            {/* Legal notice */}
            <div className="flex gap-2 p-3 bg-gray-50 border rounded-lg">
              <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-snug">
                {isRTL 
                  ? 'يتضمن التصدير جميع البيانات الشخصية والسلوكية التي نحتفظ بها. يتم الاحتفاظ بسجلات التحقق من الهوية بشكل منفصل بموجب القانون ولا يتم تضمينها هنا.'
                  : 'Your export includes all personal and behavioral data we hold. Identity verification records are retained separately under AML law and are not included in this export.'}
              </p>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {isRTL ? 'مسموح بـ 3 عمليات تحميل كل 24 ساعة لأمانك.' : 'Limited to 3 downloads per 24 hours for your security.'}
            </p>
          </TabsContent>

          {/* ── Section 4: Delete My Account ──────────────────────────────────── */}
          <TabsContent value="delete" className="mt-4 space-y-4">
            <div className="text-center space-y-2 py-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="font-semibold">{t('privacy.delete.title')}</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {t('privacy.delete.desc')}
              </p>
            </div>

            <Card className="border-red-100 bg-red-50/30">
              <CardContent className="pt-4 space-y-2">
                <div className="flex gap-2 items-start">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-800 space-y-1">
                    <p dir={isRTL ? 'rtl' : 'ltr'}>• {t('privacy.delete.bullet1')}</p>
                    <p dir={isRTL ? 'rtl' : 'ltr'}>• {t('privacy.delete.bullet2')}</p>
                    <p dir={isRTL ? 'rtl' : 'ltr'}>• {t('privacy.delete.bullet3')}</p>
                    <p dir={isRTL ? 'rtl' : 'ltr'}>• {t('privacy.delete.bullet4')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('privacy.delete.requestDeletion')}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Compliance Footer */}
        <div className="pt-2 pb-2 text-center">
          <p className="text-[10px] text-muted-foreground">
            {t('privacy.footer.compliance')}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {t('privacy.footer.dpo')}: <a href="mailto:dpo@taskkash.com" className="underline">dpo@taskkash.com</a>
          </p>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ──────────────────────────────────────── */}
      <Dialog open={showDeleteModal} onOpenChange={(open) => { setShowDeleteModal(open); if (!open) setDeletePassword(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {isRTL ? 'تأكيد حذف الحساب' : 'Confirm Account Deletion'}
            </DialogTitle>
            <DialogDescription className="pt-2 space-y-2 text-sm">
              <p dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'سيتم حذف بياناتك نهائياً خلال 30 يوماً.' : 'This will permanently delete your data within 30 days.'}</p>
              <p className="font-medium text-amber-700" dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'يجب أن يكون رصيد محفظتك صفراً.' : 'Your wallet balance must be zero.'}</p>
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2">
            <Label htmlFor="del-password" className="text-sm font-medium">
              {isRTL ? 'أدخل كلمة المرور للتأكيد' : 'Enter your password to confirm'}
            </Label>
            <Input
              id="del-password"
              type="password"
              placeholder={isRTL ? 'كلمة مرور حسابك' : 'Your account password'}
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDeleteRequest()}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}>
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRequest}
              disabled={!deletePassword || deleteLoading}
            >
              {deleteLoading ? t('loading') : (isRTL ? 'نعم، أطلب الحذف' : 'Yes, Request Deletion')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}

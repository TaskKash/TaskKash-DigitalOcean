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
    label: 'Personalised offers & targeting',
    desc: 'We use your profile to match you with tasks and offers that are relevant to your interests.',
    icon: Brain,
  },
  {
    key: 'analytics' as const,
    label: 'App analytics & performance',
    desc: 'Helps us to improve the app speed, stability, and user experience based on usage patterns.',
    icon: BarChart2,
  },
  {
    key: 'marketing' as const,
    label: 'Marketing emails & push notifications',
    desc: 'Receive emails and push notifications about new tasks, rewards, and promotions.',
    icon: ToggleLeft,
  },
  {
    key: 'income_spi' as const,
    label: 'Income-based offer matching',
    desc: 'We use your income level to match higher-paying tasks and financial offers to your profile.',
    icon: ShoppingBag,
  },
  {
    key: 'linked_cards' as const,
    label: 'Linked card cashback & spending insights',
    desc: 'Enables cashback tracking and spending analysis through linked payment cards.',
    icon: CheckCircle,
  },
] as const;

// ─── Tag Chip Component ───────────────────────────────────────────────────────
function TagChips({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return <span className="text-muted-foreground text-xs">Not set</span>;
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PrivacyCenter() {
  const { user } = useApp();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [, setLocation] = useLocation();

  // Consent state
  const [consents, setConsents] = useState<ConsentMap>({
    personalisation: false, analytics: false, marketing: false,
    income_spi: false, linked_cards: false,
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
    fetch('/api/privacy/consents', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.consents) setConsents(data.consents);
      })
      .catch(console.error)
      .finally(() => setConsentsLoading(false));
  }, []);

  // ── Fetch profile on tab change ──
  const loadProfile = useCallback(() => {
    if (profile) return;
    setProfileLoading(true);
    fetch('/api/privacy/profile', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setProfile(data))
      .catch(console.error)
      .finally(() => setProfileLoading(false));
  }, [profile]);

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

  return (
    <MobileLayout title="Your Privacy & Data Rights" showBack>
      <div className="p-4 pb-28 space-y-4 max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Your Privacy & Data Rights</h1>
            <p className="text-white/80 text-xs mt-0.5">Full control over your data under GDPR Art. 7, 17, 20</p>
          </div>
        </div>

        <Tabs defaultValue="consents" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="consents" className="flex flex-col gap-1 py-2 text-xs">
              <ToggleLeft className="w-4 h-4" />
              Consent
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col gap-1 py-2 text-xs" onClick={loadProfile}>
              <User className="w-4 h-4" />
              My Data
            </TabsTrigger>
            <TabsTrigger value="export" className="flex flex-col gap-1 py-2 text-xs">
              <Download className="w-4 h-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="delete" className="flex flex-col gap-1 py-2 text-xs">
              <Trash2 className="w-4 h-4" />
              Delete
            </TabsTrigger>
          </TabsList>

          {/* ── Section 1: Consent Preferences ──────────────────────────────── */}
          <TabsContent value="consents" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Toggle each permission on or off. Changes take effect immediately.
            </p>

            {CONSENT_ITEMS.map(({ key, label, desc, icon: Icon }) => (
              <Card key={key} className="border">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
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
                Your identity verification and payment data are required by law (AML/PSD2) and cannot be removed.
                All other data is under your full control.
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
                    This is the profile used to match you with relevant tasks and offers. The more complete your profile, the higher your earnings potential.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-xs text-blue-800 leading-snug">
                This is the profile used to match you with relevant tasks and offers.
                <strong> More complete = higher earnings.</strong>
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
                      <User className="w-4 h-4 text-blue-500" /> Identity & Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <ProfileRow label="Name" value={profile.identity.name} />
                    <ProfileRow label="Email" value={profile.identity.email} />
                    <ProfileRow label="Phone" value={profile.identity.phone} />
                    <ProfileRow label="City" value={profile.identity.city} />
                    <ProfileRow label="District" value={profile.identity.district} />
                  </CardContent>
                </Card>

                {/* Demographic */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-500" /> Demographic Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <ProfileRow label="Age" value={profile.demographic.age} />
                    <ProfileRow label="Gender" value={profile.demographic.gender} />
                    <ProfileRow label="Income Level" value={profile.demographic.incomeLevel} />
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-muted-foreground text-sm">Tier</span>
                      <Badge variant="secondary" className="capitalize">{profile.demographic.tier}</Badge>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-muted-foreground text-sm">KYC Status</span>
                      <Badge variant={profile.demographic.kycStatus === 'verified' ? 'default' : 'secondary'} className="capitalize">
                        {profile.demographic.kycStatus}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Device Profile */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-green-500" /> Device Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <ProfileRow label="Device Model" value={profile.device.deviceModel} />
                    <ProfileRow label="OS" value={profile.device.deviceOs} />
                    <ProfileRow label="Device Tier" value={profile.device.deviceTier} />
                    <ProfileRow label="Network Carrier" value={profile.device.networkCarrier} />
                    <ProfileRow label="Connection" value={profile.device.connectionType} />
                  </CardContent>
                </Card>

                {/* Interests & Preferences */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4 text-orange-500" /> Interests & Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><p className="text-xs text-muted-foreground mb-1">Interests</p><TagChips tags={profile.psychographic.interests} /></div>
                    <div><p className="text-xs text-muted-foreground mb-1">Brand Affinity</p><TagChips tags={profile.psychographic.brandAffinity} /></div>
                    <div><p className="text-xs text-muted-foreground mb-1">Values</p><TagChips tags={profile.psychographic.values} /></div>
                    <ProfileRow label="Life Stage" value={profile.psychographic.lifeStage} />
                  </CardContent>
                </Card>

                {/* Behavioral Signals */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-pink-500" /> Behavioral Signals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ProfileRow label="Shopping Frequency" value={profile.behavioral.shoppingFrequency} />
                    <div><p className="text-xs text-muted-foreground mb-1">Preferred Stores</p><TagChips tags={profile.behavioral.preferredStores} /></div>
                    <div><p className="text-xs text-muted-foreground mb-1">Next Purchase Intent</p><TagChips tags={profile.behavioral.nextPurchaseIntent} /></div>
                    <ProfileRow label="Work Type" value={profile.behavioral.workType} />
                    <ProfileRow label="Home Ownership" value={profile.behavioral.homeOwnership} />
                    <ProfileRow label="Activity Pattern" value={profile.behavioral.activityPattern} />
                  </CardContent>
                </Card>

                {/* Engagement Stats */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-cyan-500" /> Engagement Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <ProfileRow label="Profile Strength" value={`${profile.engagement.profileStrength}%`} />
                    <ProfileRow label="Completed Tasks" value={profile.engagement.completedTasks} />
                    <ProfileRow label="Total Earnings" value={profile.engagement.totalEarnings} />
                    <ProfileRow label="Referral Influence Score" value={profile.engagement.influenceScore} />
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
              <h3 className="font-semibold">Download Your Data</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                GDPR Article 20 — You have the right to receive a copy of your data in a machine-readable format.
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
                Your export includes all personal and behavioral data we hold. Identity verification records
                are retained separately under AML law and are not included in this export.
              </p>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Limited to 3 downloads per 24 hours for your security.
            </p>
          </TabsContent>

          {/* ── Section 4: Delete My Account ──────────────────────────────────── */}
          <TabsContent value="delete" className="mt-4 space-y-4">
            <div className="text-center space-y-2 py-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="font-semibold">Delete My Account</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                GDPR Article 17 — Right to erasure. Your profile and behavioral data will be permanently deleted within 30 days.
              </p>
            </div>

            <Card className="border-red-100 bg-red-50/30">
              <CardContent className="pt-4 space-y-2">
                <div className="flex gap-2 items-start">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-800 space-y-1">
                    <p>• Your profile, preferences, and behavioral data will be deleted within <strong>30 days</strong>.</p>
                    <p>• Identity verification (KYC) records are retained for <strong>5–7 years</strong> as required by AML law.</p>
                    <p>• Your wallet balance must be <strong>zero</strong> before deletion can proceed.</p>
                    <p>• This action <strong>cannot be undone</strong>.</p>
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
              Request Account Deletion
            </Button>
          </TabsContent>
        </Tabs>

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

      {/* ── Delete Confirmation Modal ──────────────────────────────────────── */}
      <Dialog open={showDeleteModal} onOpenChange={(open) => { setShowDeleteModal(open); if (!open) setDeletePassword(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Confirm Account Deletion
            </DialogTitle>
            <DialogDescription className="pt-2 space-y-2 text-sm">
              <p>This will permanently delete your profile, preferences, and behavioral data within <strong>30 days</strong>.</p>
              <p>Your identity verification records will be retained for 5–7 years as required by AML law.</p>
              <p className="font-medium text-amber-700">Your wallet balance must be zero before deletion can proceed.</p>
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2">
            <Label htmlFor="del-password" className="text-sm font-medium">
              Enter your password to confirm
            </Label>
            <Input
              id="del-password"
              type="password"
              placeholder="Your account password"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDeleteRequest()}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRequest}
              disabled={!deletePassword || deleteLoading}
            >
              {deleteLoading ? 'Submitting...' : 'Yes, Request Deletion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}

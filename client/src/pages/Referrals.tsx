import { useState, useEffect } from 'react';
import { Share2, Copy, Users, TrendingUp, Gift } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  referrals: {
    total: number;
    totalRewards: number;
  };
}

interface Referral {
  id: number;
  email: string;
  name: string;
  completedTasks: number;
  createdAt: string;
  referrerReward: number;
  status: string;
}

export default function Referrals() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [referralList, setReferralList] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const [dataRes, listRes] = await Promise.all([
        fetch('/api/referrals/my-code'),
        fetch('/api/referrals/list')
      ]);

      const data = await dataRes.json();
      const list = await listRes.json();

      setReferralData(data);
      setReferralList(list.referrals || []);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = referralData 
    ? `${window.location.origin}/?ref=${referralData.referralCode}`
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = `Join TaskKash and earn money by completing simple tasks! Use my referral code: ${referralData?.referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const text = `Join TaskKash and start earning! Use my code: ${referralData?.referralCode}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Invite Friends & Earn Together</h1>
        <p className="text-muted-foreground">
          Share your referral code and earn 20 EGP for each friend who joins. They get 10 EGP too!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralData?.totalReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">Friends joined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralData?.totalEarnings?.toFixed(2) || '0.00'} EGP</div>
            <p className="text-xs text-muted-foreground">From referrals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reward Per Friend</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20 EGP</div>
            <p className="text-xs text-muted-foreground">You earn per referral</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
          <CardDescription>Share this code or link with your friends</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Referral Code</p>
              <p className="text-2xl font-bold tracking-wider">{referralData?.referralCode}</p>
            </div>
            <Button onClick={copyToClipboard} variant="outline" size="lg">
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 bg-muted p-3 rounded-lg">
              <p className="text-sm break-all">{shareUrl}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={shareOnWhatsApp} className="flex-1 min-w-[150px]" variant="default">
              <Share2 className="h-4 w-4 mr-2" />
              Share on WhatsApp
            </Button>
            <Button onClick={shareOnFacebook} className="flex-1 min-w-[150px]" variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share on Facebook
            </Button>
            <Button onClick={shareOnTwitter} className="flex-1 min-w-[150px]" variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share on Twitter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Share Your Code</h3>
              <p className="text-sm text-muted-foreground">Send your referral link to friends via WhatsApp, Facebook, or any platform</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">They Sign Up</h3>
              <p className="text-sm text-muted-foreground">Your friend registers using your code and gets 10 EGP welcome bonus</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">You Both Earn</h3>
              <p className="text-sm text-muted-foreground">You receive 20 EGP instantly! No limits on referrals</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral List */}
      {referralList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
            <CardDescription>People who joined using your code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referralList.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{referral.name || referral.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {referral.completedTasks} tasks completed • Joined {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+{referral.referrerReward} EGP</p>
                    <p className="text-xs text-muted-foreground capitalize">{referral.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

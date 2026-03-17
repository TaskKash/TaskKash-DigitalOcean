import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, Eye, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Campaign {
  id: number;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  budget: number;
  reward: number;
  status: string;
  approvalStatus: string;
  adminReviewNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  advertiserName: string;
  advertiserNameAr: string;
  advertiserLogo: string | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  revision_requested: 'bg-blue-100 text-blue-800',
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  revision_requested: AlertTriangle,
};

export default function AdminCampaignReview() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'revision' | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, [activeTab]);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const url = activeTab === 'all' 
        ? '/api/admin/campaigns'
        : `/api/admin/campaigns?approvalStatus=${activeTab}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const getCsrfToken = async () => {
    try {
      const res = await fetch('/api/csrf-token');
      const data = await res.json();
      return data.csrfToken;
    } catch { return null; }
  };

  const handleAction = async () => {
    if (!selectedCampaign || !actionType) return;
    if ((actionType === 'reject' || actionType === 'revision') && !notes.trim()) {
      toast.error('Please provide notes for this action');
      return;
    }

    setIsSubmitting(true);
    try {
      const csrfToken = await getCsrfToken();
      const endpoint = actionType === 'approve' 
        ? `/api/admin/campaigns/${selectedCampaign.id}/approve`
        : actionType === 'reject'
        ? `/api/admin/campaigns/${selectedCampaign.id}/reject`
        : `/api/admin/campaigns/${selectedCampaign.id}/request-revision`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
        },
        body: JSON.stringify({ notes: notes || undefined }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setSelectedCampaign(null);
        setActionType(null);
        setNotes('');
        fetchCampaigns();
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch (error) {
      toast.error('Failed to perform action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = campaigns.filter(c => c.approvalStatus === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaign Review</h1>
          <p className="text-muted-foreground">Review and approve advertiser campaigns before they go live</p>
        </div>
        <Button variant="outline" onClick={fetchCampaigns} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="revision_requested">Revision</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <Card className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Loading campaigns...</p>
            </Card>
          ) : campaigns.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
              <p className="text-muted-foreground">No campaigns to review</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {campaigns.map(campaign => {
                const StatusIcon = statusIcons[campaign.approvalStatus] || Clock;
                return (
                  <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {campaign.advertiserLogo ? (
                            <img src={campaign.advertiserLogo} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {campaign.advertiserName?.[0] || '?'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg">{campaign.nameEn}</h3>
                            <p className="text-sm text-muted-foreground">by {campaign.advertiserName}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{campaign.descriptionEn}</p>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span>Budget: <strong>${campaign.budget}</strong></span>
                              <span>Reward: <strong>${campaign.reward}</strong></span>
                              <span>Status: <strong>{campaign.status}</strong></span>
                            </div>
                            {campaign.adminReviewNotes && (
                              <div className="mt-2 p-2 bg-muted rounded text-xs">
                                <strong>Admin Notes:</strong> {campaign.adminReviewNotes}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={statusColors[campaign.approvalStatus] || 'bg-gray-100'}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {campaign.approvalStatus.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </span>

                          {campaign.approvalStatus === 'pending' && (
                            <div className="flex gap-1 mt-2">
                              <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700"
                                onClick={() => { setSelectedCampaign(campaign); setActionType('approve'); setNotes(''); }}>
                                <CheckCircle className="w-3 h-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="destructive"
                                onClick={() => { setSelectedCampaign(campaign); setActionType('reject'); setNotes(''); }}>
                                <XCircle className="w-3 h-3 mr-1" /> Reject
                              </Button>
                              <Button size="sm" variant="outline"
                                onClick={() => { setSelectedCampaign(campaign); setActionType('revision'); setNotes(''); }}>
                                <AlertTriangle className="w-3 h-3 mr-1" /> Revision
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={!!actionType && !!selectedCampaign} onOpenChange={() => { setActionType(null); setSelectedCampaign(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && '✅ Approve Campaign'}
              {actionType === 'reject' && '❌ Reject Campaign'}
              {actionType === 'revision' && '⚠️ Request Revision'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <p className="text-sm text-muted-foreground">
              Campaign: <strong>{selectedCampaign?.nameEn}</strong> by {selectedCampaign?.advertiserName}
            </p>
            <Textarea
              placeholder={actionType === 'approve' ? 'Optional notes...' : 'Provide reason (required)...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionType(null); setSelectedCampaign(null); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction} 
              disabled={isSubmitting}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {isSubmitting ? 'Processing...' : `Confirm ${actionType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

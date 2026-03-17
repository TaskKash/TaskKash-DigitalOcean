import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ShieldAlert, CheckCircle, Scale, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Dispute {
  id: number;
  taskCompletionId: number;
  campaignId: number;
  campaignName: string;
  userName: string;
  userEmail: string;
  advertiserName: string;
  reason: string;
  evidence: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  open: 'bg-amber-100 text-amber-800',
  under_review: 'bg-blue-100 text-blue-800',
  resolved_user: 'bg-green-100 text-green-800',
  resolved_advertiser: 'bg-green-100 text-green-800',
  dismissed: 'bg-gray-100 text-gray-800',
};

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [activeTab]);

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      const url = activeTab === 'all' 
        ? '/api/admin/disputes'
        : `/api/admin/disputes?status=${activeTab}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setDisputes(data.disputes || []);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast.error('Failed to load disputes');
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
    if (!selectedDispute || !actionType) return;
    
    setIsSubmitting(true);
    try {
      const csrfToken = await getCsrfToken();
      
      const res = await fetch(`/api/admin/disputes/${selectedDispute.id}/resolve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
        },
        body: JSON.stringify({ resolution: actionType, adminNotes: notes || undefined }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setSelectedDispute(null);
        setActionType(null);
        setNotes('');
        fetchDisputes();
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch (error) {
      toast.error('Failed to perform action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCount = disputes.filter(d => d.status === 'open' || d.status === 'under_review').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dispute Resolution</h1>
          <p className="text-muted-foreground">Arbitrate disputes between users and advertisers</p>
        </div>
        <Button variant="outline" onClick={fetchDisputes} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="open" className="relative">
            Open
            {openCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {openCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved_user">Resolved for User</TabsTrigger>
          <TabsTrigger value="resolved_advertiser">Resolved for Adv</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <Card className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Loading disputes...</p>
            </Card>
          ) : disputes.length === 0 ? (
            <Card className="p-8 text-center">
              <Scale className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No disputes found</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {disputes.map(dispute => (
                <Card key={dispute.id} className="hover:shadow-md transition-shadow border-l-4" style={{borderLeftColor: dispute.status === 'open' ? '#f59e0b' : '#10b981'}}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">ID: #{dispute.id}</Badge>
                          <Badge className={statusColors[dispute.status] || 'bg-gray-100'}>
                            {dispute.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(dispute.createdAt).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                          <div>
                            <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">User</p>
                            <p className="font-medium">{dispute.userName}</p>
                            <p className="text-xs text-muted-foreground">{dispute.userEmail}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Campaign</p>
                            <p className="font-medium">{dispute.campaignName}</p>
                            <p className="text-xs text-muted-foreground">by {dispute.advertiserName}</p>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-red-500/5 border border-red-500/20 rounded-md">
                          <p className="text-sm font-semibold text-red-700 flex items-center gap-1 mb-1">
                            <ShieldAlert className="w-4 h-4"/> Complaint Reason:
                          </p>
                          <p className="text-sm">{dispute.reason}</p>
                          {dispute.evidence && (
                            <div className="mt-2 text-xs">
                              <span className="font-semibold">Evidence provided:</span> {dispute.evidence}
                            </div>
                          )}
                        </div>

                        {dispute.adminNotes && (
                          <div className="mt-2 p-2 bg-muted rounded text-xs border">
                            <strong>Resolution Notes:</strong> {dispute.adminNotes}
                          </div>
                        )}
                      </div>
                      
                      {dispute.status === 'open' && (
                        <div className="flex flex-col gap-2 min-w-[140px]">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700"
                            onClick={() => { setSelectedDispute(dispute); setActionType('resolved_user'); setNotes(''); }}>
                            <CheckCircle className="w-3 h-3 mr-1" /> Side with User
                          </Button>
                          <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50"
                            onClick={() => { setSelectedDispute(dispute); setActionType('resolved_advertiser'); setNotes(''); }}>
                            <CheckCircle className="w-3 h-3 mr-1" /> Side with Adv
                          </Button>
                          <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            onClick={() => { setSelectedDispute(dispute); setActionType('dismissed'); setNotes(''); }}>
                            Dismiss Dispute
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={!!actionType && !!selectedDispute} onOpenChange={() => { setActionType(null); setSelectedDispute(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'resolved_user' && '✅ Resolve in favor of User (Pay User)'}
              {actionType === 'resolved_advertiser' && '🛡️ Resolve in favor of Advertiser (Reject Task)'}
              {actionType === 'dismissed' && '⛔ Dismiss Dispute (No action)'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <Textarea
              placeholder="Resolution notes / reasoning..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionType(null); setSelectedDispute(null); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : `Confirm Resolution`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

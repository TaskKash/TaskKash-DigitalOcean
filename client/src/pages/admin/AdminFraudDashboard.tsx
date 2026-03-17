import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ShieldAlert, AlertTriangle, CheckCircle, Search, UserX } from 'lucide-react';
import { toast } from 'sonner';

interface FraudFlag {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  campaignId: number;
  campaignName: string;
  flagType: string;
  severity: string;
  details: any;
  status: string;
  adminNotes: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  investigating: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  resolved_innocent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  resolved_guilty: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  investigating: 'Investigating',
  resolved_innocent: 'Innocent',
  resolved_guilty: 'Guilty'
};

const severityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
};

export default function AdminFraudDashboard() {
  const [flags, setFlags] = useState<FraudFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedFlag, setSelectedFlag] = useState<FraudFlag | null>(null);
  const [resolutionState, setResolutionState] = useState<{status: string, notes: string}>({ status: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFlags();
  }, [filter]);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' ? '/api/admin/fraud' : `/api/admin/fraud?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setFlags(data.flags);
      } else {
        toast.error('Failed to fetch fraud flags');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedFlag || !resolutionState.status) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/fraud/${selectedFlag.id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: resolutionState.status,
          adminNotes: resolutionState.notes
        })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Fraud flag resolved successfully');
        setSelectedFlag(null);
        fetchFlags();
      } else {
        toast.error(data.error || 'Failed to resolve flag');
      }
    } catch (err) {
      toast.error('Error submitting resolution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openResolveModal = (flag: FraudFlag, status: string) => {
    setSelectedFlag(flag);
    setResolutionState({ status, notes: '' });
  };

  return (
    <AdminLayout title="Fraud Detection">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Fraud Dashboard</h2>
            <p className="text-muted-foreground">Monitor and resolve suspicious user activities</p>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full" onValueChange={setFilter}>
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="resolved_innocent">Innocent</TabsTrigger>
            <TabsTrigger value="resolved_guilty">Guilty</TabsTrigger>
            <TabsTrigger value="all">All Flags</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            {loading ? (
              <div className="text-center py-10">Loading fraud flags...</div>
            ) : flags.length === 0 ? (
              <Card className="p-10 text-center flex flex-col items-center justify-center text-muted-foreground">
                <ShieldAlert className="w-12 h-12 mb-4 text-green-500 opacity-50" />
                <p>No fraud flags found in this category.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {flags.map((flag) => (
                  <Card key={flag.id} className="p-5 overflow-hidden flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{flag.flagType.replace('_', ' ').toUpperCase()}</h3>
                            <Badge className={severityColors[flag.severity] || severityColors.low}>
                              {flag.severity} severity
                            </Badge>
                            <Badge className={statusColors[flag.status] || statusColors.pending}>
                              {statusLabels[flag.status] || flag.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Flagged on {new Date(flag.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-muted/50 p-3 rounded-md">
                          <p className="font-semibold mb-1 flex items-center gap-1">
                            <UserX className="w-4 h-4" /> User Details
                          </p>
                          <p>ID: {flag.userId}</p>
                          <p>Name: {flag.userName || 'Unknown'}</p>
                          <p className="text-muted-foreground">{flag.userEmail || 'No email'}</p>
                        </div>
                        
                        <div className="bg-muted/50 p-3 rounded-md">
                          <p className="font-semibold mb-1">Campaign Info</p>
                          {flag.campaignId ? (
                            <>
                              <p>ID: {flag.campaignId}</p>
                              <p className="truncate">Name: {flag.campaignName || 'Unknown Campaign'}</p>
                            </>
                          ) : (
                            <p className="text-muted-foreground">Not tied to a specific campaign</p>
                          )}
                        </div>
                      </div>

                      {flag.details && (
                        <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-md border border-red-100 dark:border-red-900/30">
                          <p className="font-semibold text-red-800 dark:text-red-400 mb-1 text-sm">Trigger Details</p>
                          <pre className="text-xs text-red-700 dark:text-red-300 overflow-x-auto">
                            {typeof flag.details === 'string' 
                              ? JSON.stringify(JSON.parse(flag.details), null, 2)
                              : JSON.stringify(flag.details, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {flag.adminNotes && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md border border-blue-100 dark:border-blue-900/30">
                          <p className="font-semibold text-blue-800 dark:text-blue-400 mb-1 text-sm">Admin Notes</p>
                          <p className="text-sm">{flag.adminNotes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col justify-center gap-2 md:w-48 border-t md:border-t-0 md:border-l pt-4 md:pt-0 pl-0 md:pl-6 border-border">
                      {flag.status === 'pending' || flag.status === 'investigating' ? (
                        <>
                          <Button 
                            variant="outline"
                            className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                            onClick={() => openResolveModal(flag, 'resolved_innocent')}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Innocent
                          </Button>
                          <Button 
                            variant="destructive"
                            className="w-full justify-start"
                            onClick={() => openResolveModal(flag, 'resolved_guilty')}
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Mark Guilty
                          </Button>
                        </>
                      ) : (
                        <div className="text-center text-sm text-muted-foreground p-4 bg-muted/30 rounded-md">
                          Resolved
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </div>

      <Dialog open={!!selectedFlag} onOpenChange={(open) => !open && setSelectedFlag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {resolutionState.status === 'resolved_guilty' 
                ? 'Confirm Fraudulent Activity' 
                : 'Clear Fraud Flag'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {resolutionState.status === 'resolved_guilty'
                ? "You are about to mark this user's activity as definitively fraudulent. This will reject the related task submission and may flag the user's account."
                : "You are about to clear this fraud flag, marking the activity as innocent. This will approve the related task submission."}
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Notes (Required)</label>
              <Textarea 
                placeholder="Explain the reasoning for this resolution..."
                value={resolutionState.notes}
                onChange={(e) => setResolutionState({ ...resolutionState, notes: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFlag(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              variant={resolutionState.status === 'resolved_guilty' ? 'destructive' : 'default'}
              onClick={handleResolve} 
              disabled={!resolutionState.notes.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Confirm Resolution'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

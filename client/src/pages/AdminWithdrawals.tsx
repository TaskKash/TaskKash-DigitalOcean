import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Eye, Clock, DollarSign, User } from 'lucide-react';
import { useCurrency } from "@/contexts/CurrencyContext";


interface WithdrawalRequest {
  id: number;
  userId: number;
  amount: number;
  paymentMethod: string;
  accountDetails: any;
  status: string;
  createdAt: string;
  processedAt?: string;
  adminNotes?: string;
  user?: {
    nameEn: string;
    email: string;
  };
}

export default function AdminWithdrawals() {
  const { currency, symbol, formatAmount } = useCurrency();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);


  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch('/api/admin/withdrawals', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data.withdrawals || []);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      alert('Error: Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedWithdrawal) return;
    
    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/withdrawals/${selectedWithdrawal.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ adminNotes }),
      });

      if (response.ok) {
        alert('Success: Withdrawal request approved');
        setShowApproveDialog(false);
        setAdminNotes('');
        fetchWithdrawals();
      } else {
        throw new Error('Failed to approve');
      }
    } catch (error) {
      alert('Error: Failed to approve withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;
    
    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/withdrawals/${selectedWithdrawal.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ adminNotes }),
      });

      if (response.ok) {
        alert('Success: Withdrawal request rejected');
        setShowRejectDialog(false);
        setAdminNotes('');
        fetchWithdrawals();
      } else {
        throw new Error('Failed to reject');
      }
    } catch (error) {
      alert('Error: Failed to reject withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'default',
      approved: 'secondary',
      rejected: 'destructive',
      completed: 'outline',
    };
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  const filterByStatus = (status: string) => {
    return withdrawals.filter(w => w.status === status);
  };

  const WithdrawalCard = ({ withdrawal }: { withdrawal: WithdrawalRequest }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-4 h-4" />
              {withdrawal.user?.nameEn || `User #${withdrawal.userId}`}
            </CardTitle>
            <CardDescription>{withdrawal.user?.email}</CardDescription>
          </div>
          {getStatusBadge(withdrawal.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="font-semibold flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {parseFloat(withdrawal.amount.toString()).toFixed(2)} {symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Payment Method:</span>
            <span className="font-medium">{withdrawal.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Requested:</span>
            <span className="text-sm flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(withdrawal.createdAt).toLocaleString()}
            </span>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedWithdrawal(withdrawal);
                setShowDetailsDialog(true);
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              Details
            </Button>
            
            {withdrawal.status === 'pending' && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setSelectedWithdrawal(withdrawal);
                    setShowApproveDialog(true);
                  }}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedWithdrawal(withdrawal);
                    setShowRejectDialog(true);
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Withdrawal Management</h1>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({filterByStatus('pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({filterByStatus('approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({filterByStatus('rejected').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({filterByStatus('completed').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {filterByStatus('pending').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No pending withdrawal requests
              </CardContent>
            </Card>
          ) : (
            filterByStatus('pending').map(w => <WithdrawalCard key={w.id} withdrawal={w} />)
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {filterByStatus('approved').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No approved withdrawals
              </CardContent>
            </Card>
          ) : (
            filterByStatus('approved').map(w => <WithdrawalCard key={w.id} withdrawal={w} />)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {filterByStatus('rejected').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No rejected withdrawals
              </CardContent>
            </Card>
          ) : (
            filterByStatus('rejected').map(w => <WithdrawalCard key={w.id} withdrawal={w} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {filterByStatus('completed').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No completed withdrawals
              </CardContent>
            </Card>
          ) : (
            filterByStatus('completed').map(w => <WithdrawalCard key={w.id} withdrawal={w} />)
          )}
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-3">
              <div>
                <span className="font-semibold">User:</span> {selectedWithdrawal.user?.nameEn}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {selectedWithdrawal.user?.email}
              </div>
              <div>
                <span className="font-semibold">Amount:</span> {parseFloat(selectedWithdrawal.amount.toString()).toFixed(2)} {symbol}
              </div>
              <div>
                <span className="font-semibold">Payment Method:</span> {selectedWithdrawal.paymentMethod}
              </div>
              <div>
                <span className="font-semibold">Account Details:</span>
                <pre className="mt-2 p-3 bg-muted rounded text-sm">
                  {JSON.stringify(selectedWithdrawal.accountDetails, null, 2)}
                </pre>
              </div>
              {selectedWithdrawal.adminNotes && (
                <div>
                  <span className="font-semibold">Admin Notes:</span>
                  <p className="mt-1 text-sm">{selectedWithdrawal.adminNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Withdrawal</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this withdrawal request for{' '}
              {selectedWithdrawal && parseFloat(selectedWithdrawal.amount.toString()).toFixed(2)} {symbol}?
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium">Admin Notes (Optional)</label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any notes about this approval..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? 'Processing...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this withdrawal request? The amount will be refunded to the user's wallet.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium">Reason for Rejection (Required)</label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Explain why this withdrawal is being rejected..."
              className="mt-2"
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={processing || !adminNotes.trim()}
            >
              {processing ? 'Processing...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Key, Search, UserCheck, UserX, ArrowLeft, UserPlus, AlertTriangle, ShieldAlert, Target } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useCurrency } from "@/contexts/CurrencyContext";

interface User {
  id: number;
  openId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  balance: number;
  completedTasks: number;
  totalEarnings: number;
  tier: string;
  profileStrength: number;
  isVerified: number;
  createdAt: string;
  failedTasks?: number;
  fraudFlag?: string;
}

export default function UsersManagementNew() {
  const { currency, symbol, formatAmount } = useCurrency();
  const [, setLocation] = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<any>({});
  const [newPassword, setNewPassword] = useState('');
  const [editForm, setEditForm] = useState<Partial<User>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        // Enriched with mock data for Admin CRM view
        const enrichedUsers = data.users.map((user: User) => {
          const failed = Math.floor(Math.random() * 20);
          const ratio = user.completedTasks / (user.completedTasks + failed || 1);
          let flag = '';
          if (ratio < 0.3 && (user.completedTasks + failed) > 10) flag = 'High Failure Rate';
          if (user.balance > 10000 && user.completedTasks < 5) flag = 'Suspicious Balance';
          
          return {
            ...user,
            failedTasks: failed,
            fraudFlag: flag
          };
        });
        setUsers(enrichedUsers);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm(user);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
        setEditDialogOpen(false);
        alert('User updated successfully!');
      } else {
        alert('Failed to update user: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user');
    }
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
        setDeleteDialogOpen(false);
        alert('User deleted successfully!');
      } else {
        alert('Failed to delete user: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setPasswordDialogOpen(true);
  };

  const handleCreate = () => {
    setCreateForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      balance: 0,
      tier: 'tier1',
      isVerified: 0,
      profileStrength: 0,
    });
    setCreateDialogOpen(true);
  };

  const confirmCreate = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      alert('Name, email, and password are required');
      return;
    }

    if (createForm.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createForm),
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
        setCreateDialogOpen(false);
        setCreateForm({});
        alert('User created successfully!');
      } else {
        alert('Failed to create user: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user');
    }
  };

  const confirmResetPassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();
      if (data.success) {
        setPasswordDialogOpen(false);
        setNewPassword('');
        alert('Password reset successfully!');
      } else {
        alert('Failed to reset password: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to reset password:', error);
      alert('Failed to reset password');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/admin/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <LanguageSwitcher />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-2">Manage all users, edit details, and reset passwords</p>
        </div>

        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Card className="px-4 py-2 border-l-4 border-l-blue-500 shadow-sm flex items-center gap-3">
              <div className="p-1.5 bg-blue-100 rounded-lg"><Target className="w-4 h-4 text-blue-600" /></div>
              <div>
                <div className="text-xs text-muted-foreground leading-tight">Total Taskers</div>
                <div className="font-bold leading-tight">{users.length.toLocaleString()}</div>
              </div>
            </Card>
            <Card className="px-4 py-2 border-l-4 border-l-red-500 shadow-sm flex items-center gap-3">
              <div className="p-1.5 bg-red-100 rounded-lg"><ShieldAlert className="w-4 h-4 text-red-600" /></div>
              <div>
                <div className="text-xs text-muted-foreground leading-tight">Flagged Accounts</div>
                <div className="font-bold leading-tight text-red-600">{users.filter(u => u.fraudFlag).length}</div>
              </div>
            </Card>
          </div>
          <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Create New User
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Financials</TableHead>
                  <TableHead>Task Ratio (Pass/Fail)</TableHead>
                  <TableHead>Tier & Status</TableHead>
                  <TableHead>Fraud Engine</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const totalTasks = user.completedTasks + (user.failedTasks || 0);
                  const passRate = totalTasks > 0 ? Math.round((user.completedTasks / totalTasks) * 100) : 0;
                  
                  return (
                  <TableRow key={user.id} className={user.fraudFlag ? "bg-red-50/30" : ""}>
                    <TableCell className="font-medium text-gray-500">#{user.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{user.email}</div>
                      <div className="text-xs text-muted-foreground">{user.phone}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-green-700">{user.balance.toLocaleString()} {symbol}</div>
                      <div className="text-xs text-muted-foreground">Lifetime: {user.totalEarnings?.toLocaleString() || 0} {symbol}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-green-600" title="Completed">{user.completedTasks}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-sm font-medium text-red-600" title="Failed">{user.failedTasks || 0}</span>
                      </div>
                      <div className="w-24 h-1.5 bg-red-100 rounded-full overflow-hidden">
                        <style>{`.w-dyn-${user.id} { width: ${passRate}%; }`}</style>
                        <div className={`h-full bg-green-500 w-dyn-${user.id}`} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${
                          user.tier === 'platinum' ? 'bg-slate-200 text-slate-800' :
                          user.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                          user.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {user.tier}
                        </Badge>
                        {user.isVerified ? (
                          <span className="text-[10px] text-green-600 flex items-center gap-1"><UserCheck className="w-3 h-3"/> KYC Verified</span>
                        ) : (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1"><UserX className="w-3 h-3"/> Unverified</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.fraudFlag ? (
                        <div className="flex items-center gap-1.5 text-red-600 text-xs font-semibold bg-red-100 px-2 py-1 rounded max-w-fit">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {user.fraudFlag}
                        </div>
                      ) : (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Clear</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetPassword(user)}
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and settings
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="balance">Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  value={editForm.balance || 0}
                  onChange={(e) => setEditForm({ ...editForm, balance: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                  <Label htmlFor="tier">Tier</Label>
                  <select
                    id="tier"
                    title="User Tier"
                    className="w-full border rounded px-3 py-2"
                  value={editForm.tier || ''}
                  onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })}
                >
                  <option value="tier1">Bronze</option>
                  <option value="tier2">Silver</option>
                  <option value="tier3">Gold</option>
                  <option value="tier4">Platinum</option>
                </select>
              </div>
              <div>
                <Label htmlFor="profileStrength">Profile Strength (%)</Label>
                <Input
                  id="profileStrength"
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.profileStrength || 0}
                  onChange={(e) => setEditForm({ ...editForm, profileStrength: parseInt(e.target.value) })}
                />
              </div>
              <div className="col-span-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    title="Verify User"
                    checked={editForm.isVerified === 1}
                    onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked ? 1 : 0 })}
                  />
                  Verified User
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="create-name">Name *</Label>
                <Input
                  id="create-name"
                  value={createForm.name || ''}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email || ''}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="create-password">Password *</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createForm.password || ''}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <Label htmlFor="create-phone">Phone</Label>
                <Input
                  id="create-phone"
                  value={createForm.phone || ''}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="+20..."
                />
              </div>
              <div>
                <Label htmlFor="create-balance">Initial Balance</Label>
                <Input
                  id="create-balance"
                  type="number"
                  value={createForm.balance || 0}
                  onChange={(e) => setCreateForm({ ...createForm, balance: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                  <Label htmlFor="create-tier">Tier</Label>
                  <select
                    id="create-tier"
                    title="User Tier"
                    className="w-full border rounded px-3 py-2"
                  value={createForm.tier || 'tier1'}
                  onChange={(e) => setCreateForm({ ...createForm, tier: e.target.value })}
                >
                  <option value="tier1">Bronze</option>
                  <option value="tier2">Silver</option>
                  <option value="tier3">Gold</option>
                  <option value="tier4">Platinum</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    title="Verify User"
                    checked={createForm.isVerified === 1}
                    onChange={(e) => setCreateForm({ ...createForm, isVerified: e.target.checked ? 1 : 0 })}
                  />
                  Verified User
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmCreate}>
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Password Reset Dialog */}
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Set a new password for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmResetPassword} disabled={newPassword.length < 6}>
                Reset Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

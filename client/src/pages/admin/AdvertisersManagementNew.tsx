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
import { Edit, Trash2, Key, Search, CheckCircle, XCircle, ArrowLeft, Building2, PlayCircle, AlertTriangle, DollarSign } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface Advertiser {
  id: number;
  email: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
  totalSpent?: number;
  activeCampaigns?: number;
}

const mockPendingCampaigns = [
  { id: 'CMP-001', advertiser: 'Samsung Egypt', title: 'Galaxy S25 Launch', type: 'Video', budget: '50,000 EGP', status: 'pending' },
  { id: 'CMP-002', advertiser: 'Vodafone', title: 'Summer Offer', type: 'App Install', budget: '120,000 EGP', status: 'reviewing' },
];

export default function AdvertisersManagementNew() {
  const [, setLocation] = useLocation();
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<Advertiser | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<any>({});
  const [newPassword, setNewPassword] = useState('');
  const [editForm, setEditForm] = useState<Partial<Advertiser>>({});

  useEffect(() => {
    fetchAdvertisers();
  }, []);

  const getCsrfToken = async (): Promise<string> => {
    try {
      const r = await fetch('/api/csrf-token', { credentials: 'include' });
      const data = await r.json();
      return data.csrfToken || '';
    } catch {
      return '';
    }
  };

  const fetchAdvertisers = async () => {
    try {
      const response = await fetch('/api/admin/advertisers', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        // Enriched with mock data for CRM view
        const enrichedAdvertisers = data.advertisers.map((adv: Advertiser) => ({
          ...adv,
          totalSpent: Math.floor(Math.random() * 500000),
          activeCampaigns: Math.floor(Math.random() * 5),
        }));
        setAdvertisers(enrichedAdvertisers);
      }
    } catch (error) {
      console.error('Failed to fetch advertisers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (advertiser: Advertiser) => {
    setSelectedAdvertiser(advertiser);
    setEditForm(advertiser);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedAdvertiser) return;

    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/admin/advertisers/${selectedAdvertiser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });

      const data = await response.json();
      if (data.success) {
        fetchAdvertisers();
        setEditDialogOpen(false);
        alert('Advertiser updated successfully!');
      } else {
        alert('Failed to update advertiser: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to update advertiser:', error);
      alert('Failed to update advertiser');
    }
  };

  const handleDelete = (advertiser: Advertiser) => {
    setSelectedAdvertiser(advertiser);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAdvertiser) return;

    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/admin/advertisers/${selectedAdvertiser.id}`, {
        method: 'DELETE',
        headers: { 'x-csrf-token': csrfToken },
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        fetchAdvertisers();
        setDeleteDialogOpen(false);
        alert('Advertiser deleted successfully!');
      } else {
        alert('Failed to delete advertiser: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to delete advertiser:', error);
      alert('Failed to delete advertiser');
    }
  };

  const handleResetPassword = (advertiser: Advertiser) => {
    setSelectedAdvertiser(advertiser);
    setNewPassword('');
    setPasswordDialogOpen(true);
  };

  const handleCreate = () => {
    setCreateForm({
      nameEn: '',
      nameAr: '',
      email: '',
      password: '',
      slug: '',
      isActive: 1,
    });
    setCreateDialogOpen(true);
  };

  const confirmCreate = async () => {
    if (!createForm.nameEn || !createForm.email || !createForm.password) {
      alert('English name, email, and password are required');
      return;
    }

    if (createForm.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch('/api/admin/advertisers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        credentials: 'include',
        body: JSON.stringify(createForm),
      });

      const data = await response.json();
      if (data.success) {
        fetchAdvertisers();
        setCreateDialogOpen(false);
        setCreateForm({});
        alert('Advertiser created successfully!');
      } else {
        alert('Failed to create advertiser: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to create advertiser:', error);
      alert('Failed to create advertiser');
    }
  };

  const confirmResetPassword = async () => {
    if (!selectedAdvertiser || !newPassword) return;

    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/admin/advertisers/${selectedAdvertiser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
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

  const filteredAdvertisers = advertisers.filter(advertiser =>
    advertiser.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advertiser.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advertiser.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading advertisers...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Advertisers Management</h1>
          <p className="text-gray-600 mt-2">Manage all advertisers, edit details, and reset passwords</p>
        </div>

        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Card className="px-4 py-2 border-l-4 border-l-purple-500 shadow-sm">
              <span className="text-sm text-muted-foreground mr-2">Total Advertisers:</span>
              <span className="font-bold">{advertisers.length}</span>
            </Card>
            <Card className="px-4 py-2 border-l-4 border-l-green-500 shadow-sm">
              <span className="text-sm text-muted-foreground mr-2">Total Spend:</span>
              <span className="font-bold">1,240,000 EGP</span>
            </Card>
          </div>
          <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
            <Building2 className="w-4 h-4 mr-2" />
            Create New Advertiser
          </Button>
        </div>

        {/* Campaign Moderation Hub */}
        <Card className="p-0 mb-8 border-orange-200 overflow-hidden shadow-sm">
          <div className="bg-orange-50 border-b border-orange-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-orange-600 w-5 h-5" />
              <h2 className="text-lg font-semibold text-orange-900">Campaign Moderation Queue</h2>
            </div>
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-none">2 Pending Review</Badge>
          </div>
          <div className="divide-y divide-border">
            {mockPendingCampaigns.map(camp => (
              <div key={camp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="mb-3 sm:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{camp.title}</span>
                    <Badge variant="outline" className="text-[10px] uppercase">{camp.type}</Badge>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">{camp.budget}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> {camp.advertiser} • ID: {camp.id}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">View Details</Button>
                  <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </Card>

        {/* Advertisers Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Advertiser</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active Campaigns</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvertisers.map((advertiser) => (
                  <TableRow key={advertiser.id}>
                    <TableCell className="font-medium text-gray-500">{advertiser.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{advertiser.nameEn}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{advertiser.email}</div>
                    </TableCell>
                    <TableCell>
                      {advertiser.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-medium">
                        <PlayCircle className="w-4 h-4 text-purple-500" />
                        {advertiser.activeCampaigns || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-bold text-green-700">
                        <DollarSign className="w-4 h-4" />
                        {advertiser.totalSpent?.toLocaleString() || 0} EGP
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(advertiser.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(advertiser)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetPassword(advertiser)}
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(advertiser)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Advertiser</DialogTitle>
              <DialogDescription>
                Update advertiser information and settings
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="nameEn">Name (English)</Label>
                <Input
                  id="nameEn"
                  value={editForm.nameEn || ''}
                  onChange={(e) => setEditForm({ ...editForm, nameEn: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="nameAr">Name (Arabic)</Label>
                <Input
                  id="nameAr"
                  value={editForm.nameAr || ''}
                  onChange={(e) => setEditForm({ ...editForm, nameAr: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={editForm.slug || ''}
                  onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                  placeholder="advertiser-slug"
                />
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    checked={editForm.isActive === 1}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked ? 1 : 0 })}
                    title="Active Advertiser"
                  />
                  <Label htmlFor="edit-isActive">Active Advertiser</Label>
                </div>
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
              <DialogTitle>Delete Advertiser</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedAdvertiser?.nameEn}? This action cannot be undone.
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

        {/* Create Advertiser Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Advertiser</DialogTitle>
              <DialogDescription>
                Add a new advertiser to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="create-nameEn">Name (English) *</Label>
                <Input
                  id="create-nameEn"
                  value={createForm.nameEn || ''}
                  onChange={(e) => setCreateForm({ ...createForm, nameEn: e.target.value })}
                  placeholder="Advertiser name in English"
                />
              </div>
              <div>
                <Label htmlFor="create-nameAr">Name (Arabic)</Label>
                <Input
                  id="create-nameAr"
                  value={createForm.nameAr || ''}
                  onChange={(e) => setCreateForm({ ...createForm, nameAr: e.target.value })}
                  placeholder="اسم المعلن بالعربية"
                />
              </div>
              <div className="col-span-2">
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
                <Label htmlFor="create-slug">Slug</Label>
                <Input
                  id="create-slug"
                  value={createForm.slug || ''}
                  onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                  placeholder="advertiser-slug (auto-generated if empty)"
                />
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="create-isActive"
                    checked={createForm.isActive === 1}
                    onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked ? 1 : 0 })}
                    title="Active Advertiser"
                  />
                  <Label htmlFor="create-isActive">Active Advertiser</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmCreate}>
                Create Advertiser
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
                Set a new password for {selectedAdvertiser?.nameEn}
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

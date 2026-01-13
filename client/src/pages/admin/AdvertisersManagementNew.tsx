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
import { Edit, Trash2, Key, Search, CheckCircle, XCircle, ArrowLeft, Building2 } from 'lucide-react';
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
}

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

  const fetchAdvertisers = async () => {
    try {
      const response = await fetch('/api/admin/advertisers', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setAdvertisers(data.advertisers);
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
      const response = await fetch(`/api/admin/advertisers/${selectedAdvertiser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch(`/api/admin/advertisers/${selectedAdvertiser.id}`, {
        method: 'DELETE',
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
      const response = await fetch('/api/admin/advertisers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch(`/api/admin/advertisers/${selectedAdvertiser.id}/reset-password`, {
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
          <div></div>
          <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
            <Building2 className="w-4 h-4 mr-2" />
            Create New Advertiser
          </Button>
        </div>

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
                  <TableHead>Name (EN)</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvertisers.map((advertiser) => (
                  <TableRow key={advertiser.id}>
                    <TableCell className="font-medium">{advertiser.id}</TableCell>
                    <TableCell>{advertiser.nameEn}</TableCell>
                    <TableCell>{advertiser.email}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {advertiser.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      {advertiser.isActive ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="w-4 h-4" />
                          Inactive
                        </span>
                      )}
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
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.isActive === 1}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked ? 1 : 0 })}
                  />
                  Active Advertiser
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
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={createForm.isActive === 1}
                    onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked ? 1 : 0 })}
                  />
                  Active Advertiser
                </Label>
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

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: 'user' | 'admin';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  isVerified: number;
}

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    role: 'user' as 'user' | 'admin',
    tier: 'bronze' as 'bronze' | 'silver' | 'gold' | 'platinum',
    isVerified: 0,
  });

  const updateUserMutation = trpc.user.updateUser.useMutation();

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role,
        tier: user.tier,
        isVerified: user.isVerified,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      await updateUserMutation.mutateAsync({
        userId: user.id,
        name: formData.name || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        role: formData.role,
        tier: formData.tier,
        isVerified: formData.isVerified,
      });

      toast.success('User updated successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update user');
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter phone number"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'user' | 'admin') =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tier">Tier</Label>
              <Select
                value={formData.tier}
                onValueChange={(value: 'bronze' | 'silver' | 'gold' | 'platinum') =>
                  setFormData({ ...formData, tier: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="verified">Verified Status</Label>
              <Select
                value={formData.isVerified.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, isVerified: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Not Verified</SelectItem>
                  <SelectItem value="1">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, Edit, Trash2, Shield } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import EditUserDialog from '@/components/admin/EditUserDialog';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: 'user' | 'admin';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  balance: number;
  completedTasks: number;
  isVerified: number;
  createdAt: any;
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  const { data: users = [], isLoading, refetch } = trpc.user.listAll.useQuery();

  const filteredUsers = users.filter((user: User) => {
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.includes(search)
    );
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    refetch();
    toast.success('User updated successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground">Manage all platform users</p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">ID</th>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Email</th>
                      <th className="text-left p-4 font-medium">Phone</th>
                      <th className="text-left p-4 font-medium">Role</th>
                      <th className="text-left p-4 font-medium">Tier</th>
                      <th className="text-left p-4 font-medium">Balance</th>
                      <th className="text-left p-4 font-medium">Tasks</th>
                      <th className="text-left p-4 font-medium">Verified</th>
                      <th className="text-left p-4 font-medium">Joined</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user: User) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">{user.id}</td>
                        <td className="p-4 font-medium">{user.name || '-'}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {user.email || '-'}
                        </td>
                        <td className="p-4 text-sm">{user.phone || '-'}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {user.role === 'admin' && <Shield className="h-3 w-3" />}
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="capitalize text-sm">{user.tier}</span>
                        </td>
                        <td className="p-4 text-sm">{user.balance} EGP</td>
                        <td className="p-4 text-sm">{user.completedTasks}</td>
                        <td className="p-4">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              user.isVerified ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          />
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  {searchTerm ? 'No users found matching your search' : 'No users found'}
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      <EditUserDialog
        user={editingUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </AdminLayout>
  );
}

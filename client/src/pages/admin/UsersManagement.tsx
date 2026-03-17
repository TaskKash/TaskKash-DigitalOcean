import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from "@/contexts/CurrencyContext";
import { 
  Search, Filter, MoreVertical, Ban, CheckCircle2, Mail,
  Eye, Trash2, Download
} from 'lucide-react';

const users = [
  { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', phone: '0501234567', balance: 245.50, tasks: 127, status: 'active', joined: '2024-01-15' },
  { id: 2, name: 'سارة أحمد', email: 'sara@example.com', phone: '0509876543', balance: 892.30, tasks: 234, status: 'active', joined: '2024-01-20' },
  { id: 3, name: 'محمد علي', email: 'mohammed@example.com', phone: '0505551234', balance: 0, tasks: 0, status: 'pending', joined: '2024-02-01' },
  { id: 4, name: 'فاطمة حسن', email: 'fatima@example.com', phone: '0502223344', balance: 1250.75, tasks: 456, status: 'active', joined: '2024-01-10' },
  { id: 5, name: 'خالد سعيد', email: 'khaled@example.com', phone: '0507778899', balance: 0, tasks: 15, status: 'suspended', joined: '2024-02-15' },
  { id: 6, name: 'نورة عبدالله', email: 'noura@example.com', phone: '0504445566', balance: 567.20, tasks: 189, status: 'active', joined: '2024-01-25' },
  { id: 7, name: 'عمر يوسف', email: 'omar@example.com', phone: '0506667788', balance: 345.80, tasks: 98, status: 'active', joined: '2024-02-05' },
  { id: 8, name: 'ريم محمود', email: 'reem@example.com', phone: '0508889900', balance: 0, tasks: 0, status: 'pending', joined: '2024-02-20' }
];

export default function UsersManagement() {
  const { currency, symbol, formatAmount } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-0">نشط</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-0">معلق</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 border-0">موقوف</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">إدارة المستخدمين</h1>
          <p className="text-lg opacity-90">عرض وإدارة جميع مستخدمي المنصة</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">إجمالي المستخدمين</p>
            <p className="text-3xl font-bold">125,430</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">المستخدمون النشطون</p>
            <p className="text-3xl font-bold text-primary">98,234</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">المعلقون</p>
            <p className="text-3xl font-bold text-yellow-600">1,245</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">الموقوفون</p>
            <p className="text-3xl font-bold text-red-600">951</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                الكل
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
              >
                نشط
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
              >
                معلق
              </Button>
              <Button
                variant={statusFilter === 'suspended' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('suspended')}
              >
                موقوف
              </Button>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-4 font-semibold">المستخدم</th>
                <th className="text-right p-4 font-semibold">الهاتف</th>
                <th className="text-right p-4 font-semibold">الرصيد</th>
                <th className="text-right p-4 font-semibold">المهام</th>
                <th className="text-right p-4 font-semibold">الحالة</th>
                <th className="text-right p-4 font-semibold">تاريخ الانضمام</th>
                <th className="text-right p-4 font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{user.phone}</td>
                  <td className="p-4">
                    <span className="font-semibold">{user.balance.toFixed(2)} {symbol}</span>
                  </td>
                  <td className="p-4">{user.tasks}</td>
                  <td className="p-4">{getStatusBadge(user.status)}</td>
                  <td className="p-4 text-muted-foreground">{user.joined}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Mail className="w-4 h-4" />
                      </Button>
                      {user.status === 'active' ? (
                        <Button size="sm" variant="ghost" className="text-red-600">
                          <Ban className="w-4 h-4" />
                        </Button>
                      ) : user.status === 'suspended' ? (
                        <Button size="sm" variant="ghost" className="text-primary">
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="text-primary">
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            عرض {filteredUsers.length} من {users.length} مستخدم
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">السابق</Button>
            <Button variant="outline" size="sm">1</Button>
            <Button variant="default" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">التالي</Button>
          </div>
        </div>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from "@/contexts/CurrencyContext";
import { 
  Search, Eye, Ban, CheckCircle2, Mail, Download, Building2
} from 'lucide-react';

const advertisers = [
  { id: 1, name: 'شركة التقنية الحديثة', email: 'tech@company.com', phone: '0501234567', campaigns: 15, spent: 45000, status: 'active', joined: '2024-01-10' },
  { id: 2, name: 'متجر الإلكترونيات', email: 'electronics@store.com', phone: '0509876543', campaigns: 8, spent: 28500, status: 'active', joined: '2024-01-15' },
  { id: 3, name: 'شركة التسويق الذكي', email: 'smart@marketing.com', phone: '0505551234', campaigns: 0, spent: 0, status: 'pending', joined: '2024-02-01' },
  { id: 4, name: 'مطاعم الذواقة', email: 'gourmet@restaurants.com', phone: '0502223344', campaigns: 22, spent: 67800, status: 'active', joined: '2024-01-05' },
  { id: 5, name: 'معهد اللغات', email: 'languages@institute.com', phone: '0507778899', campaigns: 5, spent: 12000, status: 'suspended', joined: '2024-02-10' },
  { id: 6, name: 'صالة الرياضة الذهبية', email: 'golden@gym.com', phone: '0504445566', campaigns: 12, spent: 34500, status: 'active', joined: '2024-01-20' }
];

export default function AdvertisersManagement() {
  const { currency, symbol, formatAmount } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAdvertisers = advertisers.filter(adv => {
    const matchesSearch = adv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adv.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || adv.status === statusFilter;
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
      <header className="bg-gradient-to-r from-purple-900 to-purple-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">إدارة المعلنين</h1>
          <p className="text-lg opacity-90">عرض وإدارة جميع معلني المنصة</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">إجمالي المعلنين</p>
            <p className="text-3xl font-bold">2,847</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">المعلنون النشطون</p>
            <p className="text-3xl font-bold text-primary">2,156</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">إجمالي الإنفاق</p>
            <p className="text-3xl font-bold text-secondary">4.58M {symbol}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">الحملات النشطة</p>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
          </Card>
        </div>

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

        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-4 font-semibold">المعلن</th>
                <th className="text-right p-4 font-semibold">الهاتف</th>
                <th className="text-right p-4 font-semibold">الحملات</th>
                <th className="text-right p-4 font-semibold">الإنفاق</th>
                <th className="text-right p-4 font-semibold">الحالة</th>
                <th className="text-right p-4 font-semibold">تاريخ الانضمام</th>
                <th className="text-right p-4 font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdvertisers.map((adv) => (
                <tr key={adv.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{adv.name}</p>
                        <p className="text-sm text-muted-foreground">{adv.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{adv.phone}</td>
                  <td className="p-4">{adv.campaigns}</td>
                  <td className="p-4">
                    <span className="font-semibold">{adv.spent.toLocaleString()} {symbol}</span>
                  </td>
                  <td className="p-4">{getStatusBadge(adv.status)}</td>
                  <td className="p-4 text-muted-foreground">{adv.joined}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Mail className="w-4 h-4" />
                      </Button>
                      {adv.status === 'active' ? (
                        <Button size="sm" variant="ghost" className="text-red-600">
                          <Ban className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="text-primary">
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}


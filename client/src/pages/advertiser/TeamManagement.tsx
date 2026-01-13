import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, Search, UserPlus, Mail, Shield, Edit, Trash2,
  MoreVertical, Crown, User
} from 'lucide-react';
import { toast } from 'sonner';

const teamMembers = [
  {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    role: 'owner',
    status: 'active',
    joinedAt: '2023-01-15',
    lastActive: 'منذ 5 دقائق',
    campaigns: 12,
    avatar: '👨‍💼'
  },
  {
    id: '2',
    name: 'فاطمة علي',
    email: 'fatima@example.com',
    role: 'admin',
    status: 'active',
    joinedAt: '2023-03-20',
    lastActive: 'منذ ساعة',
    campaigns: 8,
    avatar: '👩‍💼'
  },
  {
    id: '3',
    name: 'محمد سعيد',
    email: 'mohammed@example.com',
    role: 'editor',
    status: 'active',
    joinedAt: '2023-06-10',
    lastActive: 'منذ 3 ساعات',
    campaigns: 5,
    avatar: '👨'
  },
  {
    id: '4',
    name: 'نورة خالد',
    email: 'noura@example.com',
    role: 'viewer',
    status: 'active',
    joinedAt: '2023-09-05',
    lastActive: 'منذ يوم',
    campaigns: 0,
    avatar: '👩'
  },
  {
    id: '5',
    name: 'عبدالله أحمد',
    email: 'abdullah@example.com',
    role: 'editor',
    status: 'invited',
    joinedAt: '2024-01-20',
    lastActive: '-',
    campaigns: 0,
    avatar: '👤'
  }
];

const roles = [
  { value: 'owner', label: 'مالك', description: 'صلاحيات كاملة', color: 'text-purple-600 bg-purple-100' },
  { value: 'admin', label: 'مدير', description: 'إدارة الحملات والفريق', color: 'text-blue-600 bg-blue-100' },
  { value: 'editor', label: 'محرر', description: 'إنشاء وتعديل الحملات', color: 'text-primary bg-green-100' },
  { value: 'viewer', label: 'مشاهد', description: 'عرض فقط', color: 'text-gray-600 bg-gray-100' }
];

export default function TeamManagement() {
  const [members, setMembers] = useState(teamMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const getRoleBadge = (role: string) => {
    const roleConfig = roles.find(r => r.value === role);
    if (!roleConfig) return null;
    return (
      <Badge className={`${roleConfig.color} border-0`}>
        {roleConfig.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-100 text-green-800 border-0">نشط</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800 border-0">دعوة معلقة</Badge>;
  };

  const handleRemoveMember = (id: string) => {
    const member = members.find(m => m.id === id);
    if (member?.role === 'owner') {
      toast.error('لا يمكن إزالة المالك');
      return;
    }
    setMembers(members.filter(m => m.id !== id));
    toast.success('تم إزالة العضو من الفريق');
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">إدارة الفريق</h1>
              <p className="text-sm text-muted-foreground">
                {members.length} أعضاء في الفريق
              </p>
            </div>
            <Button onClick={() => setShowInviteForm(!showInviteForm)}>
              <UserPlus className="w-5 h-5 ml-2" />
              دعوة عضو جديد
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="ابحث عن عضو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Invite Form */}
        {showInviteForm && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">دعوة عضو جديد</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الدور</label>
                  <select className="w-full px-4 py-2 border rounded-lg">
                    {roles.filter(r => r.value !== 'owner').map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Mail className="w-4 h-4 ml-2" />
                  إرسال الدعوة
                </Button>
                <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Roles Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">الأدوار والصلاحيات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map(role => (
              <div key={role.value} className="flex items-start gap-3 p-4 rounded-lg border">
                <Shield className={`w-6 h-6 ${role.color.split(' ')[0]} flex-shrink-0`} />
                <div>
                  <h3 className="font-semibold mb-1">{role.label}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Team Members */}
        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{member.name}</h3>
                      {getRoleBadge(member.role)}
                      {getStatusBadge(member.status)}
                      {member.role === 'owner' && (
                        <Crown className="w-5 h-5 text-secondary fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      <Mail className="w-4 h-4 inline ml-1" />
                      {member.email}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>انضم في {member.joinedAt}</span>
                      <span>•</span>
                      <span>آخر نشاط: {member.lastActive}</span>
                      <span>•</span>
                      <span>{member.campaigns} حملة</span>
                    </div>
                  </div>
                </div>

                {member.role !== 'owner' && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <Card className="p-12 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">لا توجد نتائج</p>
            <p className="text-muted-foreground">
              لم يتم العثور على أعضاء مطابقين للبحث
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}


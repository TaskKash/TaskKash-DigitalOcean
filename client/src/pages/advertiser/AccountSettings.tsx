import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, Mail, Phone, Building2, Globe, Lock,
  Bell, Shield, CreditCard, Save, LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { useCurrency } from "@/contexts/CurrencyContext";

export default function AccountSettings() {
  const { currency, symbol, formatAmount } = useCurrency();
  const [, setLocation] = useLocation();
  const { currentAdvertiser, logoutAdvertiser } = useApp();
  const [activeTab, setActiveTab] = useState('profile');

  // إذا لم يكن هناك معلن مسجل، إعادة توجيه لصفحة تسجيل الدخول
  useEffect(() => {
    if (!currentAdvertiser) {
      setLocation('/advertiser/login');
    }
  }, [currentAdvertiser, setLocation]);

  if (!currentAdvertiser) {
    return null;
  }

  const tabs = [
    { id: 'profile', label: 'الملف الشخصي', icon: User },
    { id: 'company', label: 'معلومات الشركة', icon: Building2 },
    { id: 'security', label: 'الأمان', icon: Shield },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'billing', label: 'الفواتير', icon: CreditCard }
  ];

  const handleSave = () => {
    toast.success('تم حفظ التغييرات بنجاح');
  };

  const handleLogout = () => {
    logoutAdvertiser();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('advertiserId');
    toast.success('تم تسجيل الخروج بنجاح');
    setLocation('/advertiser/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">إعدادات الحساب</h1>
            <p className="text-sm text-muted-foreground">إدارة معلومات حسابك وتفضيلاتك</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">{currentAdvertiser.company}</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="p-4 h-fit">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white'
                      : 'hover:bg-muted'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors hover:bg-red-50 text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </button>
            </nav>
          </Card>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'profile' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-6">الملف الشخصي</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <Input id="name" defaultValue={currentAdvertiser.name} />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" type="email" defaultValue={currentAdvertiser.email} />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الجوال</Label>
                    <Input id="phone" type="tel" defaultValue="+20 123 456 7890" />
                  </div>
                  <div>
                    <Label htmlFor="industry">المجال</Label>
                    <Input id="industry" defaultValue={currentAdvertiser.industry} />
                  </div>
                  <Button onClick={handleSave} className="bg-gradient-to-r from-emerald-600 to-emerald-700">
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التغييرات
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === 'company' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-6">معلومات الشركة</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">اسم الشركة</Label>
                    <Input id="companyName" defaultValue={currentAdvertiser.company} />
                  </div>
                  <div>
                    <Label htmlFor="industry">الصناعة</Label>
                    <Input id="industry" defaultValue={currentAdvertiser.industry} />
                  </div>
                  <div>
                    <Label htmlFor="website">الموقع الإلكتروني</Label>
                    <Input id="website" type="url" defaultValue="https://example.com" />
                  </div>
                  <div>
                    <Label htmlFor="address">العنوان</Label>
                    <Input id="address" defaultValue="القاهرة، مصر" />
                  </div>
                  <div>
                    <Label htmlFor="taxId">الرقم الضريبي</Label>
                    <Input id="taxId" defaultValue="123-456-789" />
                  </div>
                  <div>
                    <Label htmlFor="joinDate">تاريخ الانضمام</Label>
                    <Input 
                      id="joinDate" 
                      defaultValue={new Date(currentAdvertiser.joinDate).toLocaleDateString('ar-EG')} 
                      disabled 
                    />
                  </div>
                  <Button onClick={handleSave} className="bg-gradient-to-r from-emerald-600 to-emerald-700">
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التغييرات
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-6">الأمان</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">تغيير كلمة المرور</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                      <Button onClick={handleSave} className="bg-gradient-to-r from-emerald-600 to-emerald-700">
                        <Lock className="w-4 h-4 ml-2" />
                        تحديث كلمة المرور
                      </Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <h3 className="font-semibold mb-4">المصادقة الثنائية</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      قم بتفعيل المصادقة الثنائية لحماية حسابك بشكل أفضل
                    </p>
                    <Button variant="outline">
                      <Shield className="w-4 h-4 ml-2" />
                      تفعيل المصادقة الثنائية
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-6">الإشعارات</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-semibold">إشعارات الحملات</p>
                      <p className="text-sm text-muted-foreground">تلقي إشعارات عند تحديثات الحملات</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-semibold">إشعارات المهام</p>
                      <p className="text-sm text-muted-foreground">تلقي إشعارات عند إكمال المهام</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-semibold">إشعارات الفواتير</p>
                      <p className="text-sm text-muted-foreground">تلقي إشعارات عند الفواتير الجديدة</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-semibold">النشرة الإخبارية</p>
                      <p className="text-sm text-muted-foreground">تلقي آخر الأخبار والتحديثات</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                  <Button onClick={handleSave} className="bg-gradient-to-r from-emerald-600 to-emerald-700">
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التفضيلات
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === 'billing' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-6">معلومات الفواتير</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-emerald-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">إجمالي الميزانية</p>
                      <p className="text-2xl font-bold text-emerald-700">
                        {currentAdvertiser.totalBudget.toLocaleString('ar-EG')} {symbol}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">المنفق</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {currentAdvertiser.spentBudget.toLocaleString('ar-EG')} {symbol}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">طريقة الدفع</h3>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-6 h-6 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">Visa •••• 4242</p>
                            <p className="text-sm text-muted-foreground">تنتهي في 12/25</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">تعديل</Button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={() => setLocation('/advertiser/billing')}
                    className="w-full"
                  >
                    عرض جميع الفواتير
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

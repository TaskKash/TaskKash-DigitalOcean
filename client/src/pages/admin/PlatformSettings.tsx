import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, DollarSign, Shield, Bell, Mail, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrency } from "@/contexts/CurrencyContext";

export default function PlatformSettings() {
  const { currency, symbol, formatAmount } = useCurrency();
  const [settings, setSettings] = useState({
    minWithdrawal: 500,
    platformFee: 15,
    taskApprovalRequired: true,
    autoApproveAfterHours: 24,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    registrationOpen: true
  });

  const handleSave = () => {
    toast.success('تم حفظ الإعدادات بنجاح!');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">إعدادات المنصة</h1>
          <p className="text-lg opacity-90">إدارة الإعدادات العامة للمنصة</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Financial Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">الإعدادات المالية</h2>
              <p className="text-sm text-muted-foreground">إدارة الرسوم والحدود المالية</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="minWithdrawal">الحد الأدنى للسحب (ج.م)</Label>
              <Input
                id="minWithdrawal"
                type="number"
                value={settings.minWithdrawal}
                onChange={(e) => setSettings({ ...settings, minWithdrawal: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                الحد الأدنى للمبلغ الذي يمكن للمستخدم سحبه
              </p>
            </div>

            <div>
              <Label htmlFor="platformFee">عمولة المنصة (%)</Label>
              <Input
                id="platformFee"
                type="number"
                value={settings.platformFee}
                onChange={(e) => setSettings({ ...settings, platformFee: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                نسبة العمولة من كل مهمة مكتملة
              </p>
            </div>
          </div>
        </Card>

        {/* Task Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">إعدادات المهام</h2>
              <p className="text-sm text-muted-foreground">إدارة عملية الموافقة على المهام</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>الموافقة اليدوية على المهام</Label>
                <p className="text-xs text-muted-foreground">
                  تتطلب المهام موافقة المعلن قبل الدفع
                </p>
              </div>
              <Switch
                checked={settings.taskApprovalRequired}
                onCheckedChange={(checked) => setSettings({ ...settings, taskApprovalRequired: checked })}
              />
            </div>

            <div>
              <Label htmlFor="autoApprove">الموافقة التلقائية بعد (ساعات)</Label>
              <Input
                id="autoApprove"
                type="number"
                value={settings.autoApproveAfterHours}
                onChange={(e) => setSettings({ ...settings, autoApproveAfterHours: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                الموافقة التلقائية على المهام إذا لم يراجعها المعلن
              </p>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">إعدادات الإشعارات</h2>
              <p className="text-sm text-muted-foreground">إدارة الإشعارات والتنبيهات</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>إشعارات البريد الإلكتروني</Label>
                <p className="text-xs text-muted-foreground">
                  إرسال إشعارات عبر البريد الإلكتروني
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>إشعارات SMS</Label>
                <p className="text-xs text-muted-foreground">
                  إرسال إشعارات عبر الرسائل النصية
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
              />
            </div>
          </div>
        </Card>

        {/* System Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">إعدادات النظام</h2>
              <p className="text-sm text-muted-foreground">إدارة حالة المنصة والوصول</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>وضع الصيانة</Label>
                <p className="text-xs text-muted-foreground">
                  تعطيل المنصة مؤقتاً للصيانة
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>التسجيل مفتوح</Label>
                <p className="text-xs text-muted-foreground">
                  السماح بتسجيل مستخدمين جدد
                </p>
              </div>
              <Switch
                checked={settings.registrationOpen}
                onCheckedChange={(checked) => setSettings({ ...settings, registrationOpen: checked })}
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">إلغاء</Button>
          <Button onClick={handleSave}>
            حفظ التغييرات
          </Button>
        </div>
      </div>
    </div>
  );
}


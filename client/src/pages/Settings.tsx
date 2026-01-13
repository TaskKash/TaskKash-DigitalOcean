import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronRight, Bell, Shield, Globe, Moon, Vibrate, Mail } from 'lucide-react';
import { toast } from 'sonner';
import NotificationSettings from '@/components/NotificationSettings';

export default function Settings() {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: true,
    taskAlerts: true,
    paymentAlerts: true,
    promotionAlerts: false,
    darkMode: false,
    vibration: true,
    sound: true
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('تم تحديث الإعدادات');
  };

  const settingsSections = [
    {
      title: 'الإشعارات',
      icon: Bell,
      items: [
        { key: 'pushNotifications', label: 'إشعارات التطبيق', description: 'تلقي إشعارات فورية' },
        { key: 'emailNotifications', label: 'إشعارات البريد', description: 'تلقي تحديثات عبر البريد' },
        { key: 'smsNotifications', label: 'رسائل SMS', description: 'تلقي رسائل نصية' },
      ]
    },
    {
      title: 'تنبيهات المهام',
      icon: Bell,
      items: [
        { key: 'taskAlerts', label: 'مهام جديدة', description: 'إشعار عند توفر مهام' },
        { key: 'paymentAlerts', label: 'المدفوعات', description: 'إشعار عند إضافة أرباح' },
        { key: 'promotionAlerts', label: 'العروض', description: 'إشعار بالعروض الخاصة' },
      ]
    },
    {
      title: 'المظهر والصوت',
      icon: Moon,
      items: [
        { key: 'darkMode', label: 'الوضع الليلي', description: 'تفعيل المظهر الداكن' },
        { key: 'vibration', label: 'الاهتزاز', description: 'اهتزاز عند الإشعارات' },
        { key: 'sound', label: 'الصوت', description: 'صوت عند الإشعارات' },
      ]
    }
  ];

  const quickActions = [
    { icon: Globe, label: 'اللغة', value: 'العربية', path: '/settings/language' },
    { icon: Shield, label: 'الخصوصية والأمان', path: '/settings/privacy' },
    { icon: Mail, label: 'تفضيلات البريد', path: '/settings/email' },
  ];

  return (
    <MobileLayout title="الإعدادات" showBack>
      <div className="p-4 space-y-6">
        {/* Push Notifications Settings */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">الإشعارات الفورية (PWA)</h3>
          </div>
          <NotificationSettings />
        </div>
        {/* Quick Actions */}
        <Card className="divide-y">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <action.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-right">
                  <p className="font-medium">{action.label}</p>
                  {action.value && (
                    <p className="text-sm text-muted-foreground">{action.value}</p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </Card>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <section.icon className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{section.title}</h3>
            </div>
            
            <Card className="divide-y">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <Label htmlFor={item.key} className="font-medium cursor-pointer">
                      {item.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                  <Switch
                    id={item.key}
                    checked={settings[item.key as keyof typeof settings] as boolean}
                    onCheckedChange={() => handleToggle(item.key as keyof typeof settings)}
                  />
                </div>
              ))}
            </Card>
          </div>
        ))}

        {/* Reset Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setSettings({
              pushNotifications: true,
              emailNotifications: false,
              smsNotifications: true,
              taskAlerts: true,
              paymentAlerts: true,
              promotionAlerts: false,
              darkMode: false,
              vibration: true,
              sound: true
            });
            toast.success('تم إعادة تعيين الإعدادات');
          }}
        >
          إعادة تعيين الإعدادات
        </Button>
      </div>
    </MobileLayout>
  );
}


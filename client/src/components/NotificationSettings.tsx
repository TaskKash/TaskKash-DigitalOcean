import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  showLocalNotification,
} from '@/lib/pushNotifications';

export default function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    newTasks: true,
    taskApproved: true,
    taskRejected: true,
    paymentReceived: true,
    newMessages: true,
    promotions: false,
  });

  useEffect(() => {
    // Check if push notifications are supported
    const supported = isPushNotificationSupported();
    setIsSupported(supported);

    if (supported) {
      // Get current permission status
      const currentPermission = getNotificationPermission();
      setPermission(currentPermission);

      // Check if already subscribed
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      // Request permission
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);

      if (newPermission === 'granted') {
        // Subscribe to push notifications
        const subscription = await subscribeToPushNotifications();
        
        if (subscription) {
          setIsSubscribed(true);
          toast.success('تم تفعيل الإشعارات بنجاح!', {
            description: 'سوف تتلقى إشعارات عند توفر مهام جديدة',
          });

          // Show a test notification
          await showLocalNotification('TASKKASH', {
            body: 'تم تفعيل الإشعارات بنجاح! سوف تتلقى تحديثات فورية.',
            icon: '/icon-192.svg',
          });
        } else {
          toast.error('فشل الاشتراك في الإشعارات');
        }
      } else if (newPermission === 'denied') {
        toast.error('تم رفض إذن الإشعارات', {
          description: 'يرجى تفعيل الإشعارات من إعدادات المتصفح',
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('حدث خطأ أثناء تفعيل الإشعارات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    try {
      const success = await unsubscribeFromPushNotifications();
      
      if (success) {
        setIsSubscribed(false);
        toast.success('تم إيقاف الإشعارات');
      } else {
        toast.error('فشل إيقاف الإشعارات');
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('حدث خطأ أثناء إيقاف الإشعارات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await showLocalNotification('TASKKASH - إشعار تجريبي', {
        body: 'هذا إشعار تجريبي للتأكد من عمل الإشعارات بشكل صحيح',
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        tag: 'test-notification',
      });
      toast.success('تم إرسال إشعار تجريبي');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('فشل إرسال الإشعار التجريبي');
    }
  };

  const handlePreferenceToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('تم تحديث تفضيلات الإشعارات');
  };

  // If push notifications are not supported
  if (!isSupported) {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">الإشعارات غير مدعومة</h3>
            <p className="text-sm text-muted-foreground">
              متصفحك الحالي لا يدعم الإشعارات الفورية. يرجى استخدام متصفح حديث مثل Chrome أو Firefox أو Edge.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Notification Toggle */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            isSubscribed ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {isSubscribed ? (
              <Bell className="w-6 h-6 text-green-600" />
            ) : (
              <BellOff className="w-6 h-6 text-gray-600" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">الإشعارات الفورية</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isSubscribed 
                ? 'الإشعارات مفعلة - سوف تتلقى تحديثات فورية'
                : 'قم بتفعيل الإشعارات لتلقي تحديثات فورية عن المهام والأرباح'
              }
            </p>

            {/* Permission Status */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${
                permission === 'granted' ? 'bg-green-500' :
                permission === 'denied' ? 'bg-red-500' :
                'bg-yellow-500'
              }`} />
              <span className="text-sm">
                {permission === 'granted' && 'تم منح الإذن'}
                {permission === 'denied' && 'تم رفض الإذن'}
                {permission === 'default' && 'لم يتم طلب الإذن بعد'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!isSubscribed ? (
                <Button
                  onClick={handleEnableNotifications}
                  disabled={isLoading || permission === 'denied'}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري التفعيل...
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      تفعيل الإشعارات
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleTestNotification}
                    variant="outline"
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    إرسال إشعار تجريبي
                  </Button>
                  <Button
                    onClick={handleDisableNotifications}
                    variant="destructive"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                  </Button>
                </>
              )}
            </div>

            {permission === 'denied' && (
              <p className="text-sm text-red-600 mt-3">
                تم رفض إذن الإشعارات. يرجى تفعيل الإشعارات من إعدادات المتصفح.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      {isSubscribed && (
        <Card className="divide-y">
          <div className="p-4">
            <h4 className="font-semibold mb-1">تفضيلات الإشعارات</h4>
            <p className="text-sm text-muted-foreground">
              اختر أنواع الإشعارات التي تريد تلقيها
            </p>
          </div>

          {[
            { key: 'newTasks', label: 'مهام جديدة', description: 'إشعار عند توفر مهام جديدة' },
            { key: 'taskApproved', label: 'مهمة مقبولة', description: 'إشعار عند قبول مهمة' },
            { key: 'taskRejected', label: 'مهمة مرفوضة', description: 'إشعار عند رفض مهمة' },
            { key: 'paymentReceived', label: 'دفعة مستلمة', description: 'إشعار عند إضافة أرباح' },
            { key: 'newMessages', label: 'رسائل جديدة', description: 'إشعار عند تلقي رسالة' },
            { key: 'promotions', label: 'العروض والترويجات', description: 'إشعار بالعروض الخاصة' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4">
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
                checked={preferences[item.key as keyof typeof preferences]}
                onCheckedChange={() => handlePreferenceToggle(item.key as keyof typeof preferences)}
              />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

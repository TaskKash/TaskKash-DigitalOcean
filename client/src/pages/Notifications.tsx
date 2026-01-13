import React from 'react';
import { useApp } from '@/contexts/AppContext';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Bell, DollarSign, Settings as SettingsIcon, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const notificationIcons = {
  task: Bell,
  payment: DollarSign,
  system: SettingsIcon,
  promotion: Gift
};

const notificationColors = {
  task: 'bg-blue-100 text-blue-600',
  payment: 'bg-green-100 text-primary',
  system: 'bg-gray-100 text-gray-600',
  promotion: 'bg-purple-100 text-purple-600'
};

export default function Notifications() {
  const { notifications, markNotificationAsRead } = useApp();
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markNotificationAsRead(notification.id);
    if (notification.actionUrl) {
      setLocation(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Mark all unread notifications as read
    for (const n of notifications) {
      if (!n.read) {
        markNotificationAsRead(n.id);
      }
    }
    // Also call the API to mark all as read
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Helper to get the correct language content
  const getTitle = (notification: any) => {
    if (isArabic && notification.titleAr) return notification.titleAr;
    if (!isArabic && notification.titleEn) return notification.titleEn;
    return notification.title;
  };

  const getMessage = (notification: any) => {
    if (isArabic && notification.messageAr) return notification.messageAr;
    if (!isArabic && notification.messageEn) return notification.messageEn;
    return notification.message;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return isArabic ? 'الآن' : 'Just now';
      if (diffMins < 60) return isArabic ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
      if (diffHours < 24) return isArabic ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
      if (diffDays < 7) return isArabic ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
      
      return date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const NotificationCard = ({ notification }: { notification: typeof notifications[0] }) => {
    const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || Bell;
    const colorClass = notificationColors[notification.type as keyof typeof notificationColors] || 'bg-gray-100 text-gray-600';

    return (
      <Card 
        className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${!notification.read ? 'border-primary border-2' : ''}`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-sm">{getTitle(notification)}</h4>
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              {getMessage(notification)}
            </p>
            
            <p className="text-xs text-muted-foreground">{formatDate(notification.date)}</p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <MobileLayout title={isArabic ? 'الإشعارات' : 'Notifications'} showBack>
      <div className="p-4 space-y-4">
        {/* Header Actions */}
        {unreadNotifications.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isArabic 
                ? `${unreadNotifications.length} إشعار جديد`
                : `${unreadNotifications.length} new notification${unreadNotifications.length > 1 ? 's' : ''}`
              }
            </p>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              {isArabic ? 'تعليم الكل كمقروء' : 'Mark all as read'}
            </Button>
          </div>
        )}

        {/* Unread Notifications */}
        {unreadNotifications.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{isArabic ? 'جديد' : 'New'}</h3>
            {unreadNotifications.map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        )}

        {/* Read Notifications */}
        {readNotifications.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{isArabic ? 'سابقة' : 'Earlier'}</h3>
            {readNotifications.map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <Card className="p-12 text-center">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isArabic ? 'لا توجد إشعارات' : 'No notifications'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isArabic 
                ? 'سنرسل لك إشعارات عند توفر مهام جديدة أو تحديثات مهمة'
                : 'We\'ll notify you when new tasks are available or important updates occur'
              }
            </p>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}

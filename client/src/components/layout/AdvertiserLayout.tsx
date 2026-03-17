import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  LayoutDashboard, 
  Megaphone, 
  CheckSquare, 
  BarChart, 
  CreditCard, 
  Settings,
  Menu,
  X,
  Building2,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCurrency } from "@/contexts/CurrencyContext";

interface AdvertiserLayoutProps {
  children: React.ReactNode;
}

export default function AdvertiserLayout({ children }: AdvertiserLayoutProps) {
  const { currency, symbol, formatAmount } = useCurrency();
  const { t, i18n } = useTranslation();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [advertiser, setAdvertiser] = useState<any>(null);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const info = localStorage.getItem('advertiser-info');
    if (info) {
      setAdvertiser(JSON.parse(info));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('advertiser-info');
      localStorage.removeItem('currentAdvertiserId');
      toast.success(isRTL ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
      setLocation('/advertiser/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: isRTL ? 'لوحة القيادة' : 'Dashboard', path: '/advertiser/new-dashboard' },
    { icon: Megaphone, label: isRTL ? 'الحملات' : 'Campaigns', path: '/advertiser/campaigns' },
    { icon: CheckSquare, label: isRTL ? 'مراجعة المهام' : 'Tasks Review', path: '/advertiser/tasks' },
    { icon: BarChart, label: isRTL ? 'التحليلات' : 'Analytics', path: '/advertiser/analytics' },
    { icon: CreditCard, label: isRTL ? 'الفواتير' : 'Billing', path: '/advertiser/billing' },
    { icon: Settings, label: isRTL ? 'الإعدادات' : 'Settings', path: '/advertiser/settings' },
  ];

  if (!advertiser) return null;

  return (
    <div className={`min-h-screen bg-gray-50 flex ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {advertiser.logoUrl ? (
            <img src={advertiser.logoUrl} alt={advertiser.nameEn} className="w-8 h-8 rounded" />
          ) : (
            <Building2 className="w-6 h-6 text-primary" />
          )}
          <span className="font-bold text-gray-900 truncate max-w-[150px]">
            {isRTL ? advertiser.nameAr : advertiser.nameEn}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} h-full w-64 bg-white border-gray-200 z-40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')
        } lg:translate-x-0 flex flex-col`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-3 w-full">
            {advertiser.logoUrl ? (
              <img src={advertiser.logoUrl} alt="Logo" className="w-8 h-8 rounded-md border border-gray-100 object-contain bg-white" />
            ) : (
              <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-sm text-gray-900 truncate">
                {isRTL ? advertiser.nameAr : advertiser.nameEn}
              </span>
              <span className="text-xs text-blue-600 font-medium capitalize">
                {advertiser.tier || 'Basic'} {isRTL ? 'حساب' : 'Account'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Handle sub-route active states cleanly
            const isActive = location === item.path || (location.startsWith(item.path) && item.path !== '/advertiser/new-dashboard');
            return (
              <Link key={item.path} href={item.path}>
                <a
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 px-3"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            {isRTL ? 'تسجيل الخروج' : 'Log Out'}
          </Button>
        </div>
      </aside>

      {/* Main Content Sub-Layout */}
      <div className={`flex-1 flex flex-col min-h-screen pt-16 lg:pt-0 ${isRTL ? 'lg:mr-64' : 'lg:ml-64'}`}>
        {/* Top Header Bar for Desktop Context */}
        <header className="hidden lg:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-8 sticky top-0 z-30">
          <h1 className="text-xl font-semibold text-gray-800">
            {menuItems.find(m => location === m.path || location.startsWith(`${m.path}/`))?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              <span className="text-sm text-gray-500">{isRTL ? 'الرصيد:' : 'Balance:'}</span>
              <span className="font-bold text-gray-900">
                {isRTL ? `${symbol} ${(advertiser.balance / 100).toFixed(2)}` : `${symbol} ${(advertiser.balance / 100).toFixed(2)}`}
              </span>
            </div>
            <Button size="sm" onClick={() => setLocation('/advertiser/campaigns/new')} className="bg-blue-600 hover:bg-blue-700">
              {isRTL ? 'حملة جديدة' : 'New Campaign'}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

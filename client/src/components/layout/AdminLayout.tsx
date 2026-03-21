import React from 'react';
import { useLocation, Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/_core/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  Receipt,
  Wallet,
  DollarSign,
  Globe,
  BarChart3,
  ShieldAlert,
  AlertOctagon,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

interface MenuItem {
  icon: any;
  label: string;
  path: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const logoutMutation = trpc.auth.logout.useMutation();

  const menuSections: MenuSection[] = [
    {
      title: t('admin.overview') || 'Overview',
      items: [
        { icon: LayoutDashboard, label: t('admin.dashboard') || 'Dashboard', path: '/admin' },
      ]
    },
    {
      title: t('admin.users') || 'Users (B2C)',
      items: [
        { icon: Users, label: t('admin.userManagement') || 'User Management', path: '/admin/users' },
      ]
    },
    {
      title: t('admin.advertisers') || 'Advertisers (B2B)',
      items: [
        { icon: Building2, label: t('admin.advertiserManagement') || 'Advertiser Management', path: '/admin/advertisers' },
      ]
    },
    {
      title: t('admin.campaigns') || 'Campaigns',
      items: [
        { icon: ClipboardCheck, label: t('admin.campaignReview') || 'Campaign Review', path: '/admin/campaign-review' },
      ]
    },
    {
      title: t('admin.financial') || 'Financial',
      items: [
        { icon: Receipt, label: t('admin.financialControl') || 'Financial Control', path: '/admin/financials' },
        { icon: Wallet, label: t('admin.walletHub') || 'Wallet Hub', path: '/admin/wallet-hub' },
        { icon: DollarSign, label: t('admin.withdrawals') || 'Withdrawals', path: '/admin/withdrawals' },
        { icon: Globe, label: t('admin.currencyRates') || 'Currency Rates', path: '/admin/currency-rates' },
      ]
    },
    {
      title: t('admin.reports') || 'Reports',
      items: [
        { icon: BarChart3, label: t('admin.analytics') || 'Analytics', path: '/admin/analytics' },
        { icon: AlertOctagon, label: t('admin.fraudDetection') || 'Fraud Detection', path: '/admin/fraud' },
        { icon: ShieldAlert, label: t('admin.disputes') || 'Disputes', path: '/admin/disputes' },
      ]
    },
    {
      title: t('admin.system') || 'System',
      items: [
        { icon: Globe, label: t('admin.operations') || 'Platform Operations', path: '/admin/operations' },
        { icon: Settings, label: t('admin.settings') || 'Settings', path: '/admin/settings' },
      ]
    }
  ];

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success('Logged out successfully');
      setLocation('/welcome');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // Redirect if not admin
  React.useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      setLocation('/');
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <h1 className="text-xl font-bold">{t('admin.appTitle') || 'TASKKASH Admin'}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 transition-transform duration-300 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-5 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">TASKKASH</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t('admin.controlPanel') || 'Admin Control Panel'}</p>
        </div>

        <nav className="px-3 py-3 space-y-1">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-2">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path ||
                  (item.path !== '/admin' && location.startsWith(item.path));
                return (
                  <Link key={item.path} href={item.path}>
                    <a
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                      onClick={() => {
                        // Close sidebar on mobile after clicking
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </a>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`lg:ml-64 min-h-screen pt-16 lg:pt-0`}>
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

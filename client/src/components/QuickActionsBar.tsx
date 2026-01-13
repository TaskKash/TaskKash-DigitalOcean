import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Play, Wallet, AlertCircle, TrendingUp } from 'lucide-react';

export default function QuickActionsBar() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const actions = [
    {
      icon: Play,
      label: t('home.quickActions.startTask'),
      color: 'bg-primary',
      action: () => setLocation('/tasks')
    },
    {
      icon: Wallet,
      label: t('home.quickActions.withdraw'),
      color: 'bg-secondary',
      action: () => setLocation('/wallet')
    },
    {
      icon: AlertCircle,
      label: t('home.quickActions.disputes'),
      color: 'bg-orange-500',
      action: () => setLocation('/my-disputes')
    },
    {
      icon: TrendingUp,
      label: t('home.quickActions.boostProfile'),
      color: 'bg-purple-500',
      action: () => setLocation('/profile')
    }
  ];

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">{t('home.quickActions')}</h3>
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-3"
            onClick={action.action}
          >
            <div className={`${action.color} p-2 rounded-lg`}>
              <action.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}

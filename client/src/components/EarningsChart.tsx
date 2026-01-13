import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DayEarning {
  day: string;
  date: string;
  amount: number;
}

interface WeeklyEarningsData {
  earnings: DayEarning[];
  totalEarnings: number;
  prevWeekTotal: number;
  change: string;
}

export default function EarningsChart() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<DayEarning[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [change, setChange] = useState('0');
  const [loading, setLoading] = useState(true);

  // Day name translations
  const dayTranslations: { [key: string]: string } = {
    'Saturday': t('home.days.saturday'),
    'Sunday': t('home.days.sunday'),
    'Monday': t('home.days.monday'),
    'Tuesday': t('home.days.tuesday'),
    'Wednesday': t('home.days.wednesday'),
    'Thursday': t('home.days.thursday'),
    'Friday': t('home.days.friday')
  };

  useEffect(() => {
    const fetchWeeklyEarnings = async () => {
      try {
        const response = await fetch('/api/weekly-earnings', { credentials: 'include' });
        if (response.ok) {
          const result: WeeklyEarningsData = await response.json();
          // Translate day names
          const translatedData = result.earnings.map(e => ({
            ...e,
            day: dayTranslations[e.day] || e.day
          }));
          setData(translatedData);
          setTotalEarnings(result.totalEarnings);
          setChange(result.change);
        }
      } catch (error) {
        console.error('Error fetching weekly earnings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyEarnings();
  }, [i18n.language]);

  const isPositive = parseFloat(change) >= 0;
  const maxAmount = Math.max(...data.map(d => d.amount), 1); // Minimum 1 to avoid division by zero

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="flex items-end justify-between gap-2 h-32">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 bg-gray-200 rounded-t-lg" style={{ height: `${Math.random() * 100}%` }}></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">{t('home.weeklyEarnings')}</h3>
          <p className="text-2xl font-bold mt-1">{totalEarnings.toFixed(0)} {t('currency')}</p>
        </div>
        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-sm font-semibold">{change}%</span>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '100%' }}>
              <div 
                className="w-full bg-gradient-primary rounded-t-lg absolute bottom-0 transition-all duration-300"
                style={{ height: `${(item.amount / maxAmount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{item.day}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

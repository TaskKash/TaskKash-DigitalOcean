import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { RefreshCw, Save, DollarSign } from 'lucide-react';

interface ExchangeRate {
  id: number;
  currencyCode: string;
  currencyName: string;
  currencyNameAr: string;
  currencySymbol: string;
  rateToUsd: number;
  rateFromUsd: number;
  isActive: number;
  updatedAt: string;
}

export default function AdminCurrencyRates() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRates, setEditingRates] = useState<Record<string, { rateToUsd: string; rateFromUsd: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/exchange-rates');
      const data = await res.json();
      if (data.success) {
        setRates(data.rates);
        const edits: Record<string, { rateToUsd: string; rateFromUsd: string }> = {};
        data.rates.forEach((r: ExchangeRate) => {
          edits[r.currencyCode] = {
            rateToUsd: String(r.rateToUsd),
            rateFromUsd: String(r.rateFromUsd),
          };
        });
        setEditingRates(edits);
      }
    } catch (err) {
      toast.error('Failed to load exchange rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRates(); }, []);

  const handleSave = async (code: string) => {
    setSaving(code);
    try {
      const edit = editingRates[code];
      const csrfRes = await fetch('/api/csrf-token');
      const csrfData = await csrfRes.json();

      const res = await fetch(`/api/admin/exchange-rates/${code}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfData.csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify({
          rateToUsd: parseFloat(edit.rateToUsd),
          rateFromUsd: parseFloat(edit.rateFromUsd),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`${code} rate updated successfully`);
        fetchRates();
      } else {
        toast.error(data.error || 'Failed to update rate');
      }
    } catch (err) {
      toast.error('Failed to update rate');
    } finally {
      setSaving(null);
    }
  };

  const handleRateChange = (code: string, field: 'rateToUsd' | 'rateFromUsd', value: string) => {
    setEditingRates(prev => ({
      ...prev,
      [code]: { ...prev[code], [field]: value },
    }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Exchange Rate Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage currency conversion rates for the platform. All rates are relative to USD.
          </p>
        </div>
        <Button variant="outline" onClick={fetchRates} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 font-medium">Currency</th>
                  <th className="text-left p-4 font-medium">Symbol</th>
                  <th className="text-left p-4 font-medium">1 Unit → USD</th>
                  <th className="text-left p-4 font-medium">1 USD → Currency</th>
                  <th className="text-left p-4 font-medium">Last Updated</th>
                  <th className="text-right p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => {
                  const edit = editingRates[rate.currencyCode];
                  const hasChanged = edit &&
                    (String(rate.rateToUsd) !== edit.rateToUsd || String(rate.rateFromUsd) !== edit.rateFromUsd);

                  return (
                    <tr key={rate.currencyCode} className="border-b hover:bg-gray-50/50">
                      <td className="p-4">
                        <div>
                          <span className="font-semibold">{rate.currencyCode}</span>
                          <p className="text-sm text-muted-foreground">{rate.currencyName}</p>
                          <p className="text-xs text-muted-foreground">{rate.currencyNameAr}</p>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-lg">{rate.currencySymbol}</td>
                      <td className="p-4">
                        {rate.currencyCode === 'USD' ? (
                          <span className="text-muted-foreground">1.000000</span>
                        ) : (
                          <Input
                            type="number"
                            step="0.000001"
                            value={edit?.rateToUsd || ''}
                            onChange={(e) => handleRateChange(rate.currencyCode, 'rateToUsd', e.target.value)}
                            className="w-36"
                          />
                        )}
                      </td>
                      <td className="p-4">
                        {rate.currencyCode === 'USD' ? (
                          <span className="text-muted-foreground">1.000000</span>
                        ) : (
                          <Input
                            type="number"
                            step="0.000001"
                            value={edit?.rateFromUsd || ''}
                            onChange={(e) => handleRateChange(rate.currencyCode, 'rateFromUsd', e.target.value)}
                            className="w-36"
                          />
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(rate.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-4 text-right">
                        {rate.currencyCode !== 'USD' && (
                          <Button
                            size="sm"
                            onClick={() => handleSave(rate.currencyCode)}
                            disabled={!hasChanged || saving === rate.currencyCode}
                          >
                            {saving === rate.currencyCode ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Exchange rates are cached for 5 minutes. After updating a rate,
              it may take up to 5 minutes for the change to be reflected across the platform.
              USD is the platform base currency and cannot be edited.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

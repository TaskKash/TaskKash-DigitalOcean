import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface CurrencyContextType {
  currency: string;       // e.g., "EGP"
  symbol: string;         // e.g., "ج.م"
  symbolEn: string;       // e.g., "EGP"
  rateFromUsd: number;
  formatAmount: (amount: number) => string;
  formatAmountEn: (amount: number) => string;
  loading: boolean;
}

const defaultContext: CurrencyContextType = {
  currency: 'EGP',
  symbol: 'ج.م',
  symbolEn: 'EGP',
  rateFromUsd: 31,
  formatAmount: (amount: number) => `${amount.toLocaleString()} ج.م`,
  formatAmountEn: (amount: number) => `${amount.toLocaleString()} EGP`,
  loading: false,
};

const CurrencyContext = createContext<CurrencyContextType>(defaultContext);

export function useCurrency() {
  return useContext(CurrencyContext);
}

interface CurrencyProviderProps {
  children: ReactNode;
  userId?: number;
  advertiserId?: number;
}

import { useTranslation } from 'react-i18next';

export function CurrencyProvider({ children, userId, advertiserId }: CurrencyProviderProps) {
  const { i18n } = useTranslation();
  const [currency, setCurrency] = useState('EGP');
  const [fetchedSymbol, setFetchedSymbol] = useState('');
  const [fetchedSymbolEn, setFetchedSymbolEn] = useState('');
  const [rateFromUsd, setRateFromUsd] = useState(31);
  const [loading, setLoading] = useState(false);

  // Determine which symbol to show based on language
  const isArabic = i18n.language === 'ar';
  const defaultSymbol = isArabic ? 'ج.م' : 'EGP';
  const symbol = fetchedSymbol || defaultSymbol;
  const symbolEn = fetchedSymbolEn || 'EGP';

  useEffect(() => {
    async function fetchCurrency() {
      try {
        setLoading(true);
        let url = '';
        if (advertiserId) {
          url = `/api/currency/advertiser/${advertiserId}`;
        } else if (userId) {
          url = `/api/currency/user/${userId}`;
        } else {
          // Default: just fetch exchange rates and use EGP
          setLoading(false);
          return;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.currency) {
            setCurrency(data.currency.code);
            setFetchedSymbol(data.currency.symbol || data.currency.code);
            setFetchedSymbolEn(data.currency.code);
            setRateFromUsd(data.currency.rateFromUsd || 1);
          }
        }
      } catch (err) {
        console.warn('[CurrencyProvider] Failed to fetch currency, using defaults');
      } finally {
        setLoading(false);
      }
    }

    fetchCurrency();
  }, [userId, advertiserId]);

  const formatAmount = useCallback(
    (amount: number) => `${amount.toLocaleString()} ${symbol}`,
    [symbol]
  );

  const formatAmountEn = useCallback(
    (amount: number) => `${amount.toLocaleString()} ${symbolEn}`,
    [symbolEn]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        symbol,
        symbolEn,
        rateFromUsd,
        formatAmount,
        formatAmountEn,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export default CurrencyContext;

/**
 * Currency Service
 * Handles exchange rate lookups, currency conversion, and user/advertiser currency resolution.
 */
import { getPool } from '../_core/mysql-pool';

export interface ExchangeRate {
  id: number;
  currencyCode: string;
  currencyName: string;
  currencyNameAr: string;
  currencySymbol: string;
  rateToUsd: number;
  rateFromUsd: number;
  isActive: number;
  updatedBy: number | null;
  updatedAt: string;
  createdAt: string;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  nameAr: string;
  symbol: string;
  rateFromUsd: number;
}

// In-memory cache (refreshed every 5 minutes)
let ratesCache: ExchangeRate[] = [];
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function refreshCache(): Promise<void> {
  const now = Date.now();
  if (ratesCache.length > 0 && now - lastCacheTime < CACHE_TTL) return;

  const pool = getPool();
  const [rows] = await pool.execute('SELECT * FROM exchange_rates WHERE isActive = 1');
  ratesCache = rows as ExchangeRate[];
  lastCacheTime = now;
}

/**
 * Get all active exchange rates
 */
export async function getExchangeRates(): Promise<ExchangeRate[]> {
  await refreshCache();
  return ratesCache;
}

/**
 * Get a single exchange rate by currency code
 */
export async function getRate(currencyCode: string): Promise<ExchangeRate | undefined> {
  await refreshCache();
  return ratesCache.find(r => r.currencyCode === currencyCode.toUpperCase());
}

/**
 * Convert an amount between currencies
 */
export async function convert(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = await getRate(fromCurrency);
  const toRate = await getRate(toCurrency);

  if (!fromRate || !toRate) {
    console.warn(`[Currency] Missing rate for ${fromCurrency} or ${toCurrency}, returning original amount`);
    return amount;
  }

  // Convert to USD first, then to target
  const amountInUsd = amount * fromRate.rateToUsd;
  return Math.round(amountInUsd * toRate.rateFromUsd * 100) / 100;
}

/**
 * Get the currency info for a user based on their countryId
 */
export async function getUserCurrency(userId: number): Promise<CurrencyInfo> {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT c.currency as code, c.currencySymbol as symbol,
            COALESCE(er.currencyName, c.currency) as name,
            COALESCE(er.currencyNameAr, '') as nameAr,
            COALESCE(er.rateFromUsd, 1) as rateFromUsd
     FROM users u
     LEFT JOIN countries c ON u.countryId = c.id
     LEFT JOIN exchange_rates er ON c.currency = er.currencyCode
     WHERE u.id = ?`,
    [userId]
  );

  const result = (rows as any[])[0];
  if (!result || !result.code) {
    return { code: 'EGP', name: 'Egyptian Pound', nameAr: 'جنيه مصري', symbol: 'ج.م', rateFromUsd: 31 };
  }

  return {
    code: result.code,
    name: result.name,
    nameAr: result.nameAr,
    symbol: result.symbol,
    rateFromUsd: Number(result.rateFromUsd),
  };
}

/**
 * Get the currency info for an advertiser based on their countryId
 */
export async function getAdvertiserCurrency(advertiserId: number): Promise<CurrencyInfo> {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT c.currency as code, c.currencySymbol as symbol,
            COALESCE(er.currencyName, c.currency) as name,
            COALESCE(er.currencyNameAr, '') as nameAr,
            COALESCE(er.rateFromUsd, 1) as rateFromUsd
     FROM advertisers a
     LEFT JOIN countries c ON a.countryId = c.id
     LEFT JOIN exchange_rates er ON c.currency = er.currencyCode
     WHERE a.id = ?`,
    [advertiserId]
  );

  const result = (rows as any[])[0];
  if (!result || !result.code) {
    return { code: 'EGP', name: 'Egyptian Pound', nameAr: 'جنيه مصري', symbol: 'ج.م', rateFromUsd: 31 };
  }

  return {
    code: result.code,
    name: result.name,
    nameAr: result.nameAr,
    symbol: result.symbol,
    rateFromUsd: Number(result.rateFromUsd),
  };
}

/**
 * Admin: update an exchange rate
 */
export async function updateExchangeRate(
  currencyCode: string,
  rateToUsd: number,
  rateFromUsd: number,
  adminId: number
): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.execute(
    `UPDATE exchange_rates SET rateToUsd = ?, rateFromUsd = ?, updatedBy = ?, updatedAt = NOW() WHERE currencyCode = ?`,
    [rateToUsd, rateFromUsd, adminId, currencyCode.toUpperCase()]
  );

  // Invalidate cache
  lastCacheTime = 0;

  return (result as any).affectedRows > 0;
}

export default {
  getExchangeRates,
  getRate,
  convert,
  getUserCurrency,
  getAdvertiserCurrency,
  updateExchangeRate,
};

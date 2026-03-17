/**
 * Currency & Countries API Routes
 * Public routes for countries list and exchange rates
 * Admin routes for managing exchange rates
 */
import { Router, Request, Response } from 'express';
import { getPool } from './mysql-pool';
import currencyService from '../services/currency.service';

const currencyRouter = Router();

/**
 * GET /api/countries - Get all active countries
 * Public — used by registration forms
 */
currencyRouter.get('/countries', async (_req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, code, nameAr, nameEn, currency, currencySymbol
       FROM countries WHERE isActive = 1 ORDER BY nameEn ASC`
    );
    return res.json({ success: true, countries: rows });
  } catch (error) {
    console.error('[Currency] Error fetching countries:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch countries' });
  }
});

/**
 * GET /api/exchange-rates - Get all active exchange rates
 * Public — used by frontend CurrencyContext
 */
currencyRouter.get('/exchange-rates', async (_req: Request, res: Response) => {
  try {
    const rates = await currencyService.getExchangeRates();
    return res.json({ success: true, rates });
  } catch (error) {
    console.error('[Currency] Error fetching exchange rates:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch exchange rates' });
  }
});

/**
 * GET /api/currency/user/:userId - Get currency info for a user
 */
currencyRouter.get('/currency/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ success: false, error: 'Invalid userId' });
    
    const currency = await currencyService.getUserCurrency(userId);
    return res.json({ success: true, currency });
  } catch (error) {
    console.error('[Currency] Error fetching user currency:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch user currency' });
  }
});

/**
 * GET /api/currency/advertiser/:advertiserId - Get currency info for an advertiser
 */
currencyRouter.get('/currency/advertiser/:advertiserId', async (req: Request, res: Response) => {
  try {
    const advertiserId = parseInt(req.params.advertiserId);
    if (isNaN(advertiserId)) return res.status(400).json({ success: false, error: 'Invalid advertiserId' });
    
    const currency = await currencyService.getAdvertiserCurrency(advertiserId);
    return res.json({ success: true, currency });
  } catch (error) {
    console.error('[Currency] Error fetching advertiser currency:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch advertiser currency' });
  }
});

/**
 * Admin: PUT /api/admin/exchange-rates/:code - Update an exchange rate
 */
currencyRouter.put('/admin/exchange-rates/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { rateToUsd, rateFromUsd } = req.body;

    if (!rateToUsd || !rateFromUsd) {
      return res.status(400).json({ success: false, error: 'rateToUsd and rateFromUsd are required' });
    }

    const updated = await currencyService.updateExchangeRate(
      code,
      parseFloat(rateToUsd),
      parseFloat(rateFromUsd),
      1 // admin ID
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Currency not found' });
    }

    return res.json({ success: true, message: `Exchange rate for ${code} updated` });
  } catch (error) {
    console.error('[Currency] Error updating exchange rate:', error);
    return res.status(500).json({ success: false, error: 'Failed to update exchange rate' });
  }
});

/**
 * Admin: GET /api/admin/exchange-rates - Get all exchange rates (admin view with full details)
 */
currencyRouter.get('/admin/exchange-rates', async (_req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM exchange_rates ORDER BY currencyCode ASC');
    return res.json({ success: true, rates: rows });
  } catch (error) {
    console.error('[Currency] Error fetching admin exchange rates:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch exchange rates' });
  }
});

export default currencyRouter;

import { Router, Request, Response } from 'express';
import { USER_TIERS, ADVERTISER_TIERS, isLaunchPhaseActive, LAUNCH_PHASE } from '../config/business.config';

const router = Router();

/**
 * GET /api/config/commissions
 * Returns the current commission rates based on tiers and launch phase
 */
router.get('/config/commissions', (req: Request, res: Response) => {
  try {
    const isLaunch = isLaunchPhaseActive();
    
    res.json({
      isLaunchPhase: isLaunch,
      launchPhaseConfig: LAUNCH_PHASE,
      userTiers: USER_TIERS,
      advertiserTiers: ADVERTISER_TIERS
    });
  } catch (error) {
    console.error('Error fetching commission configs:', error);
    res.status(500).json({ error: 'Failed to fetch commission configurations' });
  }
});

export default router;

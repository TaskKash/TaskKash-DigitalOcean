// Unified TASKKASH Theme Configuration
// Use these colors consistently across all pages

export const theme = {
  // Brand Colors
  primary: {
    orange: '#FF7900',  // TASK
    green: '#7BA866',   // KA$H
    main: '#10B981',    // Primary green for buttons/actions
  },
  
  // Tier Colors
  tiers: {
    tier1: { name: 'Bronze', color: '#CD7F32', bg: '#FFF3E0' },
    tier2: { name: 'Silver', color: '#C0C0C0', bg: '#F5F5F5' },
    tier3: { name: 'Gold', color: '#FFD700', bg: '#FFF9C4' },
    tier4: { name: 'Platinum', color: '#E5E4E2', bg: '#F0F0F0' },
  },
  
  // Status Colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Background Gradients
  gradients: {
    primary: 'from-green-500 to-emerald-600',
    secondary: 'from-orange-500 to-amber-600',
    hero: 'from-green-600 via-emerald-600 to-teal-600',
  },
  
  // Typography
  fonts: {
    heading: 'font-bold',
    body: 'font-normal',
  },
};

// Helper function to get tier info
export function getTierInfo(tier: string) {
  const tierMap: Record<string, typeof theme.tiers.tier1> = {
    tier1: theme.tiers.tier1,
    tier2: theme.tiers.tier2,
    tier3: theme.tiers.tier3,
    tier4: theme.tiers.tier4,
  };
  return tierMap[tier] || theme.tiers.tier1;
}

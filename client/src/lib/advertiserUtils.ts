/**
 * Utility functions for advertiser management
 */

/**
 * Convert advertiser name to URL-friendly ID
 * Examples:
 * - "Vodafone Egypt" → "vodafone-egypt"
 * - "Jumia Egypt" → "jumia-egypt"
 * - "بنك مصر" → "banque-misr"
 */
export function getAdvertiserId(advertiserName: string): string {
  // Map of Arabic advertiser names to English IDs
  const arabicToEnglishMap: Record<string, string> = {
    'بنك مصر': 'banque-misr',
    'بنك الأهلي المصري': 'nbe',
    'بنك القاهرة': 'banque-du-caire',
    'بنك CIB': 'cib',
    'مصر للطيران': 'egyptair',
    'اتصالات مصر': 'etisalat',
    'أورانج مصر': 'orange',
    'وي (WE)': 'we',
    'مترو الأنفاق': 'cairo-metro',
    'شركة مياه الشرب': 'water-company',
    'شركة الكهرباء': 'electricity-company',
    'مطور ألعاب': 'game-developer',
    'تطبيق صحي': 'health-app',
    'شركة عقارات': 'real-estate',
    'متجر إلكتروني': 'online-store',
    'مطعم محلي': 'local-restaurant',
    'سامسونج مصر': 'samsung-egypt',
    'Samsung Egypt': 'samsung-egypt',
  };

  // Check if it's an Arabic name
  if (arabicToEnglishMap[advertiserName]) {
    return arabicToEnglishMap[advertiserName];
  }

  // Convert English names to URL-friendly format
  return advertiserName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Get advertiser display name from ID
 */
export function getAdvertiserName(advertiserId: string): string {
  const idToNameMap: Record<string, string> = {
    'vodafone-egypt': 'Vodafone Egypt',
    'jumia-egypt': 'Jumia Egypt',
    'noon-egypt': 'Noon Egypt',
    'banque-misr': 'بنك مصر',
    'classera-egypt': 'Classera Egypt',
    'careem-egypt': 'Careem Egypt',
    'uber-egypt': 'Uber Egypt',
    'nbe': 'بنك الأهلي المصري',
    'cib': 'بنك CIB',
    'banque-du-caire': 'بنك القاهرة',
    'egyptair': 'مصر للطيران',
    'etisalat': 'اتصالات مصر',
    'orange': 'أورانج مصر',
    'we': 'وي (WE)',
    'cairo-metro': 'مترو الأنفاق',
    'water-company': 'شركة مياه الشرب',
    'electricity-company': 'شركة الكهرباء',
    'game-developer': 'مطور ألعاب',
    'health-app': 'تطبيق صحي',
    'real-estate': 'شركة عقارات',
    'online-store': 'متجر إلكتروني',
    'local-restaurant': 'مطعم محلي',
    'samsung-egypt': 'Samsung Egypt',
  };

  return idToNameMap[advertiserId] || advertiserId;
}

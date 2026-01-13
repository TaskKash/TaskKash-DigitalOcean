import i18n from './i18n';

/**
 * Auto-translation mapping for common Arabic texts
 * This allows automatic translation without modifying every page
 */
const translationMap: Record<string, { ar: string; en: string }> = {
  // Common greetings
  'مرحباً،': { ar: 'مرحباً،', en: 'Hello,' },
  'مرحباً': { ar: 'مرحباً', en: 'Hello' },
  
  // Tier names
  'برونزي': { ar: 'برونزي', en: 'Bronze' },
  'فضي': { ar: 'فضي', en: 'Silver' },
  'ذهبي': { ar: 'ذهبي', en: 'Gold' },
  'بلاتيني': { ar: 'بلاتيني', en: 'Platinum' },
  
  // Balance & Wallet
  'رصيدك الحالي': { ar: 'رصيدك الحالي', en: 'Current Balance' },
  'إدارة المحفظة': { ar: 'إدارة المحفظة', en: 'Manage Wallet' },
  'عزز ملفك الآن': { ar: 'عزز ملفك الآن', en: 'Boost Your Profile Now' },
  
  // Stats
  'المهام المكتملة': { ar: 'المهام المكتملة', en: 'Completed Tasks' },
  'إجمالي الأرباح': { ar: 'إجمالي الأرباح', en: 'Total Earnings' },
  
  // Tasks
  'مهام مميزة': { ar: 'مهام مميزة', en: 'Featured Tasks' },
  'عرض الكل': { ar: 'عرض الكل', en: 'View All' },
  'دقيقة': { ar: 'دقيقة', en: 'min' },
  
  // Difficulty
  'سهل': { ar: 'سهل', en: 'Easy' },
  'متوسط': { ar: 'متوسط', en: 'Medium' },
  'صعب': { ar: 'صعب', en: 'Hard' },
  
  // Currency
  'ج.م': { ar: 'ج.م', en: 'EGP' },
  'ريال': { ar: 'ريال', en: 'SAR' },
};

/**
 * Auto-translate a text based on current language
 * @param text - The Arabic text to translate
 * @returns Translated text based on current language
 */
export function t(text: string): string {
  const currentLang = i18n.language || 'ar';
  
  if (currentLang === 'ar') {
    return text; // Return original Arabic text
  }
  
  // Look up translation
  const translation = translationMap[text];
  if (translation) {
    return translation.en;
  }
  
  // If no translation found, return original text
  return text;
}

/**
 * Add more translations dynamically
 */
export function addTranslations(translations: Record<string, { ar: string; en: string }>) {
  Object.assign(translationMap, translations);
}

export default t;

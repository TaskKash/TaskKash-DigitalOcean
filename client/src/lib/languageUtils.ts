import { useTranslation } from 'react-i18next';

/**
 * Get localized field value based on current language
 * @param obj Object containing both Arabic and English fields
 * @param fieldName Base field name (e.g., 'title', 'name', 'description')
 * @returns Localized value
 */
export function useLocalizedField<T extends Record<string, any>>(
  obj: T | null | undefined,
  fieldName: string
): string {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  
  if (!obj) return '';
  
  // Check if object has language-specific fields
  const arField = `${fieldName}Ar`;
  const enField = `${fieldName}En`;
  
  if (currentLang === 'en' && obj[enField]) {
    return obj[enField];
  }
  
  if (currentLang === 'ar' && obj[arField]) {
    return obj[arField];
  }
  
  // Fallback to base field or Arabic field
  return obj[fieldName] || obj[arField] || obj[enField] || '';
}

/**
 * Get localized field value (non-hook version for use outside components)
 * @param obj Object containing both Arabic and English fields
 * @param fieldName Base field name
 * @param language Current language ('ar' or 'en')
 * @returns Localized value
 */
export function getLocalizedField<T extends Record<string, any>>(
  obj: T | null | undefined,
  fieldName: string,
  language: string = 'ar'
): string {
  if (!obj) return '';
  
  const arField = `${fieldName}Ar`;
  const enField = `${fieldName}En`;
  
  if (language === 'en' && obj[enField]) {
    return obj[enField];
  }
  
  if (language === 'ar' && obj[arField]) {
    return obj[arField];
  }
  
  return obj[fieldName] || obj[arField] || obj[enField] || '';
}

/**
 * Hook to get a localized field getter function
 * @returns Function to get localized field
 */
export function useLocalizedFieldGetter() {
  const { i18n } = useTranslation();
  
  return <T extends Record<string, any>>(
    obj: T | null | undefined,
    fieldName: string
  ): string => {
    return getLocalizedField(obj, fieldName, i18n.language);
  };
}

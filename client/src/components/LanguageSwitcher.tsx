import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Update document direction
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  // Show the opposite language name (what user can switch TO)
  const displayLanguage = i18n.language === 'ar' ? 'English' : 'العربية';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-sm font-medium">
          {displayLanguage}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => changeLanguage('ar')}
          className={i18n.language === 'ar' ? 'bg-accent' : ''}
        >
          <span className="ml-2">🇸🇦</span>
          العربية
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage('en')}
          className={i18n.language === 'en' ? 'bg-accent' : ''}
        >
          <span className="ml-2">🇬🇧</span>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

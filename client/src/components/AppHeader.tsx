import { BrandName } from './BrandName';
import LanguageSwitcher from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

interface AppHeaderProps {
  showThemeToggle?: boolean;
  className?: string;
}

export function AppHeader({ showThemeToggle = true, className = '' }: AppHeaderProps) {
  return (
    <header className={`fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 flex items-center justify-between p-4 ${className}`}>
      <BrandName size="xl" clickable={true} />
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        {showThemeToggle && <ThemeToggle />}
      </div>
    </header>
  );
}

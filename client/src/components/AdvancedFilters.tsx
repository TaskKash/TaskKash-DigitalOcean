import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X, ArrowUpDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface FilterOptions {
  category: string[];
  difficulty: string[];
  reward: { min: number; max: number };
  duration: { min: number; max: number };
  sortBy?: 'default' | 'value-high' | 'value-low' | 'duration' | 'difficulty';
  advertiserId?: number | null;
}

interface Advertiser {
  id: number;
  nameEn: string;
  nameAr: string;
  logoUrl?: string;
  activeTaskCount: number;
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  activeFilters: FilterOptions;
}

export default function AdvancedFilters({ onFilterChange, activeFilters }: AdvancedFiltersProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const isArabic = i18n.language === 'ar';

  // Fetch advertisers with active tasks
  useEffect(() => {
    const fetchAdvertisers = async () => {
      try {
        const response = await fetch('/api/advertisers/with-active-tasks', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setAdvertisers(data.advertisers || []);
        }
      } catch (error) {
        console.error('Error fetching advertisers:', error);
      }
    };
    fetchAdvertisers();
  }, []);

  // Use useMemo to update categories and difficulties when language changes
  const categories = useMemo(() => isArabic 
    ? ['تطبيقات', 'استبيانات', 'تسوق', 'تعليم', 'ترفيه']
    : ['Apps', 'Surveys', 'Shopping', 'Education', 'Entertainment'], [isArabic]);
  
  const difficulties = useMemo(() => isArabic 
    ? ['سهل', 'متوسط', 'صعب']
    : ['Easy', 'Medium', 'Hard'], [isArabic]);

  // Clear filters when language changes to avoid stale filter values
  useEffect(() => {
    if (activeFilters.category.length > 0 || activeFilters.difficulty.length > 0) {
      clearFilters();
    }
  }, [i18n.language]);

  const toggleCategory = (cat: string) => {
    const newCategories = activeFilters.category.includes(cat)
      ? activeFilters.category.filter(c => c !== cat)
      : [...activeFilters.category, cat];
    onFilterChange({ ...activeFilters, category: newCategories });
  };

  const toggleDifficulty = (diff: string) => {
    const newDifficulties = activeFilters.difficulty.includes(diff)
      ? activeFilters.difficulty.filter(d => d !== diff)
      : [...activeFilters.difficulty, diff];
    onFilterChange({ ...activeFilters, difficulty: newDifficulties });
  };

  const clearFilters = () => {
    onFilterChange({
      category: [],
      difficulty: [],
      reward: { min: 0, max: 1000 },
      duration: { min: 0, max: 120 },
      sortBy: 'default',
      advertiserId: null
    });
  };

  const setAdvertiser = (id: number | null) => {
    onFilterChange({ ...activeFilters, advertiserId: id });
  };

  const setSortBy = (sortBy: FilterOptions['sortBy']) => {
    onFilterChange({ ...activeFilters, sortBy });
  };

  const activeCount = activeFilters.category.length + activeFilters.difficulty.length + (activeFilters.advertiserId ? 1 : 0);

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          {t('tasks.advancedFilters', 'Advanced Filters')}
        </span>
        {activeCount > 0 && (
          <Badge variant="secondary" className="ml-2">
            {activeCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="p-4 space-y-4 bg-card text-card-foreground">
          {/* Advertiser Filter */}
          {advertisers.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-foreground dark:text-white">
                {t('tasks.advertiser', 'Advertiser')}
              </h4>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={!activeFilters.advertiserId ? 'default' : 'outline'}
                  className="cursor-pointer text-foreground dark:text-gray-200"
                  onClick={() => setAdvertiser(null)}
                >
                  {t('common.all', 'All')}
                </Badge>
                {advertisers.map(adv => (
                  <Badge
                    key={adv.id}
                    variant={activeFilters.advertiserId === adv.id ? 'default' : 'outline'}
                    className="cursor-pointer text-foreground dark:text-gray-200"
                    onClick={() => setAdvertiser(adv.id)}
                  >
                    {isArabic ? adv.nameAr : adv.nameEn}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-foreground dark:text-white">
              {t('tasks.category', 'Category')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Badge
                  key={cat}
                  variant={activeFilters.category.includes(cat) ? 'default' : 'outline'}
                  className="cursor-pointer text-foreground dark:text-gray-200"
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-foreground dark:text-white">
              {t('tasks.difficulty', 'Difficulty')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {difficulties.map(diff => (
                <Badge
                  key={diff}
                  variant={activeFilters.difficulty.includes(diff) ? 'default' : 'outline'}
                  className="cursor-pointer text-foreground dark:text-gray-200"
                  onClick={() => toggleDifficulty(diff)}
                >
                  {diff}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-foreground dark:text-white">
              <ArrowUpDown className="w-4 h-4" />
              {t('tasks.sortBy', 'Sort By')}
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={!activeFilters.sortBy || activeFilters.sortBy === 'default' ? 'default' : 'outline'}
                className="cursor-pointer text-foreground dark:text-gray-200"
                onClick={() => setSortBy('default')}
              >
                {t('tasks.sortDefault', 'Default')}
              </Badge>
              <Badge
                variant={activeFilters.sortBy === 'value-high' ? 'default' : 'outline'}
                className="cursor-pointer text-foreground dark:text-gray-200"
                onClick={() => setSortBy('value-high')}
              >
                {t('tasks.sortValueHigh', 'Value: High to Low')}
              </Badge>
              <Badge
                variant={activeFilters.sortBy === 'value-low' ? 'default' : 'outline'}
                className="cursor-pointer text-foreground dark:text-gray-200"
                onClick={() => setSortBy('value-low')}
              >
                {t('tasks.sortValueLow', 'Value: Low to High')}
              </Badge>
              <Badge
                variant={activeFilters.sortBy === 'duration' ? 'default' : 'outline'}
                className="cursor-pointer text-foreground dark:text-gray-200"
                onClick={() => setSortBy('duration')}
              >
                {t('tasks.sortDuration', 'Duration')}
              </Badge>
              <Badge
                variant={activeFilters.sortBy === 'difficulty' ? 'default' : 'outline'}
                className="cursor-pointer text-foreground dark:text-gray-200"
                onClick={() => setSortBy('difficulty')}
              >
                {t('tasks.sortDifficulty', 'Difficulty')}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={clearFilters}
            >
              <X className="w-4 h-4 mr-1" />
              {t('common.clearAll', 'Clear All')}
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              {t('common.apply', 'Apply')}
            </Button>
          </div>
        </Card>
      )}

      {/* Active Filters Display */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.category.map(cat => (
            <Badge key={cat} variant="secondary" className="gap-1 text-foreground dark:text-gray-200">
              {cat}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => toggleCategory(cat)}
              />
            </Badge>
          ))}
          {activeFilters.difficulty.map(diff => (
            <Badge key={diff} variant="secondary" className="gap-1 text-foreground dark:text-gray-200">
              {diff}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => toggleDifficulty(diff)}
              />
            </Badge>
          ))}
          {activeFilters.advertiserId && (
            <Badge variant="secondary" className="gap-1 text-foreground dark:text-gray-200">
              {isArabic 
                ? advertisers.find(a => a.id === activeFilters.advertiserId)?.nameAr 
                : advertisers.find(a => a.id === activeFilters.advertiserId)?.nameEn}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setAdvertiser(null)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

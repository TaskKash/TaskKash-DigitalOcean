/**
 * ListItem Component
 * 
 * Reusable list item component for transactions, tasks, etc.
 * Matches the design from the Wallet transactions list.
 */

import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { designSystem, cn } from '@/lib/design-system';
import { LucideIcon } from 'lucide-react';

interface ListItemProps {
  icon?: LucideIcon;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value?: string | number;
  valueColor?: 'primary' | 'error' | 'warning' | 'info';
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  onClick?: () => void;
  className?: string;
}

export function ListItem({
  icon: Icon,
  iconColor = 'text-primary',
  title,
  subtitle,
  value,
  valueColor = 'primary',
  badge,
  badgeVariant = 'default',
  onClick,
  className,
}: ListItemProps) {
  const colorClasses = {
    primary: 'text-primary',
    error: 'text-red-600',
    warning: 'text-orange-600',
    info: 'text-blue-600',
  };

  return (
    <Card 
      className={cn(
        designSystem.cards.interactive,
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        {Icon && (
          <div className={cn(
            'w-10 h-10 rounded-full bg-muted flex items-center justify-center',
            iconColor
          )}>
            <Icon className={designSystem.icons.small} />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{title}</p>
          {subtitle && (
            <p className={designSystem.typography.caption}>{subtitle}</p>
          )}
        </div>

        {/* Value and Badge */}
        <div className="text-right">
          {value && (
            <p className={cn('font-bold', colorClasses[valueColor])}>
              {value}
            </p>
          )}
          {badge && (
            <Badge variant={badgeVariant} className="text-xs mt-1">
              {badge}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

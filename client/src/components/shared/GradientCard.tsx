/**
 * GradientCard Component
 * 
 * Reusable gradient card component matching the Wallet page design.
 * Used for displaying primary information like balance, stats, etc.
 */

import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { designSystem, cn } from '@/lib/design-system';
import { LucideIcon } from 'lucide-react';

interface GradientCardProps {
  icon?: LucideIcon;
  label?: string;
  value: string | number;
  currency?: string;
  children?: ReactNode;
  className?: string;
}

export function GradientCard({
  icon: Icon,
  label,
  value,
  currency,
  children,
  className,
}: GradientCardProps) {
  return (
    <Card className={cn(designSystem.cards.gradient, className)}>
      {/* Label with Icon */}
      {(Icon || label) && (
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className={designSystem.icons.small} />}
          {label && <p className="text-sm opacity-90">{label}</p>}
        </div>
      )}

      {/* Value Display */}
      <div className="flex items-baseline gap-2 mb-6">
        <h1 className={designSystem.typography.valueLarge}>{value}</h1>
        {currency && <span className="text-xl">{currency}</span>}
      </div>

      {/* Action Buttons or Custom Content */}
      {children}
    </Card>
  );
}

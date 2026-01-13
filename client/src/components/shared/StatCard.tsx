/**
 * StatCard Component
 * 
 * Reusable stat card component for displaying metrics.
 * Used in Wallet, Home, and other dashboard pages.
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { designSystem, cn } from '@/lib/design-system';

interface StatCardProps {
  label: string;
  value: string | number;
  valueColor?: 'primary' | 'error' | 'warning' | 'info' | 'default';
  className?: string;
}

export function StatCard({
  label,
  value,
  valueColor = 'primary',
  className,
}: StatCardProps) {
  const colorClasses = {
    primary: 'text-primary',
    error: 'text-red-600',
    warning: 'text-orange-600',
    info: 'text-blue-600',
    default: 'text-foreground',
  };

  return (
    <Card className={cn(designSystem.cards.stat, className)}>
      <p className={designSystem.typography.caption}>{label}</p>
      <p className={cn(designSystem.typography.value, colorClasses[valueColor])}>
        {value}
      </p>
    </Card>
  );
}

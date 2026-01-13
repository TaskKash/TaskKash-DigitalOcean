/**
 * SectionHeader Component
 * 
 * Reusable section header component for consistent typography.
 */

import React, { ReactNode } from 'react';
import { designSystem, cn } from '@/lib/design-system';

interface SectionHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function SectionHeader({ children, className, action }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <h3 className={designSystem.typography.sectionTitle}>{children}</h3>
      {action && <div>{action}</div>}
    </div>
  );
}

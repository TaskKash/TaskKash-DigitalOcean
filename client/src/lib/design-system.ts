/**
 * TaskKash Design System
 * 
 * Centralized design configuration for consistent styling across all pages.
 * Update values here to reflect changes across the entire application.
 * 
 * Last Updated: November 5, 2025
 */

export const designSystem = {
  // Color Palette
  colors: {
    primary: {
      main: 'hsl(var(--primary))',
      foreground: 'hsl(var(--primary-foreground))',
      light: 'hsl(var(--primary) / 0.1)',
    },
    secondary: {
      main: 'hsl(var(--secondary))',
      foreground: 'hsl(var(--secondary-foreground))',
    },
    success: {
      main: 'text-primary',
      bg: 'bg-primary/10',
    },
    error: {
      main: 'text-red-600',
      bg: 'bg-red-50',
    },
    warning: {
      main: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    info: {
      main: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  },

  // Gradients
  gradients: {
    primary: 'bg-gradient-to-br from-primary to-secondary',
    primaryLight: 'bg-gradient-to-br from-primary/90 to-secondary/90',
    card: 'bg-gradient-to-br from-green-400 to-green-50',
  },

  // Spacing
  spacing: {
    page: 'p-4',
    section: 'space-y-6',
    card: 'p-6',
    cardSmall: 'p-4',
    cardTiny: 'p-3',
    gap: {
      small: 'gap-2',
      medium: 'gap-3',
      large: 'gap-4',
    },
  },

  // Typography
  typography: {
    pageTitle: 'text-2xl font-bold',
    sectionTitle: 'text-lg font-semibold mb-4',
    cardTitle: 'text-base font-semibold',
    label: 'text-sm text-muted-foreground',
    value: 'text-lg font-bold',
    valueLarge: 'text-4xl font-bold',
    body: 'text-sm',
    caption: 'text-xs text-muted-foreground',
  },

  // Card Styles
  cards: {
    base: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    gradient: 'rounded-lg bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-lg',
    stat: 'rounded-lg border bg-card p-3 text-center shadow-sm',
    interactive: 'rounded-lg border bg-card p-4 cursor-pointer hover:shadow-md transition-shadow',
  },

  // Button Styles
  buttons: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    onGradient: 'bg-white text-primary hover:bg-gray-100',
    onGradientOutline: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
  },

  // Badge Styles
  badges: {
    success: 'bg-primary/10 text-primary border-primary/20',
    error: 'bg-red-50 text-red-600 border-red-200',
    warning: 'bg-orange-50 text-orange-600 border-orange-200',
    info: 'bg-blue-50 text-blue-600 border-blue-200',
    default: 'bg-secondary text-secondary-foreground',
  },

  // Icon Sizes
  icons: {
    tiny: 'w-4 h-4',
    small: 'w-5 h-5',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xlarge: 'w-10 h-10',
  },

  // Layout
  layout: {
    maxWidth: 'max-w-md mx-auto',
    container: 'container mx-auto',
    grid: {
      two: 'grid grid-cols-2 gap-3',
      three: 'grid grid-cols-3 gap-3',
      four: 'grid grid-cols-4 gap-3',
    },
  },

  // Transitions
  transitions: {
    default: 'transition-all duration-200',
    fast: 'transition-all duration-150',
    slow: 'transition-all duration-300',
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    none: 'shadow-none',
  },

  // Border Radius
  radius: {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  },
};

// Helper function to combine classes
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Pre-built component class combinations
export const componentClasses = {
  // Gradient Balance Card
  balanceCard: cn(
    designSystem.cards.gradient,
    designSystem.shadows.lg
  ),

  // Stat Card
  statCard: cn(
    designSystem.cards.stat,
    designSystem.shadows.sm
  ),

  // Transaction/Task List Item
  listItem: cn(
    designSystem.cards.interactive,
    designSystem.spacing.cardSmall
  ),

  // Section Header
  sectionHeader: cn(
    designSystem.typography.sectionTitle
  ),

  // Page Container
  pageContainer: cn(
    designSystem.spacing.page,
    designSystem.spacing.section
  ),
};

import { useLocation } from 'wouter';

interface BrandNameProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  clickable?: boolean;
}

export function BrandName({ className = '', size = 'xl', clickable = true }: BrandNameProps) {
  const [, setLocation] = useLocation();
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };

  const handleClick = () => {
    if (clickable) {
      setLocation('/home');
    }
  };

  return (
    <span 
      className={`font-bold ${sizeClasses[size]} ${className} ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={handleClick}
    >
      <span style={{ color: '#FF7900' }}>TASK</span>
      <span style={{ color: '#7BA866' }}>KA$H</span>
    </span>
  );
}

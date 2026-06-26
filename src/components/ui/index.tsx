import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// ============================================
// BUTTON COMPONENT
// ============================================
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  glow?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, glow, type, onClick, onSubmit }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40',
      secondary: 'bg-dark-800/50 border border-dark-700/50 text-dark-100 hover:bg-dark-700/50 hover:border-dark-600/50',
      ghost: 'text-dark-300 hover:text-white hover:bg-dark-800/50',
      danger: 'bg-gradient-to-r from-error-600 to-error-500 text-white hover:from-error-500 hover:to-error-400',
      outline: 'border-2 border-primary-500/50 text-primary-400 hover:bg-primary-500/10 hover:border-primary-500',
      gradient: 'btn-gradient text-white',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-5 py-2.5 text-sm rounded-xl',
      lg: 'px-7 py-3 text-base rounded-xl',
      xl: 'px-10 py-4 text-lg rounded-2xl',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          glow && 'glow-primary',
          className
        )}
        disabled={disabled || isLoading}
        type={type}
        onClick={onClick}
        onSubmit={onSubmit}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

// ============================================
// INPUT COMPONENT
// ============================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-dark-200 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500',
            'focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20',
            'transition-all duration-300',
            leftIcon && 'pl-12',
            rightIcon && 'pr-12',
            error && 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-error-400">{error}</p>}
      {hint && !error && <p className="mt-2 text-sm text-dark-500">{hint}</p>}
    </div>
  )
);
Input.displayName = 'Input';

// ============================================
// TEXTAREA COMPONENT
// ============================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-dark-200 mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'w-full px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500',
          'focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20',
          'transition-all duration-300 resize-none',
          error && 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
          className
        )}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-error-400">{error}</p>}
      {hint && !error && <p className="mt-2 text-sm text-dark-500">{hint}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';

// ============================================
// CARD COMPONENT
// ============================================
interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  glow?: 'primary' | 'secondary' | 'accent' | 'none';
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Card = ({ children, className, onClick, hover = true, glow = 'none', onMouseEnter, onMouseLeave }: CardProps) => (
  <motion.div
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    whileHover={onClick && hover ? { y: -4, scale: 1.01 } : undefined}
    className={cn(
      'glass-card overflow-hidden',
      onClick && 'cursor-pointer',
      glow === 'primary' && 'hover:glow-primary',
      glow === 'secondary' && 'hover:glow-secondary',
      glow === 'accent' && 'hover:glow-accent',
      className
    )}
  >
    {children}
  </motion.div>
);

// ============================================
// BADGE COMPONENT
// ============================================
interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

export const Badge = ({ children, variant = 'default', size = 'md', className, dot }: BadgeProps) => {
  const variants = {
    default: 'bg-dark-700/50 text-dark-300 border-dark-600/50',
    primary: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
    secondary: 'bg-secondary-500/20 text-secondary-400 border-secondary-500/30',
    success: 'bg-success-500/20 text-success-400 border-success-500/30',
    warning: 'bg-warning-500/20 text-warning-400 border-warning-500/30',
    error: 'bg-error-500/20 text-error-400 border-error-500/30',
    outline: 'bg-transparent text-primary-400 border-primary-500/50',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium border',
      variants[variant],
      sizes[size],
      className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', variant === 'success' ? 'bg-success-400' : variant === 'warning' ? 'bg-warning-400' : variant === 'error' ? 'bg-error-400' : 'bg-primary-400')} />}
      {children}
    </span>
  );
};

// ============================================
// MODAL COMPONENT
// ============================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ isOpen, onClose, title, description, children, size = 'md' }: ModalProps) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={cn('relative w-full glass-card p-6', sizes[size])}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        )}
        {description && (
          <p className="text-dark-400 mb-6">{description}</p>
        )}
        {children}
      </motion.div>
    </div>
  );
};

// ============================================
// AVATAR COMPONENT
// ============================================
interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  verified?: boolean;
}

export const Avatar = ({ src, name, size = 'md', className, verified }: AvatarProps) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  return (
    <div className="relative">
      <div className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 text-white font-semibold shadow-lg',
        sizes[size],
        className
      )}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover rounded-full" />
        ) : (
          initials
        )}
      </div>
      {verified && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success-500 rounded-full border-2 border-dark-900 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

// ============================================
// SKELETON LOADING COMPONENT
// ============================================
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton = ({ className, variant = 'rectangular' }: SkeletonProps) => {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div className={cn('skeleton', variants[variant], className)} />
  );
};

// ============================================
// STAT CARD COMPONENT
// ============================================
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: number;
  changeLabel?: string;
}

export const StatCard = ({ title, value, icon, change, changeLabel }: StatCardProps) => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-dark-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {change !== undefined && (
          <p className={cn('text-sm mt-2', change >= 0 ? 'text-success-400' : 'text-error-400')}>
            {change >= 0 ? '+' : ''}{change}% {changeLabel || 'from last month'}
          </p>
        )}
      </div>
      {icon && (
        <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400">
          {icon}
        </div>
      )}
    </div>
  </Card>
);

// ============================================
// EMPTY STATE COMPONENT
// ============================================
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="text-center py-12">
    {icon && <div className="mb-4 text-dark-600">{icon}</div>}
    <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
    {description && <p className="text-dark-400 mb-6">{description}</p>}
    {action}
  </div>
);

// ============================================
// TABS COMPONENT
// ============================================
interface TabsProps {
  tabs: { id: string; label: string; icon?: ReactNode; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const Tabs = ({ tabs, activeTab, onChange }: TabsProps) => (
  <div className="flex gap-2 overflow-x-auto pb-2">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300',
          activeTab === tab.id
            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
            : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
        )}
      >
        {tab.icon}
        {tab.label}
        {tab.count !== undefined && (
          <span className={cn(
            'px-2 py-0.5 rounded-full text-xs',
            activeTab === tab.id ? 'bg-primary-500/30' : 'bg-dark-700/50'
          )}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

// ============================================
// SELECT COMPONENT
// ============================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-dark-200 mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white',
          'focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20',
          'transition-all duration-300 cursor-pointer',
          error && 'border-error-500',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-dark-900">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-error-400">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';

// ============================================
// SWITCH/TOGGLE COMPONENT
// ============================================
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export const Switch = ({ checked, onChange, label, description }: SwitchProps) => (
  <label className="flex items-center justify-between cursor-pointer">
    <div>
      {label && <span className="text-white font-medium">{label}</span>}
      {description && <p className="text-sm text-dark-400">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors duration-300',
        checked ? 'bg-primary-500' : 'bg-dark-700'
      )}
    >
      <span
        className={cn(
          'absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300',
          checked && 'translate-x-5'
        )}
      />
    </button>
  </label>
);

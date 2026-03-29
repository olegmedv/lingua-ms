import { forwardRef } from 'react';

type Variant = 'primary' | 'outline' | 'danger' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const styles: Record<Variant, string> = {
  primary: 'bg-brand hover:bg-brand-light text-white',
  outline: 'border-2 border-brand text-brand hover:bg-brand/5',
  danger:  'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
  ghost:   'text-gray-600 hover:bg-gray-100',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', fullWidth, className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      className={`font-bold py-3 px-6 rounded-xl text-lg transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${styles[variant]}
        ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = 'Button';
export default Button;

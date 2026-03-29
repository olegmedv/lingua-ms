type BadgeVariant = 'brand' | 'success' | 'warning' | 'error' | 'gray';

const variantStyles: Record<BadgeVariant, string> = {
  brand:   'bg-brand/10 text-brand',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  error:   'bg-error-light text-error',
  gray:    'bg-gray-100 text-gray-500',
};

export default function Badge({
  variant = 'brand',
  children,
  className = '',
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

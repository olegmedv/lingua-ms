import { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  clickable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ clickable, className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-white rounded-xl border border-gray-200 p-5 transition-all
        ${clickable ? 'cursor-pointer hover:border-gray-300 hover:shadow-sm group' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';
export default Card;

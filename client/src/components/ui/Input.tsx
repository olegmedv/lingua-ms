import { forwardRef } from 'react';

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full px-4 py-3 rounded-xl border border-gray-300
        focus:outline-none focus:ring-2 focus:ring-brand/40 text-lg
        ${className}`}
      {...props}
    />
  )
);
Input.displayName = 'Input';
export default Input;

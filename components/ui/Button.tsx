import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  className = '',
  children,
  ...props
}) => {
  const isDisabled = !!props.disabled;
  const baseClasses =
    'px-4 py-2 rounded-sm focus:outline-none focus:ring-0 transition-colors';
  const stateClasses = isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      className={`${baseClasses} ${stateClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
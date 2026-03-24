import React from 'react';
import { Button as BsButton } from 'react-bootstrap';

export const Button = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const sizeMap = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  };

  return (
    <BsButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      size={sizeMap[size]}
      className={`${fullWidth ? 'w-100' : ''} ${className}`}
      {...props}
    >
      {children}
    </BsButton>
  );
};

export default Button;

import React from 'react';
import { Badge as BsBadge } from 'react-bootstrap';

const sizeMap = {
  sm: '14px',
  md: '16px',
  lg: '18px',
};

export const Badge = ({ children, variant = 'primary', size = 'md', className = '' }) => {
  return (
    <BsBadge bg={variant} className={className} style={{ fontSize: sizeMap[size] }}>
      {children}
    </BsBadge>
  );
};

export default Badge;

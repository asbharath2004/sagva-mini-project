import React from 'react';
import { Spinner } from 'react-bootstrap';

const sizeMap = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

export const Loading = ({ size = 'md', className = '' }) => {
  return (
    <div className={`d-flex flex-column align-items-center justify-content-center p-5 ${className}`}>
      <Spinner animation="border" role="status" size={sizeMap[size] === 'md' ? undefined : sizeMap[size]}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <p className="mt-3">Loading...</p>
    </div>
  );
};

export default Loading;

import React from 'react';
import { Alert as BsAlert } from 'react-bootstrap';

export const Alert = ({
  type = 'info',
  title = '',
  message = '',
  onClose = null,
  closeable = true,
}) => {
  const variantMap = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'danger',
    danger: 'danger',
  };

  return (
    <BsAlert variant={variantMap[type]} className="mb-3">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          {title && <BsAlert.Heading>{title}</BsAlert.Heading>}
          {message && <p>{message}</p>}
        </div>
        {closeable && onClose && (
          <button
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          ></button>
        )}
      </div>
    </BsAlert>
  );
};

export default Alert;

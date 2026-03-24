import React from 'react';
import { Card } from 'react-bootstrap';

export const ChartContainer = ({
  title,
  subtitle = '',
  children,
  className = '',
}) => {
  return (
    <Card className={`border-0 shadow-sm ${className}`}>
      {title && (
        <Card.Header className="bg-white border-bottom">
          <div>
            <Card.Title className="h5 mb-1">{title}</Card.Title>
            {subtitle && <Card.Subtitle className="text-muted">{subtitle}</Card.Subtitle>}
          </div>
        </Card.Header>
      )}
      <Card.Body>
        {children}
      </Card.Body>
    </Card>
  );
};

export default ChartContainer;

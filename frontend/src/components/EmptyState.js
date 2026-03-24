import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

export const EmptyState = ({
  icon: Icon,
  title = 'No Data Found',
  description = 'There is no data to display at the moment.',
  action = null,
}) => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} className="text-center">
          {Icon && (
            <div className="mb-4" style={{ fontSize: '48px', color: '#6c757d' }}>
              <Icon size={48} />
            </div>
          )}
          <h3 className="h5 fw-bold mb-3">{title}</h3>
          <p className="text-muted mb-4">{description}</p>
          {action && <div>{action}</div>}
        </Col>
      </Row>
    </Container>
  );
};

export default EmptyState;

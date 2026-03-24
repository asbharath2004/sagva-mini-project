import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './DashboardLayout.css';

export const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-container">
        <Row className="g-0 h-100">
          {/* Sidebar */}
          <Col md={3} className="sidebar-column d-none d-md-flex">
            <Sidebar />
          </Col>

          {/* Main Content */}
          <Col md={9} xs={12} className="main-content-column">
            <main className="main-content">
              <Container fluid className="content-wrapper">
                {children}
              </Container>
            </main>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DashboardLayout;

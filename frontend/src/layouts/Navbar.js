import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar as BsNavbar, Container, Badge as BsBadge } from 'react-bootstrap';

export const Navbar = () => {
  const { user } = useAuth();

  return (
    <BsNavbar bg="light" sticky="top" className="border-bottom">
      <Container fluid>
        <BsNavbar.Brand className="fw-bold">
          Student Academic Growth Velocity Analyzer
        </BsNavbar.Brand>
        <div className="ms-auto d-flex align-items-center gap-3">
          <span className="text-muted">{user?.name}</span>
          <BsBadge bg="primary" text="light" className="text-capitalize">
            {user?.role}
          </BsBadge>
        </div>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;

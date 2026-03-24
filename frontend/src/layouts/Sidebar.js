import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Plus,
  TrendingUp,
  LogOut,
  Home,
  MessageSquare,
  Users,
  List,
  CheckSquare
} from 'lucide-react';
import { Nav, Offcanvas, Button } from 'react-bootstrap';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      role: ['student', 'teacher', 'admin'],
      path:
        user?.role === 'teacher'
          ? '/teacher-dashboard'
          : user?.role === 'admin'
            ? '/admin-panel'
            : '/student-dashboard',
    },
    {
      icon: Users,
      label: 'Manage Students',
      role: ['admin'],
      path: '/admin-students',
    },
    {
      icon: TrendingUp,
      label: 'Growth Analytics',
      role: ['student'],
      path: '/analytics',
    },
    {
      icon: List,
      label: 'Tasks',
      role: ['student'],
      path: '/student-tasks',
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      role: ['teacher', 'student'],
      path: '/messages',
    },
    {
      icon: CheckSquare,
      label: 'Reviews',
      role: ['teacher'],
      path: '/teacher-reviews',
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => item.role.includes(user?.role));

  const SidebarContent = () => (
    <>
      {/* Sidebar Header */}
      <div className="p-4 border-bottom bg-light">
        <h5 className="mb-0 fw-bold text-primary d-flex align-items-center gap-2">
          <TrendingUp size={24} /> SAGVA
        </h5>
        <small className="text-muted fw-semibold">Growth Analyzer</small>
      </div>

      {/* Navigation Menu */}
      <Nav className="flex-column p-3 gap-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Nav.Link
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false);
              }}
              className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 transition-all ${
                isActive 
                  ? 'bg-primary text-white shadow-sm fw-bold' 
                  : 'text-secondary hover-bg-light'
              }`}
              style={{ transition: 'all 0.2s ease-in-out' }}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-muted'} />
              <span>{item.label}</span>
            </Nav.Link>
          );
        })}
      </Nav>

      {/* Sidebar Footer */}
      <div className="mt-auto border-top p-3">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: '40px', height: '40px', fontSize: '16px', fontWeight: 'bold' }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="mb-0 fw-bold text-truncate">{user?.name}</p>
            <p className="mb-0 small text-muted text-capitalize text-truncate">{user?.role}</p>
          </div>
        </div>

        <Button
          variant="outline-danger"
          size="sm"
          className="w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="light"
        onClick={() => setIsOpen(true)}
        aria-label="Toggle menu"
        className="d-md-none"
      >
        <Menu size={24} />
      </Button>

      {/* Desktop Sidebar (visible on md and up) */}
      <div className="d-none d-md-flex flex-column h-100 w-100">
        <SidebarContent />
      </div>

      {/* Mobile Offcanvas Menu */}
      <Offcanvas
        show={isOpen}
        onHide={() => setIsOpen(false)}
        placement="start"
        className="d-md-none"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <h5 className="mb-0 fw-bold">Dashboard</h5>
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="p-0">
          <SidebarContent />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;

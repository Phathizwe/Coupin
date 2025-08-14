import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const BusinessNavigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/business/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/business/customers', label: 'Customers', icon: '👥' },
    { path: '/business/coupons', label: 'Coupons', icon: '🎫' },
    { path: '/business/loyalty', label: 'Loyalty', icon: '⭐' },
    { path: '/business/scan', label: 'Scan', icon: '📱' },
    { path: '/business/analytics', label: 'Analytics', icon: '📈' },
    { path: '/business/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className="business-navigation">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};
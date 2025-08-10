import React, { useState, ReactNode } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  UserIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  QrCodeIcon,
  UsersIcon,
  ShieldCheckIcon,
  HomeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface AdminDashboardLayoutProps {
  children?: ReactNode;
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <ChartBarIcon className="h-6 w-6" /> },
    {
      name: 'Homepage Management',
      path: '/admin/homepage',
      icon: <HomeIcon className="h-6 w-6" />,
      subItems: [
        { name: 'Timeline', path: '/admin/homepage/timeline', icon: <ClockIcon className="h-5 w-5" /> }
      ]
    },
    { name: 'User Management', path: '/admin/users', icon: <UsersIcon className="h-6 w-6" /> },
    { name: 'Role Management', path: '/admin/roles', icon: <ShieldCheckIcon className="h-6 w-6" /> },
    { name: 'Settings', path: '/admin/settings', icon: <Cog6ToothIcon className="h-6 w-6" /> },
  ];

  // Check if a path is active or one of its subpaths is active
  const isPathActive = (path: string) => {
    return location.pathname === path ||
      (path !== '/admin/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/admin/dashboard" className="text-xl font-bold text-primary">
                  TYCA Admin
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <span className="mr-3 text-sm text-gray-700">
                      {user?.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/80"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
              <div className="-mr-2 flex items-center md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileMenuOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <React.Fragment key={item.name}>
                  <Link
                    to={item.path}
                    className={`block pl-3 pr-4 py-2 border-l-4 ${isPathActive(item.path)
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                      } text-base font-medium`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>

                  {/* Render subitems if they exist and parent is active */}
                  {item.subItems && isPathActive(item.path) && (
                    <div className="pl-6 space-y-1">
                      {item.subItems.map(subItem => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className={`block pl-3 pr-4 py-2 border-l-4 ${location.pathname === subItem.path
                              ? 'border-primary text-primary bg-primary/5'
                              : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                            } text-sm font-medium`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <UserIcon className="h-10 w-10 text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user?.displayName || 'Admin User'}</div>
                  <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Sidebar and main content */}
      <div className="flex">
        {/* Sidebar for desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 pt-5 pb-4 bg-white">
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 bg-white space-y-1">
                {navItems.map((item) => (
                  <React.Fragment key={item.name}>
                    <Link
                      to={item.path}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isPathActive(item.path)
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      <div className={`mr-3 ${isPathActive(item.path) ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'
                        }`}>
                        {item.icon}
                      </div>
                      {item.name}
                    </Link>

                    {/* Render subitems if they exist */}
                    {item.subItems && (
                      <div className={`ml-6 space-y-1 ${!isPathActive(item.path) && 'hidden'}`}>
                        {item.subItems.map(subItem => (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === subItem.path
                                ? 'bg-primary/5 text-primary'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                              }`}
                          >
                            <div className={`mr-3 ${location.pathname === subItem.path ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'
                              }`}>
                              {subItem.icon}
                            </div>
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
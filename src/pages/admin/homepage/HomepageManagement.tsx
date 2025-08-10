import React from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, PhotoIcon, DocumentTextIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface ManagementCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  disabled?: boolean;
}

const ManagementCard: React.FC<ManagementCardProps> = ({ title, description, icon, to, disabled }) => {
  return (
    <Link 
      to={to}
      className={`block bg-white overflow-hidden shadow rounded-lg transition-all ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:shadow-md hover:bg-gray-50'}`}
      onClick={e => disabled && e.preventDefault()}
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary/10 rounded-md p-3">
            {icon}
          </div>
          <div className="ml-5">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

const HomepageManagement: React.FC = () => {
  const managementOptions = [
    {
      title: 'Timeline Management',
      description: 'Manage the company timeline displayed on the About page',
      icon: <ClockIcon className="h-6 w-6 text-primary" />,
      to: '/admin/homepage/timeline'
    },
    {
      title: 'Pricing Management',
      description: 'Configure pricing plans and currency options',
      icon: <CurrencyDollarIcon className="h-6 w-6 text-primary" />,
      to: '/admin/homepage/pricing'
    },
    {
      title: 'Content Blocks',
      description: 'Manage content blocks throughout the site (Coming soon)',
      icon: <DocumentTextIcon className="h-6 w-6 text-gray-400" />,
      to: '#',
      disabled: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Homepage Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage content that appears on the public-facing pages of the website
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {managementOptions.map((option, index) => (
          <div key={index}>
            <ManagementCard
              title={option.title}
              description={option.description}
              icon={option.icon}
              to={option.to}
              disabled={option.disabled}
            />
            {option.disabled && (
              <div className="mt-1 text-xs text-center text-gray-500">
                Coming soon
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomepageManagement;
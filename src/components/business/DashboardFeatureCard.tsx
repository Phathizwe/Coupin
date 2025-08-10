import React from 'react';
import { Link } from 'react-router-dom';

interface DashboardFeatureCardProps {
  title: string;
  description: string;
  icon: string;
  linkTo: string;
  isNew?: boolean;
  isExperimental?: boolean;
}

const DashboardFeatureCard: React.FC<DashboardFeatureCardProps> = ({
  title,
  description,
  icon,
  linkTo,
  isNew = false,
  isExperimental = false
}) => {
  return (
    <Link 
      to={linkTo}
      className="bg-white rounded-lg shadow-md p-6 transition-transform hover:transform hover:scale-105 hover:shadow-lg"
    >
      <div className="flex items-center mb-4">
        <div className="text-3xl mr-4">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            {title}
            {isNew && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                NEW
              </span>
            )}
            {isExperimental && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                BETA
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default DashboardFeatureCard;
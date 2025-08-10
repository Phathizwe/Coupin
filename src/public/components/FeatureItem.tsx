import React from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface FeatureItemProps {
  id: string;
  name: string;
  included: boolean;
  highlight?: boolean;
  tooltip?: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ id, name, included, highlight, tooltip }) => {
  return (
    <li key={id} className="flex items-start space-x-3 py-2">
      {included ? (
        <CheckIcon className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" aria-hidden="true" />
      ) : (
        <XMarkIcon className="h-5 w-5 flex-shrink-0 text-gray-400 mt-0.5" aria-hidden="true" />
      )}
      <span 
        className={`text-sm ${highlight ? 'font-semibold' : ''} ${included ? 'text-gray-800' : 'text-gray-500'}`}
        title={tooltip}
      >
        {name}
      </span>
    </li>
  );
};

export default FeatureItem;
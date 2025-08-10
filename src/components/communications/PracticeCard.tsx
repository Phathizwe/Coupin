import React from 'react';
import { CheckCircleIcon } from '../icons/Icons';

interface PracticeCardProps {
  title: string;
  description: string;
}

const PracticeCard: React.FC<PracticeCardProps> = ({
  title,
  description
}) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start mb-3">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
          <CheckCircleIcon className="h-5 w-5" />
        </div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default PracticeCard;
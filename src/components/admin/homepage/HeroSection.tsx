import React from 'react';
import { Image } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <div className="block bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="bg-indigo-100 p-3 rounded-full mr-4">
            <Image className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium">Hero Section</h3>
        </div>
        <p className="text-gray-600 text-sm">
          Configure the hero section on the homepage
        </p>
        <div className="mt-4 text-xs text-gray-500">
          Coming soon
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
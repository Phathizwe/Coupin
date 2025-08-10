import React from 'react';
import { Link } from 'react-router-dom';

export const FeaturesCTA: React.FC = () => {
  return (
    <div className="bg-primary-700">
      <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          <span className="block">Ready to transform your business?</span>
          <span className="block">Start using TYCA today.</span>
        </h2>
        <p className="mt-4 text-lg leading-6 text-primary-200">
          Join thousands of businesses already using TYCA to grow their customer relationships.
        </p>
        <Link
          to="/register"
          className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 sm:w-auto"
        >
          Start Your Free Trial
        </Link>
      </div>
    </div>
  );
};
import React from 'react';
import { Link } from 'react-router-dom';

export const FeatureComparisonTable: React.FC = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Compare Plans and Features
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-lg">
            <thead>
              <tr>
                <th className="py-4 px-6 text-left text-gray-500 font-medium">Feature</th>
                <th className="py-4 px-6 text-center text-gray-500 font-medium">Free</th>
                <th className="py-4 px-6 text-center text-gray-500 font-medium">Basic</th>
                <th className="py-4 px-6 text-center text-gray-500 font-medium">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-4 px-6 text-gray-800">Loyalty Programs</td>
                <td className="py-4 px-6 text-center text-gray-800">1</td>
                <td className="py-4 px-6 text-center text-gray-800">3</td>
                <td className="py-4 px-6 text-center text-gray-800">Unlimited</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-gray-800">Customer Database</td>
                <td className="py-4 px-6 text-center text-gray-800">100 customers</td>
                <td className="py-4 px-6 text-center text-gray-800">1,000 customers</td>
                <td className="py-4 px-6 text-center text-gray-800">Unlimited</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-gray-800">Campaign Management</td>
                <td className="py-4 px-6 text-center text-gray-800">
                  <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </td>
                <td className="py-4 px-6 text-center text-gray-800">Basic</td>
                <td className="py-4 px-6 text-center text-gray-800">Advanced</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-gray-800">Analytics & Insights</td>
                <td className="py-4 px-6 text-center text-gray-800">Basic</td>
                <td className="py-4 px-6 text-center text-gray-800">Standard</td>
                <td className="py-4 px-6 text-center text-gray-800">Advanced</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-gray-800">Mobile Customer App</td>
                <td className="py-4 px-6 text-center text-gray-800">
                  <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </td>
                <td className="py-4 px-6 text-center text-gray-800">
                  <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </td>
                <td className="py-4 px-6 text-center text-gray-800">
                  <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            View Full Pricing
          </Link>
        </div>
      </div>
    </div>
  );
};
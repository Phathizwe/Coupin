import React from 'react';

export const Testimonials: React.FC = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          Trusted by Businesses Like Yours
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">JC</span>
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-gray-900">Jane Cooper</h4>
                <p className="text-sm text-gray-500">Local Cafe Owner</p>
              </div>
            </div>
            <p className="text-gray-600">
              "TYCA has transformed how we engage with our customers. Our loyalty program has increased repeat visits by 40% in just three months."
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold text-xl">MR</span>
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-gray-900">Michael Robinson</h4>
                <p className="text-sm text-gray-500">Boutique Retail Shop</p>
              </div>
            </div>
            <p className="text-gray-600">
              "The customer insights we get from TYCA have helped us tailor our offerings. Our customers love the personalized experience."
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xl">AT</span>
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-gray-900">Alicia Thompson</h4>
                <p className="text-sm text-gray-500">Salon Owner</p>
              </div>
            </div>
            <p className="text-gray-600">
              "Setting up automated campaigns has saved us so much time. Our clients receive timely reminders and we've seen a 25% reduction in no-shows."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
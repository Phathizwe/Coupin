import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, BRAND_MESSAGES } from '../constants/brandConstants';
import { HeroBlock } from '../components/blocks/HeroBlock';

const HomePage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <HeroBlock />
      
      {/* Feature section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-secondary-500 font-semibold tracking-wide uppercase">{BRAND.shortTagline}</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {BRAND_MESSAGES.value.retention}
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              {BRAND_MESSAGES.value.loyalty}
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* Feature items would go here */}
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-700 text-white">
                    {/* Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">South African Payment Methods</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Integrate with local payment providers like Yoco, SnapScan, and Zapper to provide a seamless experience.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-700 text-white">
                    {/* Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Customer Retention Tools</h3>
                  <p className="mt-2 text-base text-gray-500">
                    {BRAND_MESSAGES.value.growth}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* CTA section */}
      <div className="bg-primary-800">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to boost your business?</span>
            <span className="block">Start using {BRAND.name} today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            {BRAND_MESSAGES.cta.standard}
          </p>
          <Link
            to="/register"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-800 bg-white hover:bg-primary-50 sm:w-auto"
          >
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
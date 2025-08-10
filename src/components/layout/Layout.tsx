import React from 'react';
import { Outlet } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';
import { CurrencyRegionSetter } from '@/components/ui/currency-region-setter';

const Layout: React.FC = () => {
  const { currency, setCurrency, region, setRegion } = useCurrency();
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-gray-900">
              <span className="text-green-800">TYC</span>
              <span className="text-amber-500">A</span>
            </a>
            <nav className="ml-10 space-x-4">
              <a href="/features" className="text-gray-500 hover:text-gray-900">Features</a>
              <a href="/testimonials" className="text-gray-500 hover:text-gray-900">Testimonials</a>
              <a href="/pricing" className="text-gray-500 hover:text-gray-900">Pricing</a>
              <a href="/about" className="text-gray-500 hover:text-gray-900">About</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <CurrencyRegionSetter
              defaultCurrency={currency}
              defaultRegion={region}
              onCurrencyChange={setCurrency}
              onRegionChange={setRegion}
            />
            <div className="flex space-x-2">
              <a href="/login" className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                Login
              </a>
              <a href="/signup" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">
                Sign Up
              </a>
        </div>
    </div>
        </div>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">© {new Date().getFullYear()} Your Company</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
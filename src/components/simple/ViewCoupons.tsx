import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const ViewCoupons: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('Info');
  
  // Sample data
  const coupons = [
    {
      id: '1',
      title: '10% OFF Any Purchase',
      description: 'Valid for all menu items',
      code: 'SAVE10',
      active: true,
    },
    {
      id: '2',
      title: 'Buy 1 Get 1 Free',
      description: 'On all beverages',
      code: 'BOGO2023',
      active: true,
    },
    {
      id: '3',
      title: 'Free Appetizer',
      description: 'With purchase of any main course',
      code: 'APPETIZER',
      active: false,
    },
    {
      id: '4',
      title: '$5 OFF Your Order',
      description: 'Minimum purchase of $25',
      code: 'FIVE4U',
      active: true,
    }
  ];

  useEffect(() => {
    // Get user name from localStorage or auth context
    const storedUserName = localStorage.getItem('userName') || 'Info';
    setUserName(storedUserName);
  }, []);

  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header with TYCA brand purple background (matching the dashboard) */}
      <header className="bg-indigo-500 text-white pt-8 pb-12 px-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-white mr-4 bg-white/20 rounded-full p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <h1 className="text-2xl font-bold flex-1 ml-2">
            Manage Coupons
          </h1>

          <button
            onClick={() => navigate('/create-coupon')}
            className="bg-white/20 p-2 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {/* Personalized greeting */}
        <div className="mt-4 mb-6">
          <p className="text-white/80">{getGreeting()},</p>
          <h2 className="text-xl font-semibold">{userName}! 👋</h2>
          <p className="text-white/80 text-sm mt-1">Build customer loyalty with targeted offers.</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center">
            <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
              <span className="text-lg">🎫</span>
            </div>
            <p className="text-xs text-white/80 text-center">Active Coupons</p>
            <p className="text-xl font-bold text-white">{coupons.filter(c => c.active).length}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center">
            <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
              <span className="text-lg">🔄</span>
            </div>
            <p className="text-xs text-white/80 text-center">Redemptions</p>
            <p className="text-xl font-bold text-white">0</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center">
            <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
              <span className="text-lg">👤</span>
            </div>
            <p className="text-xs text-white/80 text-center">Loyal Customers</p>
            <p className="text-xl font-bold text-white">0</p>
          </div>
        </div>
      </header>

      {/* Main content - shifted up to overlap with header */}
      <div className="flex-1 -mt-6">
        <div className="bg-white rounded-t-3xl shadow-lg h-full flex flex-col">
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Search bar */}
            <form className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <div className="flex items-center px-3 py-2 bg-white">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  className="flex-1 ml-2 outline-none text-sm text-gray-700"
                  placeholder="Search by name or code..."
                />
              </div>
            </form>

            {/* Filter bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Filter</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-2 rounded-full text-sm flex items-center bg-indigo-100 text-indigo-800 font-medium">
                  <span className="mr-1">🎟️</span>
                  All Coupons
                </button>
                <button className="px-3 py-2 rounded-full text-sm flex items-center bg-gray-100 text-gray-600 hover:bg-gray-200">
                  <span className="mr-1">✅</span>
                  Active
                </button>
                <button className="px-3 py-2 rounded-full text-sm flex items-center bg-gray-100 text-gray-600 hover:bg-gray-200">
                  <span className="mr-1">⏸️</span>
                  Inactive
                </button>
              </div>
            </div>

            {/* Coupon list */}
            <div className="space-y-4 mt-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200"
                >
                  {/* Status indicator */}
                  {coupon.active ? (
                    <div className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full z-10 font-medium">
                      Active
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full z-10 font-medium">
                      Inactive
                    </div>
                  )}

                  {/* Card content */}
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4">
                    <div className="flex items-start">
                      <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-sm">
                        <span className="text-2xl">💰</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-indigo-800 text-lg">{coupon.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer border border-gray-100">
                          <span className="font-mono text-sm font-medium text-gray-700">{coupon.code}</span>
                          <button className="text-gray-500 hover:text-gray-700 text-xs flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button with TYCA brand colors - using green to match the dashboard */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => navigate('/create-coupon')}
              className="w-full py-4 bg-green-500 text-white text-lg font-bold rounded-xl shadow-md"
            >
              CREATE NEW COUPON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCoupons;
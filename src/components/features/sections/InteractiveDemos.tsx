import React from 'react';

export const InteractiveDemos: React.FC = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">See It In Action</h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Our intuitive interface makes it easy to create and manage customer loyalty programs
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Loyalty Card Demo */}
          <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">Coffee Rewards</h3>
                  <p className="text-purple-100">Sarah's Card</p>
                </div>
                <div className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                  Gold Member
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress to Free Coffee</span>
                    <span>8/10</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm">Total Points</span>
                  <span className="font-bold text-xl">2,450</span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Demo */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg overflow-hidden p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-white">QR Code Scanning</h3>
              <p className="text-blue-100 mt-2">Customers can easily scan QR codes to redeem rewards and offers</p>
            </div>
            <div className="mt-4 bg-white/20 p-4 rounded-lg">
              <div className="w-32 h-32 bg-white mx-auto rounded-lg flex items-center justify-center">
                <div className="w-24 h-24 bg-gray-800 grid grid-cols-4 grid-rows-4 gap-1 p-2">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className={`${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}`}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Demo */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg overflow-hidden p-6">
            <h3 className="font-bold text-lg text-white">Customer Analytics</h3>
            <p className="text-green-100 mt-2">Track customer behavior and optimize your marketing efforts</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">New Customers</span>
                <span className="text-white font-bold">+24%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: "75%" }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Repeat Visits</span>
                <span className="text-white font-bold">+18%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Redemption Rate</span>
                <span className="text-white font-bold">+32%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
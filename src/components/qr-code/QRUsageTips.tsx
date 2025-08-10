import React, { useState } from 'react';

const QRUsageTips: React.FC = () => {
  const [expandedTip, setExpandedTip] = useState<number | null>(null);
  
  const tips = [
    {
      title: 'In-Store Display',
      content: 'Print your QR code and display it at your business location. Place it near checkout counters, on tables, or in waiting areas for maximum visibility.',
      icon: '🏪',
      color: 'purple'
    },
    {
      title: 'Print Materials',
      content: 'Include the QR code in your print advertisements, business cards, flyers, and brochures to bridge the gap between offline and online experiences.',
      icon: '📄',
      color: 'indigo'
    },
    {
      title: 'Social Media',
      content: 'Share the QR code on your social media accounts. It works great as a profile banner, in posts, or as part of your Instagram stories.',
      icon: '📱',
      color: 'blue'
    },
    {
      title: 'Email Marketing',
      content: 'Add the QR code to your email signature and newsletters. This gives recipients a quick way to access your offers without typing URLs.',
      icon: '📧',
      color: 'pink'
    }
  ];

  const toggleTip = (index: number) => {
    if (expandedTip === index) {
      setExpandedTip(null);
    } else {
      setExpandedTip(index);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg border border-purple-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="p-6">
        <div className="flex items-start mb-5">
          <div className="bg-gradient-to-br from-indigo-400 to-purple-500 w-10 h-10 rounded-lg flex items-center justify-center shadow-md mr-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              💡 Usage Inspiration
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Creative ways to share your magical QR codes
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div 
              key={index}
              className={`bg-white rounded-lg border border-${tip.color}-100 overflow-hidden transition-all duration-300 ${
                expandedTip === index ? 'shadow-md' : 'hover:shadow-sm'
              }`}
            >
              <button 
                onClick={() => toggleTip(index)}
                className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">{tip.icon}</span>
                  <span className="font-medium text-gray-800">{tip.title}</span>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                    expandedTip === index ? 'transform rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div 
                className={`px-4 pb-3 transition-all duration-300 overflow-hidden ${
                  expandedTip === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-gray-600 text-sm pl-8">{tip.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-purple-100">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 italic">Tap on each tip for more details</p>
            <button className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center transition-colors duration-200">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Marketing Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRUsageTips;
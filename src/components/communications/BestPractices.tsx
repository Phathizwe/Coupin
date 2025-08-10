import React from 'react';
import PracticeCard from './PracticeCard';

const BestPractices: React.FC = () => {
  const practices = [
    {
      id: 'concise',
      title: 'Keep messages concise',
      description: 'Short, clear messages have higher engagement rates. Aim for 160 characters or less.'
    },
    {
      id: 'personalize',
      title: 'Personalize your messages',
      description: 'Include the customer\'s name and relevant details to increase engagement and response rates.'
    },
    {
      id: 'timing',
      title: 'Timing is everything',
      description: 'Send messages at optimal times when customers are most likely to engage with your content.'
    },
    {
      id: 'cta',
      title: 'Include clear CTAs',
      description: 'Always include a clear call-to-action so customers know what to do next.'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Communication Best Practices</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {practices.map(practice => (
          <PracticeCard
            key={practice.id}
            title={practice.title}
            description={practice.description}
          />
        ))}
      </div>
    </div>
  );
};

export default BestPractices;
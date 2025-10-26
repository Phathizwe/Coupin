import React, { useState, useEffect } from 'react';
import { LoyaltyProgram, LoyaltyAchievement } from '../../types';
import { getLoyaltyAchievements } from '../../services/loyaltyService';

interface LoyaltyAchievementsProps {
  program: LoyaltyProgram | null;
}

const LoyaltyAchievements: React.FC<LoyaltyAchievementsProps> = ({ program }) => {
  const [achievements, setAchievements] = useState<LoyaltyAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!program || !program.id || !program.businessId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const achievementsData = await getLoyaltyAchievements(program.businessId, program.id);
        
        // Deduplicate achievements by id
        const uniqueAchievements = achievementsData.filter((achievement, index, self) => 
          index === self.findIndex(a => a.id === achievement.id)
        );
        
        setAchievements(uniqueAchievements);
      } catch (error) {
        console.error('Error fetching loyalty achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [program]);

  if (!program) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100">
      <h2 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        Your Achievements
      </h2>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index} className="animate-pulse flex items-center p-3 rounded-lg border border-gray-200">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`flex items-center p-3 rounded-lg border ${
                achievement.completed 
                  ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200' 
                  : 'bg-gray-50 border-gray-200'
              } transition-transform hover:scale-102`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                achievement.completed ? 'bg-purple-200' : 'bg-gray-200'
              }`}>
                <span className="text-xl">{achievement.icon}</span>
              </div>
              <div>
                <h3 className={`font-medium ${achievement.completed ? 'text-purple-800' : 'text-gray-600'}`}>
                  {achievement.title}
                </h3>
                <p className={`text-xs ${achievement.completed ? 'text-purple-600' : 'text-gray-500'}`}>
                  {achievement.description}
                </p>
              </div>
              {achievement.completed && (
                <div className="ml-auto">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoyaltyAchievements;
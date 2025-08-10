import React from 'react';
import { animated } from '@react-spring/web';
interface TrustBadge {
  id: string;
  icon: React.ReactNode;
  text: string;
  tooltip: string;
}

interface TrustBadgesProps {
  badges: TrustBadge[];
  animation?: any;
  animationPreference?: boolean;
}

/**
 * TrustBadges - Enhanced trust indicators with emotional design
 * 
 * Implements:
 * - Visceral: Clean, professional visual design
 * - Behavioral: Clear trust signals
 * - Reflective: Building confidence and trust
 */
const TrustBadges: React.FC<TrustBadgesProps> = ({ 
  badges, 
  animation,
  animationPreference = true
}) => {
  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {badges.map((badge, index) => (
          <animated.div
            key={badge.id}
            style={animationPreference ? (Array.isArray(animation) ? animation[index] : {}) : {}}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 flex items-center"
            title={badge.tooltip}
          >
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <div className="h-6 w-6 text-blue-600">
                {badge.icon}
              </div>
            </div>
            <div className="font-medium text-gray-900">{badge.text}</div>
          </animated.div>
        ))}
      </div>
    </div>
  );
};

export default TrustBadges;
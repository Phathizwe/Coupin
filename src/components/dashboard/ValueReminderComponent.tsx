import React from 'react';
import { ANIMATIONS } from './animations/DashboardAnimations';
import { BRAND, BRAND_MESSAGES } from '../../constants/brandConstants';
import { MascotStates } from './animations/DashboardAnimations';

const ValueReminderComponent: React.FC = () => {
  return (
    <div className={`bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl p-6 shadow-md ${ANIMATIONS.transition.medium}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-2">{BRAND.tagline}</h3>
          <p className="text-primary-100">{BRAND_MESSAGES.value.retention}</p>
        </div>
        <div className="text-4xl">
          {MascotStates.grateful}
        </div>
      </div>
    </div>
  );
};

export default ValueReminderComponent;
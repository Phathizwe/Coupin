// Re-export all loyalty service functions from their respective modules
// This maintains the same API for existing code while providing a more maintainable structure

// Program management
export { 
  getLoyaltyProgram, 
  saveLoyaltyProgram 
} from './programService';

// Program initialization
export {
  initializeLoyaltyProgram
} from './initializeLoyaltyProgram';

// Reward management
export { 
  getLoyaltyRewards, 
  addLoyaltyReward, 
  updateLoyaltyReward, 
  deleteLoyaltyReward 
} from './rewardService';

// Customer loyalty
export { 
  updateCustomerLoyaltyPoints 
} from './customerLoyaltyService';

// Statistics
export { 
  getLoyaltyProgramStats,
  type LoyaltyProgramStats
} from './statsService';

// Achievements
export { 
  getLoyaltyAchievements, 
  updateAchievementStatus, 
  checkAndUpdateAchievements 
} from './achievementService';

import { FEATURE_FLAGS } from '../config/featureFlags';

/**
 * Utility functions for feature flags
 */

/**
 * Check if loyalty achievements are enabled
 * @returns boolean indicating if loyalty achievements are enabled
 */
export const isLoyaltyAchievementsEnabled = (): boolean => {
  return FEATURE_FLAGS.LOYALTY_ACHIEVEMENTS_ENABLED;
};

/**
 * Get empty achievements array when feature is disabled
 * @returns empty array to use as placeholder when achievements are disabled
 */
export const getEmptyAchievements = () => {
  return [];
};
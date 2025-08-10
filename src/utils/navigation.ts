import { getDefaultRouteForRole } from './roleUtils';

/**
 * @deprecated Use getDefaultRouteForRole from roleUtils.ts instead
 */
export const getDefaultRoute = (role: 'business' | 'customer') => {
  console.log('[DEPRECATED] getDefaultRoute is deprecated, use getDefaultRouteForRole from roleUtils.ts instead');
  return getDefaultRouteForRole(role);
};
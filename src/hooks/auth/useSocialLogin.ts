import { useState } from 'react';

export type AuthSuccessHandler = (user: any) => void;

/**
 * DEPRECATED: This hook has been replaced by direct implementation in useLoginLogic.ts
 * This is kept for compatibility but disabled to prevent race conditions.
 */
export const useSocialLogin = (handleAuthSuccess: AuthSuccessHandler) => {
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoginError, setSocialLoginError] = useState<string | null>(null);

  const handleSocialSignIn = async (provider: string) => {
    console.log(`[DEPRECATED][useSocialLogin] ${provider} sign-in called but disabled to prevent race conditions`);
    console.log('[DEPRECATED][useSocialLogin] Please use the direct implementation in useLoginLogic.ts instead');
    
    // Do nothing - this hook is disabled to prevent race conditions
    return;
  };

  return {
    isLoading,
    socialLoginError,
    handleSocialSignIn,
  };
};
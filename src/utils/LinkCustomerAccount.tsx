import React, { useEffect } from 'react';

// This component disables automatic customer linking
const LinkCustomerAccount: React.FC = () => {
  useEffect(() => {
    // Override the customer linking functions with no-op versions
    if (window) {
      (window as any).customerLinkingDisabled = true;
      console.log('Customer linking functionality has been temporarily disabled for debugging');
    }
  }, []);

  return null; // This component doesn't render anything
};

export default LinkCustomerAccount;
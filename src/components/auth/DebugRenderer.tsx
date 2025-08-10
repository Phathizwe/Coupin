import React, { useEffect, useState } from 'react';

interface DebugRendererProps {
  componentName: string;
}

const DebugRenderer: React.FC<DebugRendererProps> = ({ componentName }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[DEBUG] ${componentName} component mounted`);
    
    // Check if auth context is available
    try {
      const authModule = require('../../hooks/useAuth');
      console.log(`[DEBUG] useAuth module imported successfully`);
    } catch (err: any) {
      setError(`Error importing auth module: ${err.message}`);
      console.error(`[DEBUG] Error importing auth module:`, err);
    }

    return () => {
      console.log(`[DEBUG] ${componentName} component unmounted`);
    };
  }, [componentName]);

  return (
    <div style={{ padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
      <h3>Debug: {componentName}</h3>
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Error: {error}
        </div>
      )}
      <div>Component rendered successfully at: {new Date().toISOString()}</div>
    </div>
  );
};

export default DebugRenderer;
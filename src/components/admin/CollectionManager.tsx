import React, { useState } from 'react';
import { deleteCollection, migratePricingPlans } from '../../utils/collectionManagement';
import { Button, Box, Typography, Alert, CircularProgress } from '@mui/material';

/**
 * Component for managing Firestore collections (admin use only)
 */
const CollectionManager: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleDeleteOldCollection = async () => {
    if (window.confirm('Are you sure you want to delete all documents in the old pricingPlans collection?')) {
      setIsDeleting(true);
      setMessage(null);
      
      try {
        await deleteCollection('pricingPlans');
        setMessage({ type: 'success', text: 'Successfully deleted all documents in the old pricingPlans collection.' });
      } catch (error) {
        console.error('Error deleting collection:', error);
        setMessage({ 
          type: 'error', 
          text: `Error deleting collection: ${error instanceof Error ? error.message : String(error)}` 
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleMigratePlans = async () => {
    if (window.confirm('Are you sure you want to migrate pricing plans from the old collection to the new pricing_plans collection?')) {
      setIsMigrating(true);
      setMessage(null);
      
      try {
        await migratePricingPlans();
        setMessage({ type: 'success', text: 'Successfully migrated pricing plans to the new collection.' });
      } catch (error) {
        console.error('Error migrating plans:', error);
        setMessage({ 
          type: 'error', 
          text: `Error migrating plans: ${error instanceof Error ? error.message : String(error)}` 
        });
      } finally {
        setIsMigrating(false);
      }
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Collection Management
      </Typography>
      
      <Typography variant="body1" paragraph>
        Use these tools to manage Firestore collections. These operations are irreversible, so use with caution.
      </Typography>
      
      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          color="warning" 
          onClick={handleDeleteOldCollection}
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isDeleting ? 'Deleting...' : 'Delete Old pricingPlans Collection'}
        </Button>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleMigratePlans}
          disabled={isMigrating}
          startIcon={isMigrating ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isMigrating ? 'Migrating...' : 'Migrate to pricing_plans Collection'}
        </Button>
      </Box>
      
      <Typography variant="subtitle2" color="text.secondary">
        Note: These operations require admin privileges and will only work if you're properly authenticated.
      </Typography>
    </Box>
  );
};

export default CollectionManager;
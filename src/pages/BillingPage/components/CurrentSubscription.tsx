import React from 'react';
import { Box, Typography, Button, Chip, Grid, Divider } from '@mui/material';
import { UserSubscription } from '../../../types/billing.types';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

interface CurrentSubscriptionProps {
  subscription: UserSubscription | null;
  onUpgradeClick: () => void;
}

const CurrentSubscription: React.FC<CurrentSubscriptionProps> = ({ subscription, onUpgradeClick }) => {
  if (!subscription) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          No Active Subscription
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          You're currently not on any plan. Choose a plan to get started.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onUpgradeClick}
          startIcon={<ArrowUpwardIcon />}
        >
          Choose a Plan
        </Button>
      </Box>
    );
  }

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'N/A';
    // Convert Firestore Timestamp to JavaScript Date
    const date = timestamp.toDate();
    return format(date, 'MMM dd, yyyy');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'past_due':
        return 'warning';
      case 'canceled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Current Plan</Typography>
        <Chip 
          label={subscription.status.toUpperCase()} 
          color={getStatusColor(subscription.status) as any}
          size="small"
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {subscription.planName}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {subscription.amount} {subscription.currency} / month
          </Typography>
          
          <Box display="flex" alignItems="center" mt={2}>
            <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Renews on {formatDate(subscription.renewalDate)}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={onUpgradeClick}
              startIcon={<ArrowUpwardIcon />}
            >
              Change Plan
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              startIcon={<CancelIcon />}
            >
              Cancel Subscription
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" gutterBottom>
        Plan Features
      </Typography>
      
      <Grid container spacing={1}>
        {subscription.features.map((feature, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Typography variant="body2" color="text.secondary">
              • {feature}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CurrentSubscription;
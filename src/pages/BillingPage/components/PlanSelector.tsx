import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Box
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { PricingPlan, UserSubscription } from '../../../types/billing.types';
import billingService from '../../../services/firestore/billingService';

interface PlanSelectorProps {
  currentSubscription: UserSubscription | null;
  availablePlans: PricingPlan[];
  onClose: () => void;
  businessId: string;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  currentSubscription,
  availablePlans,
  onClose,
  businessId
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>(availablePlans);
  const [loading, setLoading] = useState<boolean>(availablePlans.length === 0);

  // Fetch plans if none were provided
  useEffect(() => {
    const fetchPlans = async () => {
      if (availablePlans.length === 0) {
        try {
          setLoading(true);
          const plansData = await billingService.getPricingPlans();
          setPlans(plansData);
          setError(null);
        } catch (err) {
          console.error('Error fetching pricing plans:', err);
          setError('Failed to load pricing plans. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPlans();
  }, [availablePlans]);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleConfirm = async () => {
    if (!selectedPlan) return;
    
    try {
      setIsProcessing(true);
      // In a real implementation, this would call a service to change the plan
      // await billingService.changePlan(businessId, selectedPlan);
      
      // For now, just simulate a successful plan change
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
        // You would typically refresh the subscription data here
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error changing plan:', err);
      setError('Failed to change plan. Please try again.');
      setIsProcessing(false);
    }
  };

  // Helper function to render feature items
  const renderFeatureItem = (feature: { name: string; included: boolean; highlight?: boolean }) => (
    <ListItem key={feature.name} sx={{ py: 0.5 }}>
      <ListItemIcon sx={{ minWidth: 36 }}>
        {feature.included ? (
          <CheckIcon color="success" fontSize="small" />
        ) : (
          <CloseIcon color="error" fontSize="small" />
        )}
      </ListItemIcon>
      <ListItemText 
        primary={feature.name} 
        primaryTypographyProps={{ 
          variant: 'body2',
          fontWeight: feature.highlight ? 'bold' : 'normal'
        }} 
      />
    </ListItem>
  );

  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        Choose Your Plan
        <Typography variant="body2" color="text.secondary">
          Select the plan that best fits your business needs.
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <CircularProgress />
          </div>
        ) : error ? (
          <Typography color="error" align="center" sx={{ py: 4 }}>
            {error}
          </Typography>
        ) : plans.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography paragraph>
              No pricing plans are available. Please contact your administrator.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {plans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card 
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderColor: selectedPlan === plan.id ? 'primary.main' : 'divider',
                    borderWidth: selectedPlan === plan.id ? 2 : 1,
                    position: 'relative',
                    ...(plan.popularPlan ? {
                      boxShadow: 3,
                      borderColor: 'primary.main',
                    } : {})
                  }}
                >
                  {plan.popularPlan && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: '#1976d2',
                      color: 'white',
                      padding: '4px 12px',
                      borderBottomLeftRadius: 8,
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}>
                      MOST POPULAR
                    </div>
                  )}
                  
                  <CardHeader
                    title={plan.name}
                    titleTypographyProps={{ variant: 'h6' }}
                    sx={{
                      backgroundColor: selectedPlan === plan.id ? 'rgba(25, 118, 210, 0.1)' : 'background.default',
                      pb: 1
                    }}
                  />
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="div" gutterBottom>
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                      <Typography variant="caption" component="span" sx={{ ml: 1 }}>
                        /{plan.billingCycle}
                      </Typography>
                    </Typography>
                    
                    {plan.description && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {plan.description}
                      </Typography>
                    )}
                    
                    <List dense>
                      {plan.features && plan.features.slice(0, 5).map(feature => renderFeatureItem(feature))}
                    </List>
                    
                    {plan.features && plan.features.length > 5 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        +{plan.features.length - 5} more features
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant={selectedPlan === plan.id ? "contained" : "outlined"}
                      color="primary"
                      fullWidth
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={currentSubscription?.planId === plan.id}
                    >
                      {currentSubscription?.planId === plan.id ? 'Current Plan' : plan.ctaText || 'Select Plan'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleConfirm}
          disabled={!selectedPlan || isProcessing || selectedPlan === currentSubscription?.planId}
        >
          {isProcessing ? <CircularProgress size={24} /> : 'Confirm Selection'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlanSelector;
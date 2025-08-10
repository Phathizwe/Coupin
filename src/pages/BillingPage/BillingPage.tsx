import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Grid, Divider } from '@mui/material';
import billingService from '../../services/firestore/billingService';
import { PricingPlan, UserSubscription, BillingHistory, UsageMetrics } from '../../types/billing.types';
import CurrentSubscription from './components/CurrentSubscription';
import PaymentMethods from './components/PaymentMethods';
import BillingHistoryList from './components/BillingHistoryList';
import UsageMetricsDisplay from './components/UsageMetricsDisplay';
import PlanSelector from './components/PlanSelector';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { useAuth } from '../../hooks/useAuth';

/**
 * BillingPage component - Manages subscription and billing information
 * 
 * This component displays the user's current subscription, payment methods,
 * billing history, and usage metrics. It also allows the user to upgrade
 * or downgrade their subscription plan.
 */
const BillingPage: React.FC = () => {
  const auth = useAuth();
  
  // Debug the auth context to understand its structure
  console.log("Auth context:", auth);
  console.log("User:", auth.user);
  console.log("Business Profile:", (auth.user as any)?.businessProfile);
  
  // Try multiple ways to get the businessId
  const businessId = 
    auth.user?.businessId || 
    (auth.user as any)?.businessProfile?.businessId || 
    auth.businessProfile?.businessId ||
    auth.user?.uid ||
    '';
  
  console.log("Selected businessId:", businessId);
  
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [availablePlans, setAvailablePlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlanSelector, setShowPlanSelector] = useState<boolean>(false);

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!businessId) {
        setError('Business ID is missing. Please ensure you are logged in with a business account.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch all billing data in parallel
        const [subscriptionData, historyData, metricsData, plansData] = await Promise.all([
          billingService.getUserSubscription(businessId),
          billingService.getBillingHistory(businessId),
          billingService.getUsageMetrics(businessId),
          billingService.getPricingPlans()
        ]);

        setSubscription(subscriptionData);
        setBillingHistory(historyData);
        setUsageMetrics(metricsData);
        setAvailablePlans(plansData);
        
      } catch (err) {
        console.error('Error fetching billing data:', err);
        setError('Failed to load billing information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [businessId]);

  const handleUpgradeClick = () => {
    setShowPlanSelector(true);
  };

  const handlePlanSelectorClose = () => {
    setShowPlanSelector(false);
  };

  // Show auth debug info if there's an error with the business ID
  if (!businessId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Authentication Debug
        </Typography>
        
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom color="error">
            Business ID is missing
          </Typography>
          
          <Typography variant="body1" paragraph>
            We couldn't find your business ID. Here's the authentication information we have:
          </Typography>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, overflowX: 'auto' }}>
            <pre style={{ margin: 0 }}>
              {JSON.stringify({
                user: auth.user,
                businessProfile: auth.businessProfile || (auth.user as any)?.businessProfile,
              }, null, 2)}
            </pre>
          </Box>
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Please ensure you are logged in with a business account and try again.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Subscription & Billing
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your subscription, payment methods, and billing history.
      </Typography>

      <Grid container spacing={4}>
        {/* Current Subscription */}
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <CurrentSubscription 
              subscription={subscription} 
              onUpgradeClick={handleUpgradeClick}
            />
          </Paper>
        </Grid>

        {/* Usage Metrics */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <UsageMetricsDisplay metrics={usageMetrics} />
          </Paper>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <PaymentMethods subscription={subscription} />
          </Paper>
        </Grid>

        {/* Billing History */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <BillingHistoryList history={billingHistory} />
          </Paper>
        </Grid>
      </Grid>

      {/* Plan Selector Modal */}
      {showPlanSelector && (
        <PlanSelector 
          currentSubscription={subscription}
          availablePlans={availablePlans}
          onClose={handlePlanSelectorClose}
          businessId={businessId}
        />
      )}
    </Container>
  );
};

export default BillingPage;
import React from 'react';
import { Box, Typography, LinearProgress, Grid } from '@mui/material';
import { UsageMetrics } from '../../../types/billing.types';

interface UsageMetricsDisplayProps {
  metrics: UsageMetrics | null;
}

const UsageMetricsDisplay: React.FC<UsageMetricsDisplayProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Usage Metrics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No usage data available.
        </Typography>
      </Box>
    );
  }

  const calculatePercentage = (used: number, limit: number) => {
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return 'success';
    if (percentage < 90) return 'warning';
    return 'error';
  };

  const renderMetric = (label: string, used: number, limit: number) => {
    const percentage = calculatePercentage(used, limit);
    const color = getProgressColor(percentage);

    return (
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="body2">{label}</Typography>
          <Typography variant="body2" fontWeight="medium">
            {used} / {limit}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          color={color as any}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Usage Metrics
      </Typography>
      
      <Box mt={2}>
        {renderMetric('Customers', metrics.customers.used, metrics.customers.limit)}
        {renderMetric('Coupons', metrics.coupons.used, metrics.coupons.limit)}
        {renderMetric('Communications', metrics.communications.used, metrics.communications.limit)}
      </Box>
    </Box>
  );
};

export default UsageMetricsDisplay;
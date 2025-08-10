import React from 'react';
import { Alert, Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
      padding={4}
    >
      <Alert 
        severity="error"
        icon={<ErrorOutlineIcon fontSize="large" />}
        sx={{ mb: 2, width: '100%', maxWidth: 500 }}
      >
        <Typography variant="h6" gutterBottom>
          Something went wrong
        </Typography>
        <Typography variant="body2">
          {message}
        </Typography>
      </Alert>
      
      {onRetry && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onRetry}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default ErrorAlert;
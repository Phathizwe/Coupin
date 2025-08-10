import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid } from '@mui/material';
import { UserSubscription } from '../../../types/billing.types';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

interface PaymentMethodsProps {
  subscription: UserSubscription | null;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ subscription }) => {
  const [openAddCardDialog, setOpenAddCardDialog] = useState(false);
  const [openEditCardDialog, setOpenEditCardDialog] = useState(false);

  // Mock data for payment method - in a real app, this would come from your payment processor
  const paymentMethod = subscription?.paymentMethod ? {
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2025
  } : null;

  const handleAddCardOpen = () => {
    setOpenAddCardDialog(true);
  };

  const handleAddCardClose = () => {
    setOpenAddCardDialog(false);
  };

  const handleEditCardOpen = () => {
    setOpenEditCardDialog(true);
  };

  const handleEditCardClose = () => {
    setOpenEditCardDialog(false);
  };

  const handleAddCard = (event: React.FormEvent) => {
    event.preventDefault();
    // Here you would integrate with your payment processor to add a new card
    console.log('Adding new card');
    handleAddCardClose();
  };

  const handleUpdateCard = (event: React.FormEvent) => {
    event.preventDefault();
    // Here you would integrate with your payment processor to update the card
    console.log('Updating card');
    handleEditCardClose();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment Methods
      </Typography>

      {paymentMethod ? (
        <Box mt={2}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <CreditCardIcon sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle1">
                      {paymentMethod.brand.charAt(0).toUpperCase() + paymentMethod.brand.slice(1)} •••• {paymentMethod.last4}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  startIcon={<EditIcon />} 
                  onClick={handleEditCardOpen}
                  size="small"
                >
                  Edit
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Box mt={2} mb={2}>
          <Typography variant="body1" color="text.secondary">
            No payment method on file.
          </Typography>
        </Box>
      )}

      <Box mt={3}>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />}
          onClick={handleAddCardOpen}
        >
          Add Payment Method
        </Button>
      </Box>

      {/* Add Card Dialog */}
      <Dialog open={openAddCardDialog} onClose={handleAddCardClose}>
        <DialogTitle>Add Payment Method</DialogTitle>
        <form onSubmit={handleAddCard}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Card Number"
                  fullWidth
                  required
                  placeholder="1234 5678 9012 3456"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Expiration Date"
                  fullWidth
                  required
                  placeholder="MM/YY"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="CVC"
                  fullWidth
                  required
                  placeholder="123"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Cardholder Name"
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddCardClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Add Card
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Card Dialog */}
      <Dialog open={openEditCardDialog} onClose={handleEditCardClose}>
        <DialogTitle>Update Payment Method</DialogTitle>
        <form onSubmit={handleUpdateCard}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Expiration Date"
                  fullWidth
                  required
                  defaultValue={paymentMethod ? `${paymentMethod.expMonth}/${paymentMethod.expYear.toString().slice(-2)}` : ''}
                  placeholder="MM/YY"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="CVC"
                  fullWidth
                  required
                  placeholder="123"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Cardholder Name"
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditCardClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Update Card
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default PaymentMethods;
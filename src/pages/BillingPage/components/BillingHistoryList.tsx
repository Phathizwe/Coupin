import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton } from '@mui/material';
import { BillingHistory } from '../../../types/billing.types';
import DownloadIcon from '@mui/icons-material/Download';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

interface BillingHistoryListProps {
  history: BillingHistory[];
}

const BillingHistoryList: React.FC<BillingHistoryListProps> = ({ history }) => {
  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'N/A';
    // Convert Firestore Timestamp to JavaScript Date
    const date = timestamp.toDate();
    return format(date, 'MMM dd, yyyy');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Billing History
      </Typography>

      {history.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          No billing history available.
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Invoice</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDate(item.paymentDate)}</TableCell>
                  <TableCell>
                    {`Payment for ${item.planName}`}
                  </TableCell>
                  <TableCell align="right">
                    {item.amount} {item.currency}
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={item.status.toUpperCase()} 
                      color={getStatusColor(item.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {item.receiptUrl ? (
                      <IconButton 
                        size="small" 
                        href={item.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default BillingHistoryList;
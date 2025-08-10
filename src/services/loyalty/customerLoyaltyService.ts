import { 
  doc, 
  getDoc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// Update customer loyalty points
export const updateCustomerLoyaltyPoints = async (customerId: string, points: number) => {
  try {
    const customerRef = doc(db, 'customers', customerId);
    const customerDoc = await getDoc(customerRef);

    if (!customerDoc.exists()) {
      throw new Error('Customer not found');
    }

    const currentPoints = customerDoc.data().loyaltyPoints || 0;

    await updateDoc(customerRef, {
      loyaltyPoints: currentPoints + points,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error updating customer loyalty points:', error);
    throw error;
  }
};
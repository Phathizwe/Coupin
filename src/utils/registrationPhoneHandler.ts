import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Utility to ensure phone numbers are properly stored during registration
 * This addresses the issue where phone numbers aren't being saved correctly
 */
export class RegistrationPhoneHandler {
  /**
   * Normalize a phone number by removing all non-digit characters
   * 
   * @param phone The phone number to normalize
   * @returns The normalized phone number (digits only)
   */
  normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  }

  /**
   * Ensure the phone number is properly stored for a user after registration
   * This is a fallback mechanism to address cases where the phone number
   * isn't being saved during the registration process
   * 
   * @param userId The user ID
   * @param phoneNumber The phone number to ensure is stored
   * @returns Promise that resolves when the operation is complete
   */
  async ensurePhoneNumberStored(userId: string, phoneNumber: string): Promise<boolean> {
    try {
      if (!userId || !phoneNumber) {
        console.error('Missing userId or phoneNumber');
        return false;
      }

      console.log(`Ensuring phone number is stored for user ${userId}: ${phoneNumber}`);

      // Normalize the phone number
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      
      // Update the user document with the phone number
      // This is a direct update to ensure the phone number is stored
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        phoneNumber: phoneNumber,
        phoneNumber_normalized: normalizedPhone,
        updatedAt: serverTimestamp()
      });
      
      console.log(`Successfully stored phone number for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error ensuring phone number is stored:', error);
      return false;
    }
  }
}

export const registrationPhoneHandler = new RegistrationPhoneHandler();
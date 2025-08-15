import { doc, updateDoc, increment, setDoc, getDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

export interface QRCodeData {
  customerId: string;
  programId: string;
  businessId: string;
  customerPhone: string;
  timestamp: number;
  type: 'loyalty_visit';
}

export interface VisitRecord {
  id: string;
  customerId: string;
  businessId: string;
  programId: string;
  customerName: string;
  customerPhone: string;
  programName: string;
  visitDate: Date;
  pointsEarned?: number;
  amountSpent?: number;
  notes?: string;
  recordedBy: string; // Business owner ID
}

export interface VisitRecordingResult {
  success: boolean;
  message: string;
  customerName?: string;
  programName?: string;
  pointsEarned?: number;
  newTotalPoints?: number;
  newTotalVisits?: number;
}

export class VisitRecordingService {
  /**
   * Parse QR code data from scanned string
   */
  parseQRCode(qrString: string): QRCodeData | null {
    try {
      const data = JSON.parse(qrString);
      if (data.type === 'loyalty_visit' && 
          data.customerId && 
          data.programId && 
          data.businessId) {
        return data as QRCodeData;
      }
      return null;
    } catch (error) {
      console.error('QR parsing error:', error);
      return null;
    }
  }

  /**
   * Record a customer visit from QR code scan
   */
  async recordVisitFromQR(
    qrData: QRCodeData, 
    businessOwnerId: string,
    amountSpent: number = 0,
    notes: string = ''
  ): Promise<VisitRecordingResult> {
    try {
      // Verify this QR code is for this business
      if (qrData.businessId !== businessOwnerId) {
        return {
          success: false,
          message: 'This QR code is not for your business'
        };
      }

      // Get customer program data
      const customerProgramRef = doc(db, 'customerPrograms', `${qrData.customerId}_${qrData.programId}`);
      const customerProgramDoc = await getDoc(customerProgramRef);
      if (!customerProgramDoc.exists()) {
        return {
          success: false,
          message: 'Customer program not found'
        };
      }
      const programData = customerProgramDoc.data();

      // Get loyalty program details to calculate points
      const loyaltyProgramRef = doc(db, 'loyaltyPrograms', qrData.programId);
      const loyaltyProgramDoc = await getDoc(loyaltyProgramRef);
      if (!loyaltyProgramDoc.exists()) {
        return {
          success: false,
          message: 'Loyalty program not found'
        };
      }
      const loyaltyProgram = loyaltyProgramDoc.data();

      // Calculate points earned based on program type
      let pointsEarned = 0;
      if (loyaltyProgram.type === 'points' && amountSpent > 0) {
        const pointsPerAmount = loyaltyProgram.pointsPerAmount || 1;
        pointsEarned = Math.floor(amountSpent * pointsPerAmount);
      }

      // Update customer program with new visit
      const updates: any = {
        currentVisits: increment(1),
        totalSpent: increment(amountSpent),
        lastVisit: Timestamp.now()
      };
      if (pointsEarned > 0) {
        updates.currentPoints = increment(pointsEarned);
      }
      await updateDoc(customerProgramRef, updates);

      // Create visit record
      const visitRecord: VisitRecord = {
        id: `${qrData.customerId}_${qrData.programId}_${Date.now()}`,
        customerId: qrData.customerId,
        businessId: qrData.businessId,
        programId: qrData.programId,
        customerName: programData.customerName,
        customerPhone: qrData.customerPhone,
        programName: programData.programName,
        visitDate: new Date(),
        pointsEarned,
        amountSpent,
        notes,
        recordedBy: businessOwnerId
      };
      await setDoc(doc(db, 'visitRecords', visitRecord.id), visitRecord);

      return {
        success: true,
        message: `Visit recorded for ${programData.customerName}`,
        customerName: programData.customerName,
        programName: programData.programName,
        pointsEarned,
        newTotalPoints: (programData.currentPoints || 0) + pointsEarned,
        newTotalVisits: (programData.currentVisits || 0) + 1
      };
    } catch (error) {
      console.error('Visit recording error:', error);
      return {
        success: false,
        message: 'Failed to record visit. Please try again.'
      };
    }
  }

  /**
   * Record visit manually by customer phone number
   */
  async recordVisitByPhone(
    businessId: string,
    customerPhone: string,
    programId: string,
    amountSpent: number = 0,
    notes: string = ''
  ): Promise<VisitRecordingResult> {
    try {
      // Find customer program by phone and program
      const customerProgramsRef = collection(db, 'customerPrograms');
      const phoneQuery = query(
        customerProgramsRef,
        where('businessId', '==', businessId),
        where('customerPhone', '==', customerPhone.replace(/\s+/g, '')),
        where('programId', '==', programId),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(phoneQuery);
      if (snapshot.empty) {
        return {
          success: false,
          message: `No customer found with phone ${customerPhone} in this program`
        };
      }
      const customerProgramDoc = snapshot.docs[0];
      const programData = customerProgramDoc.data();

      // Create QR data structure for consistency
      const qrData: QRCodeData = {
        customerId: programData.customerId,
        programId: programData.programId,
        businessId: programData.businessId,
        customerPhone: programData.customerPhone,
        timestamp: Date.now(),
        type: 'loyalty_visit'
      };
      return await this.recordVisitFromQR(qrData, businessId, amountSpent, notes);
    } catch (error) {
      console.error('Manual visit recording error:', error);
      return {
        success: false,
        message: 'Failed to record visit. Please try again.'
      };
    }
  }
}

export const visitRecordingService = new VisitRecordingService();
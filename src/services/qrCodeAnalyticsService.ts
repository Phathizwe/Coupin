import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc, 
  addDoc, 
  Timestamp,
  orderBy,
  limit,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';

export interface QRCodeScanEvent {
  businessId: string;
  couponId: string | null; // null for business-wide QR codes
  customerId: string | null; // might be anonymous scans
  scannedAt: Timestamp;
  converted: boolean;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    mobile: boolean;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface QRCodeAnalytics {
  totalScans: number;
  uniqueCustomers: number;
  conversionRate: number;
  recentScans?: QRCodeScanEvent[];
  scansByDate?: Record<string, number>;
}

/**
 * Service for tracking and analyzing QR code scans
 */
export class QRCodeAnalyticsService {
  /**
   * Record a new QR code scan event
   * @param scanEvent The scan event details
   * @returns Promise resolving to the ID of the created record
   */
  static async recordScan(scanEvent: Omit<QRCodeScanEvent, 'scannedAt'>): Promise<string> {
    try {
      const scanEventWithTimestamp = {
        ...scanEvent,
        scannedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, 'qrCodeScans'), scanEventWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('Error recording QR code scan:', error);
      throw new Error('Failed to record QR code scan');
    }
  }
  
  /**
   * Get analytics for all QR codes for a business
   * @param businessId The business ID
   * @returns Promise resolving to the analytics data
   */
  static async getBusinessQRCodeAnalytics(businessId: string): Promise<QRCodeAnalytics> {
    try {
      // Query all scans for this business
      const scansRef = collection(db, 'qrCodeScans');
      const q = query(
        scansRef,
        where('businessId', '==', businessId),
        orderBy('scannedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return {
          totalScans: 0,
          uniqueCustomers: 0,
          conversionRate: 0
        };
      }
      
      // Calculate analytics from scan data
      return this.calculateAnalytics(snapshot, businessId);
    } catch (error) {
      console.error('Error fetching QR code analytics:', error);
      throw new Error('Failed to fetch QR code analytics');
    }
  }
  
  /**
   * Get analytics for a specific coupon QR code
   * @param businessId The business ID
   * @param couponId The coupon ID
   * @returns Promise resolving to the analytics data
   */
  static async getCouponQRCodeAnalytics(businessId: string, couponId: string): Promise<QRCodeAnalytics> {
    try {
      // Query scans for this specific coupon
      const scansRef = collection(db, 'qrCodeScans');
      const q = query(
        scansRef,
        where('businessId', '==', businessId),
        where('couponId', '==', couponId),
        orderBy('scannedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return {
          totalScans: 0,
          uniqueCustomers: 0,
          conversionRate: 0
        };
      }
      
      // Calculate analytics from scan data
      return this.calculateAnalytics(snapshot, businessId);
    } catch (error) {
      console.error('Error fetching coupon QR code analytics:', error);
      throw new Error('Failed to fetch coupon QR code analytics');
    }
  }
  
  /**
   * Calculate analytics from scan data
   * @param snapshot The query snapshot containing scan events
   * @param businessId The business ID for additional lookups if needed
   * @returns The calculated analytics
   */
  private static calculateAnalytics(snapshot: QuerySnapshot<DocumentData>, businessId: string): QRCodeAnalytics {
    // Total number of scans
    const totalScans = snapshot.size;
    
    // Count unique customers (excluding anonymous scans)
    const customerIds = new Set<string>();
    let conversions = 0;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data() as QRCodeScanEvent;
      if (data.customerId) {
        customerIds.add(data.customerId);
      }
      if (data.converted) {
        conversions++;
      }
    });
    
    const uniqueCustomers = customerIds.size;
    
    // Calculate conversion rate (as percentage)
    const conversionRate = totalScans > 0 ? Math.round((conversions / totalScans) * 100) : 0;
    
    // Get recent scans
    const recentScans = snapshot.docs
      .slice(0, 5)
      .map(doc => doc.data() as QRCodeScanEvent);
    
    // Group scans by date for charting
    const scansByDate: Record<string, number> = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data() as QRCodeScanEvent;
      const date = data.scannedAt.toDate().toISOString().split('T')[0];
      scansByDate[date] = (scansByDate[date] || 0) + 1;
    });
    
    return {
      totalScans,
      uniqueCustomers,
      conversionRate,
      recentScans,
      scansByDate
    };
  }
}
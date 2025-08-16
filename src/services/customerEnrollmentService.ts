import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { EnhancedQRCodeService } from './enhancedQRCodeService';

export interface EnrollmentData {
  customerId: string;
  businessId: string;
  enrollmentDate: Timestamp;
  status: 'active' | 'inactive';
  source: 'qr_code' | 'manual' | 'website' | 'app';
  referredBy?: string;
}

export interface CustomerData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  userId?: string;
}

/**
 * Service for managing customer enrollment in loyalty programs
 */
export class CustomerEnrollmentService {
  /**
   * Enroll a customer in a business loyalty program
   * @param businessId Business ID
   * @param customerData Customer data
   * @param source Enrollment source
   * @param referredBy Customer ID who referred (optional)
   * @returns Promise with enrollment result
   */
  async enrollCustomer(
    businessId: string,
    customerData: CustomerData,
    source: 'qr_code' | 'manual' | 'website' | 'app' = 'manual',
    referredBy?: string
  ): Promise<{ success: boolean; customerId?: string; message?: string }> {
    try {
      // Validate required fields
      if (!businessId || !customerData.firstName) {
        return { success: false, message: 'Missing required fields' };
      }
      
      // Normalize phone number if provided
      let normalizedPhone = '';
      if (customerData.phone) {
        normalizedPhone = this.normalizePhoneNumber(customerData.phone);
      }
      
      // Check if business exists
      const businessRef = doc(db, 'businesses', businessId);
      const businessDoc = await getDoc(businessRef);
      
      if (!businessDoc.exists()) {
        return { success: false, message: 'Business not found' };
      }
      
      // Check if customer already exists
      let customerId = '';
      let isNewCustomer = false;
      
      if (normalizedPhone) {
        // Try to find by phone
        const customerByPhoneQuery = query(
          collection(db, 'customers'),
          where('phone_normalized', '==', normalizedPhone)
        );
        
        const phoneSnapshot = await getDocs(customerByPhoneQuery);
        
        if (!phoneSnapshot.empty) {
          customerId = phoneSnapshot.docs[0].id;
        }
      }
      
      if (!customerId && customerData.email) {
        // Try to find by email
        const customerByEmailQuery = query(
          collection(db, 'customers'),
          where('email', '==', customerData.email)
        );
        
        const emailSnapshot = await getDocs(customerByEmailQuery);
        
        if (!emailSnapshot.empty) {
          customerId = emailSnapshot.docs[0].id;
        }
      }
      
      if (!customerId && customerData.userId) {
        // Try to find by userId
        const customerByUserIdQuery = query(
          collection(db, 'customers'),
          where('userId', '==', customerData.userId)
        );
        
        const userIdSnapshot = await getDocs(customerByUserIdQuery);
        
        if (!userIdSnapshot.empty) {
          customerId = userIdSnapshot.docs[0].id;
        }
      }
      
      // Create or update customer
      if (customerId) {
        // Update existing customer
        const customerRef = doc(db, 'customers', customerId);
        
        await updateDoc(customerRef, {
          firstName: customerData.firstName,
          lastName: customerData.lastName || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          phone_normalized: normalizedPhone,
          userId: customerData.userId || '',
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new customer
        const customersRef = collection(db, 'customers');
        const newCustomerRef = doc(customersRef);
        customerId = newCustomerRef.id;
        isNewCustomer = true;
        
        await setDoc(newCustomerRef, {
          firstName: customerData.firstName,
          lastName: customerData.lastName || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          phone_normalized: normalizedPhone,
          userId: customerData.userId || '',
          joinDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      // Check if customer is already enrolled in this business
      const enrollmentQuery = query(
        collection(db, 'customerPrograms'),
        where('customerId', '==', customerId),
        where('businessId', '==', businessId)
      );
      
      const enrollmentSnapshot = await getDocs(enrollmentQuery);
      
      if (!enrollmentSnapshot.empty) {
        // Already enrolled, just update status
        const enrollmentRef = doc(db, 'customerPrograms', enrollmentSnapshot.docs[0].id);
        
        await updateDoc(enrollmentRef, {
          status: 'active',
          updatedAt: serverTimestamp()
        });
        
        return { 
          success: true, 
          customerId, 
          message: 'Customer enrollment updated' 
        };
      }
      
      // Create new enrollment
      const enrollmentData: EnrollmentData = {
        customerId,
        businessId,
        enrollmentDate: Timestamp.now(),
        status: 'active',
        source
      };
      
      if (referredBy) {
        enrollmentData.referredBy = referredBy;
      }
      
      const enrollmentRef = doc(collection(db, 'customerPrograms'));
      
      await setDoc(enrollmentRef, {
        ...enrollmentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Update business customer count
      const businessData = businessDoc.data();
      const customerCount = (businessData.customerCount || 0) + (isNewCustomer ? 1 : 0);
      
      await updateDoc(businessRef, {
        customerCount,
        updatedAt: serverTimestamp()
      });
      
      return { 
        success: true, 
        customerId, 
        message: isNewCustomer ? 'New customer enrolled' : 'Existing customer enrolled' 
      };
    } catch (error) {
      console.error('Error enrolling customer:', error);
      return { success: false, message: 'Error enrolling customer' };
    }
  }
  
  /**
   * Generate a QR code for customer enrollment
   * @param businessId Business ID
   * @param format QR code format (png, svg, pdf)
   * @returns Promise with QR code data URL
   */
  async generateEnrollmentQRCode(businessId: string, format: 'png' | 'svg' | 'pdf' = 'png'): Promise<string> {
    try {
      // Create enrollment URL
      const enrollmentUrl = `https://tyca.app/enroll/${businessId}`;
      
      // Generate QR code
      return await EnhancedQRCodeService.generateCouponQRCode(enrollmentUrl, format);
    } catch (error) {
      console.error('Error generating enrollment QR code:', error);
      throw error;
    }
  }
  
  /**
   * Get customer enrollments for a business
   * @param businessId Business ID
   * @returns Promise with customer enrollments
   */
  async getBusinessEnrollments(businessId: string): Promise<any[]> {
    try {
      const enrollmentsQuery = query(
        collection(db, 'customerPrograms'),
        where('businessId', '==', businessId),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(enrollmentsQuery);
      
      const enrollments: any[] = [];
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // Get customer details
        const customerRef = doc(db, 'customers', data.customerId);
        const customerDoc = await getDoc(customerRef);
        
        if (customerDoc.exists()) {
          const customerData = customerDoc.data() as {
            firstName?: string;
            lastName?: string;
            email?: string;
            phone?: string;
          };
          
          enrollments.push({
            id: docSnapshot.id,
            customerId: data.customerId,
            businessId: data.businessId,
            enrollmentDate: data.enrollmentDate,
            status: data.status,
            source: data.source,
            customer: {
              firstName: customerData.firstName || '',
              lastName: customerData.lastName || '',
              email: customerData.email || '',
              phone: customerData.phone || ''
            }
          });
        }
      }
      
      return enrollments;
    } catch (error) {
      console.error('Error getting business enrollments:', error);
      return [];
    }
  }
  
  /**
   * Get customer enrollments for a customer
   * @param customerId Customer ID
   * @returns Promise with business enrollments
   */
  async getCustomerEnrollments(customerId: string): Promise<any[]> {
    try {
      const enrollmentsQuery = query(
        collection(db, 'customerPrograms'),
        where('customerId', '==', customerId),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(enrollmentsQuery);
      
      const enrollments: any[] = [];
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // Get business details
        const businessRef = doc(db, 'businesses', data.businessId);
        const businessDoc = await getDoc(businessRef);
        
        if (businessDoc.exists()) {
          const businessData = businessDoc.data() as {
            businessName?: string;
            industry?: string;
            logo?: string;
          };
          
          enrollments.push({
            id: docSnapshot.id,
            customerId: data.customerId,
            businessId: data.businessId,
            enrollmentDate: data.enrollmentDate,
            status: data.status,
            source: data.source,
            business: {
              businessName: businessData.businessName || '',
              industry: businessData.industry || '',
              logo: businessData.logo || ''
            }
          });
        }
      }
      
      return enrollments;
    } catch (error) {
      console.error('Error getting customer enrollments:', error);
      return [];
    }
  }
  
  /**
   * Normalize a phone number by removing all non-digit characters
   * @param phone The phone number to normalize
   * @returns The normalized phone number (digits only)
   */
  private normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  }
}

// Export a singleton instance
export const customerEnrollmentService = new CustomerEnrollmentService();
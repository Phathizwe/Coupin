/**
 * Service for generating and managing QR codes
 */
import QRCode from 'qrcode';

export interface QRCodeData {
  customerId: string;
  programId: string;
  businessId: string;
  timestamp: number;
  version: string;
}

/**
 * Generate QR code data for a customer loyalty program
 * @param data The data to encode in the QR code
 * @returns The formatted QR code data
 */
export const generateCustomerQRData = async (data: {
  customerId: string;
  programId: string;
  businessId: string;
  timestamp: number;
}): Promise<QRCodeData> => {
  return {
    customerId: data.customerId,
    programId: data.programId,
    businessId: data.businessId,
    timestamp: data.timestamp,
    version: '1.0' // For future compatibility
  };
};

/**
 * Generate a QR code data URL for a coupon code
 * @param couponCode The coupon code to encode
 * @returns A data URL containing the QR code
 */
export const generateCouponQRCode = async (couponCode: string): Promise<string> => {
  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(couponCode, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating coupon QR code:', error);
    throw error;
  }
};

/**
 * Parse QR code data from a scanned code
 * @param qrData The data extracted from a QR code
 * @returns The parsed QR code data if valid
 */
export const parseQRCodeData = (qrData: string): QRCodeData | null => {
  try {
    const data = JSON.parse(qrData);
    
    // Validate required fields
    if (!data.customerId || !data.programId || !data.businessId || !data.timestamp) {
      console.error('Invalid QR code data: missing required fields');
      return null;
    }
    
    return {
      customerId: data.customerId,
      programId: data.programId,
      businessId: data.businessId,
      timestamp: data.timestamp,
      version: data.version || '1.0'
    };
  } catch (error) {
    console.error('Error parsing QR code data:', error);
    return null;
  }
};

/**
 * Validate a QR code for security
 * @param qrData The QR code data to validate
 * @param businessId The business ID to validate against
 * @returns Whether the QR code is valid and belongs to the business
 */
export const validateQRCode = (qrData: QRCodeData, businessId: string): boolean => {
  // Check if QR code is for this business
  if (qrData.businessId !== businessId) {
    return false;
  }
  
  // Check if QR code is not too old (e.g., within last 5 minutes)
  const maxAgeMs = 5 * 60 * 1000; // 5 minutes
  const now = Date.now();
  if (now - qrData.timestamp > maxAgeMs) {
    return false;
  }
  
  return true;
};

/**
 * QR Code Service
 */
export const QRCodeService = {
  generateCustomerQRData,
  parseQRCodeData,
  validateQRCode,
  generateCouponQRCode
};

export default QRCodeService;
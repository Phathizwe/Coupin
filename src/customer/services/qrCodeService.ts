import QRCode from 'qrcode';

export interface QRCodeData {
  customerId: string;
  programId: string;
  businessId: string;
  customerPhone: string;
  timestamp: number;
  type: 'loyalty_visit';
}

export class QRCodeService {
  /**
   * Generate QR code for loyalty program visit
   */
  async generateLoyaltyQR(
    customerId: string,
    programId: string,
    businessId: string,
    customerPhone: string
  ): Promise<string> {
    try {
      const qrData: QRCodeData = {
        customerId,
        programId,
        businessId,
        customerPhone,
        timestamp: Date.now(),
        type: 'loyalty_visit'
      };
      const qrString = JSON.stringify(qrData);
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('QR generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Parse QR code data
   */
  parseQRData(qrString: string): QRCodeData | null {
    try {
      const data = JSON.parse(qrString);
      if (data.type === 'loyalty_visit' && data.customerId && data.programId) {
        return data as QRCodeData;
      }
      return null;
    } catch (error) {
      console.error('QR parsing error:', error);
      return null;
    }
  }
}

export const qrCodeService = new QRCodeService();
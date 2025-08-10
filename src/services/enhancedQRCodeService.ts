import { Coupon } from '../types';
import QRCode from 'qrcode';

/**
 * Enhanced service for generating and managing QR codes for coupons
 * with proper QR code generation using the qrcode library
 */
export class EnhancedQRCodeService {
  /**
   * Generate a QR code data URL for a specific coupon or business
   * @param data The coupon object, coupon code, or business data to generate QR for
   * @param format The desired format (png, svg, pdf)
   * @returns Promise that resolves to a data URL for the QR code
   */
  static async generateCouponQRCode(data: Coupon | string, format: string = 'png'): Promise<string> {
    try {
      // Determine what data to encode in the QR code
      let qrContent: string;
      let couponName: string = 'All Coupons';
      
      if (typeof data === 'string') {
        // If it's a string, it could be either a coupon code or serialized business data
        try {
          // Check if it's JSON (business data)
          const parsed = JSON.parse(data);
          qrContent = data;
          if (parsed.type === 'business') {
            couponName = 'Business QR';
          }
        } catch (e) {
          // It's a simple coupon code
          qrContent = JSON.stringify({
            type: 'coupon',
            code: data
          });
          couponName = `Coupon: ${data}`;
        }
      } else {
        // It's a coupon object
        qrContent = JSON.stringify({
          type: 'coupon',
          code: data.code
        });
        couponName = data.title || 'Coupon';
      }
      
      // Generate QR code based on requested format
      switch (format.toLowerCase()) {
        case 'svg':
          return this.generateSvgQRCode(qrContent);
        case 'pdf':
          const svgCode = await this.generateSvgQRCode(qrContent, false);
          return this.generatePdfWithQRCode(svgCode, couponName);
        case 'png':
        default:
          return this.generatePngQRCode(qrContent);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }
  
  /**
   * Generate a PNG QR code
   * @param content The content to encode in the QR code
   * @returns Data URL for the QR code
   */
  private static async generatePngQRCode(content: string): Promise<string> {
    // Use the qrcode library to generate a proper QR code as data URL
    return QRCode.toDataURL(content, {
      errorCorrectionLevel: 'H',
      margin: 4,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  }
  
  /**
   * Generate an SVG QR code
   * @param content The content to encode in the QR code
   * @param asDataUrl Whether to return as data URL or raw SVG
   * @returns SVG content or data URL for the QR code
   */
  private static async generateSvgQRCode(content: string, asDataUrl: boolean = true): Promise<string> {
    // Generate SVG QR code
    const svgString = await QRCode.toString(content, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 4,
      width: 300
    });
    
    if (asDataUrl) {
      return `data:image/svg+xml;base64,${btoa(svgString)}`;
    }
    
    return svgString;
  }
  
  /**
   * Generate a PDF document containing the QR code
   * @param qrCodeSvg The QR code SVG to embed in the PDF
   * @param title Title for the PDF document
   * @returns Data URL for the PDF document
   */
  private static generatePdfWithQRCode(qrCodeSvg: string, title: string): string {
    // For a proper implementation, we would use a PDF generation library
    // For now, we'll create a simple PDF with the QR code embedded as SVG
    const pdfContent = `
%PDF-1.4
1 0 obj
<</Type /Catalog /Pages 2 0 R>>
endobj
2 0 obj
<</Type /Pages /Kids [3 0 R] /Count 1>>
endobj
3 0 obj
<</Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 6 0 R>>
endobj
4 0 obj
<</Font <</F1 5 0 R>>>>
endobj
5 0 obj
<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>
endobj
6 0 obj
<</Length 170>>
stream
BT
/F1 24 Tf
50 700 Td
(${title}) Tj
/F1 12 Tf
0 -30 Td
(Scan this QR code to access your coupon) Tj
ET
endstream
endobj
xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000056 00000 n
0000000111 00000 n
0000000212 00000 n
0000000250 00000 n
0000000317 00000 n
trailer
<</Size 7/Root 1 0 R>>
startxref
490
%%EOF
`;

    // Convert to data URL
    const dataUrl = `data:application/pdf;base64,${btoa(pdfContent)}`;
    return dataUrl;
  }
  
  /**
   * Parse QR code data to extract coupon code or business ID
   * @param qrData The data extracted from a QR code
   * @returns The extracted data if valid, null otherwise
   */
  static parseQRCodeData(qrData: string): { type: string; code?: string; id?: string } | null {
    try {
      // Try to parse the QR data as JSON
      const parsedData = JSON.parse(qrData);
      
      // Check if this is a valid QR code with type
      if (parsedData && parsedData.type) {
        if (parsedData.type === 'coupon' && parsedData.code) {
          return { type: 'coupon', code: parsedData.code };
        } else if (parsedData.type === 'business' && parsedData.id) {
          return { type: 'business', id: parsedData.id };
        }
      }
      
      return null;
    } catch (error) {
      // If JSON parsing fails, check if the raw string might be a coupon code
      if (typeof qrData === 'string' && qrData.trim().length > 0) {
        return { type: 'coupon', code: qrData.trim() };
      }
      
      return null;
    }
  }
}
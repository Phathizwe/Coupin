import { Coupon } from '../types';

/**
 * Service for generating and managing QR codes for coupons
 */
export class QRCodeService {
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
      
      if (typeof data === 'string') {
        // If it's a string, it could be either a coupon code or serialized business data
        try {
          // Check if it's JSON (business data)
          const parsed = JSON.parse(data);
          qrContent = data;
        } catch (e) {
          // It's a simple coupon code
          qrContent = JSON.stringify({
            type: 'coupon',
            code: data
          });
        }
      } else {
        // It's a coupon object
        qrContent = JSON.stringify({
          type: 'coupon',
          code: data.code
        });
      }
      
      // Generate QR code based on requested format
      switch (format.toLowerCase()) {
        case 'svg':
          return this.generateSvgQRCode(qrContent);
        case 'pdf':
          return this.generatePdfQRCode(qrContent);
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
  private static generatePngQRCode(content: string): string {
    // This is a simplified implementation
    // In a real app, you would use a library like qrcode.js
    const svgDataUrl = this.generateSvgQRCode(content);
    
    // In a real implementation, you would convert SVG to PNG
    // For now, we'll just return the SVG as a placeholder
    return svgDataUrl;
  }
  
  /**
   * Generate an SVG QR code
   * @param content The content to encode in the QR code
   * @returns Data URL for the QR code
   */
  private static generateSvgQRCode(content: string): string {
    // Generate a simple QR code SVG
    // In a production environment, you would use a proper QR code library
    const svgSize = 300;
    const displayText = content.length > 20 ? content.substring(0, 20) + '...' : content;
    
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">
        <rect width="100%" height="100%" fill="white"/>
        <text x="50%" y="50%" font-family="Arial" font-size="14" text-anchor="middle" fill="black">
          ${displayText}
        </text>
        <rect x="30" y="30" width="240" height="240" fill="none" stroke="black" stroke-width="2"/>
        <rect x="60" y="60" width="180" height="180" fill="none" stroke="black" stroke-width="2"/>
        <rect x="90" y="90" width="120" height="120" fill="none" stroke="black" stroke-width="2"/>
      </svg>
    `;
    
    // Convert SVG to data URL
    const dataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;
    return dataUrl;
  }
  
  /**
   * Generate a PDF QR code
   * @param content The content to encode in the QR code
   * @returns Data URL for the QR code
   */
  private static generatePdfQRCode(content: string): string {
    // In a real implementation, you would generate a PDF
    // For now, we'll just return the SVG as a placeholder
    return this.generateSvgQRCode(content);
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
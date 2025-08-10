/**
 * Utility functions for image processing
 */

/**
 * Compresses an image file to reduce its size
 * @param file The original image file
 * @param maxSizeInMB Maximum size in MB (default: 0.5)
 * @returns A promise that resolves to a compressed File object
 */
export const compressImage = async (file: File, maxSizeInMB = 0.5): Promise<File> => {
  return new Promise((resolve, reject) => {
    // If the file is already small enough or is SVG (which we shouldn't compress), return it as is
    if (file.size <= maxSizeInMB * 1024 * 1024 || file.type === 'image/svg+xml') {
      resolve(file);
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Maintain aspect ratio while reducing size
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 100;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with reduced quality
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a new file from the blob
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, 'image/jpeg', 0.7); // Adjust quality as needed (0.7 = 70% quality)
      };
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

/**
 * Validates an image file for size and type
 * @param file The file to validate
 * @param maxSizeMB Maximum size in MB
 * @returns An object with validation result and error message
 */
export const validateImageFile = (file: File, maxSizeMB = 5): { valid: boolean; error?: string } => {
  // Validate file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `Logo file is too large. Please upload an image smaller than ${maxSizeMB}MB.`
    };
  }
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, SVG, or GIF).'
    };
  }
  
  return { valid: true };
};
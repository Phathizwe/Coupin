import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { compressImage, validateImageFile } from '../../utils/imageUtils';

interface LogoUploaderProps {
  currentLogoUrl: string;
  onLogoChange: (file: File, previewUrl: string) => void;
  disabled?: boolean;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ 
  currentLogoUrl, 
  onLogoChange,
  disabled = false 
}) => {
  const [processing, setProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate the file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid file');
        return;
      }
      
      try {
        setProcessing(true);
        
        // Compress the image if it's not SVG
        let fileToUpload = file;
        if (file.type !== 'image/svg+xml') {
          toast.loading('Optimizing image for upload...', { id: 'compressing' });
          fileToUpload = await compressImage(file);
          toast.dismiss('compressing');
        }
        
        // Preview the image
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            onLogoChange(fileToUpload, event.target.result as string);
          }
        };
        
        reader.onerror = () => {
          toast.error('Error reading file. Please try another image.');
        };
        
        reader.readAsDataURL(fileToUpload);
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Failed to process image. Please try another one.');
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Company Logo
      </label>
      <div className="flex items-center space-x-4">
        <div className="w-40 h-16 border border-gray-300 rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
          {currentLogoUrl ? (
            <img 
              src={currentLogoUrl} 
              alt="Company Logo Preview" 
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <span className="text-sm text-gray-400">No logo uploaded</span>
          )}
        </div>
        <div>
          <input
            type="file"
            id="logo-upload"
            accept="image/jpeg,image/png,image/svg+xml,image/gif"
            onChange={handleFileChange}
            className="hidden"
            disabled={processing || disabled}
          />
          <label 
            htmlFor="logo-upload"
            className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer inline-block ${
              (processing || disabled) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {processing ? 'Processing...' : 'Upload Logo'}
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Recommended size: 300x100px, PNG or SVG format (max 2MB)
          </p>
          <p className="text-xs text-gray-500">
            Images will be automatically optimized for best performance
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoUploader;
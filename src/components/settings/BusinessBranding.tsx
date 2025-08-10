import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { 
  BrandingSettings,
  getBrandingSettings,
  updateBrandingSettings
} from '../../services/businessSettingsService';
import LogoUploader from './LogoUploader';
import ColorPicker from './ColorPicker';

interface BusinessBrandingProps {
  onUpdate?: () => void; // Callback for when branding is updated
}

const BusinessBranding: React.FC<BusinessBrandingProps> = ({ onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branding, setBranding] = useState<BrandingSettings & { logoFile: File | null }>({
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    logoUrl: '',
    logoFile: null
  });
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchBrandingSettings = async () => {
      if (!user?.businessId) return;
      
      try {
        setLoading(true);
        setError(null);
        const brandingSettings = await getBrandingSettings(user.businessId);
        setBranding(prev => ({
          ...brandingSettings,
          logoFile: null
        }));
      } catch (error) {
        console.error('Error fetching branding settings:', error);
        setError('Failed to load branding settings. Please refresh the page.');
      } finally {
        setLoading(false);
      }
};

    fetchBrandingSettings();
  }, [user]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBranding(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (file: File, previewUrl: string) => {
    setBranding(prev => ({
      ...prev,
      logoFile: file,
      logoUrl: previewUrl
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.businessId) {
      toast.error('No business ID available. Please refresh the page.');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const toastId = toast.loading('Saving branding settings...');
      
      // Extract the data to send to Firestore
      const { logoFile, ...brandingData } = branding;
      
      await updateBrandingSettings(user.businessId, brandingData, logoFile || undefined);
      
      // Notify parent component that branding was updated
      if (onUpdate) {
        onUpdate();
      }
      
      toast.success('Branding updated successfully!', { id: toastId });
    } catch (error: any) {
      console.error('Error saving branding:', error);
      
      // Handle specific Firebase Storage errors
      if (error.code === 'storage/retry-limit-exceeded') {
        setError('Upload timed out. Please try again with a smaller image or check your internet connection.');
        toast.error('Upload timed out. Please try again with a smaller image.');
      } else {
        setError(error.message || 'Failed to update branding. Please try again.');
        toast.error('Failed to update branding. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
            <div>
      <h2 className="text-xl font-medium text-gray-900 mb-6">Branding</h2>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Business Logo</h3>
          <p className="text-sm text-gray-500 mb-4">
            Your logo will be displayed on your business page and on coupons.
              </p>
          <LogoUploader 
            currentLogoUrl={branding.logoUrl}
            onLogoChange={handleLogoChange}
            disabled={saving}
          />
        </div>
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Brand Colors</h3>
          <p className="text-sm text-gray-500 mb-4">
            These colors will be used throughout your customer-facing pages.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ColorPicker
              label="Primary Brand Color"
              name="primaryColor"
              value={branding.primaryColor}
              onChange={handleColorChange}
              description="Used for headings, buttons, and highlights"
            />
            
            <ColorPicker
              label="Secondary Brand Color"
              name="secondaryColor"
              value={branding.secondaryColor}
              onChange={handleColorChange}
              description="Used for accents and secondary elements"
            />
          </div>
              </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              saving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Saving...' : 'Save Branding'}
          </button>
      </div>
      </form>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-start">
          <div className="mr-3 text-amber-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> The About section in the preview uses your business description from the Business Profile tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessBranding;
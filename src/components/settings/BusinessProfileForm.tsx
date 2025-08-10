import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  BusinessProfile, 
  getBusinessProfile, 
  updateBusinessProfile 
} from '../../services/businessSettingsService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface BusinessProfileFormProps {
  onUpdate?: () => void; // Callback for when profile is updated
}

// Industry options for the dropdown
const industryOptions = [
  { value: '', label: 'Select an industry' },
  { value: 'Automotive', label: 'Automotive' },
  { value: 'Beauty & Personal Care', label: 'Beauty & Personal Care' },
  { value: 'Clothing & Fashion', label: 'Clothing & Fashion' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Food & Beverage', label: 'Food & Beverage' },
  { value: 'Health & Wellness', label: 'Health & Wellness' },
  { value: 'Home & Garden', label: 'Home & Garden' },
  { value: 'Professional Services', label: 'Professional Services' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Travel & Hospitality', label: 'Travel & Hospitality' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Education', label: 'Education' },
  { value: 'Financial Services', label: 'Financial Services' },
  { value: 'Other', label: 'Other' }
];

const BusinessProfileForm: React.FC<BusinessProfileFormProps> = ({ onUpdate }) => {
  const { user, businessProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile>({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    industry: ''
  });

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!user?.businessId) return;
      
      try {
        setLoading(true);
        
        // Try to get profile from the settings collection
        let businessProfileData = await getBusinessProfile(user.businessId);
        
        // If we have a businessProfile from auth context, use that to fill in missing data
        if (businessProfile) {
          businessProfileData = {
            ...businessProfileData,
            name: businessProfileData.name || businessProfile.businessName || '',
            email: businessProfileData.email || user.email || '',
            industry: businessProfileData.industry || businessProfile.industry || '',
          };
        } else if (user.email) {
          // At minimum, populate the email from the authenticated user
          businessProfileData.email = user.email;
        }
        
        setProfile(businessProfileData);
      } catch (error) {
        console.error('Error fetching business profile:', error);
        
        // If there's an error, still try to populate with what we have
        if (businessProfile || user.email) {
          setProfile(prev => ({
            ...prev,
            name: businessProfile?.businessName || prev.name,
            email: user.email || prev.email,
            industry: businessProfile?.industry || prev.industry,
          }));
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinessProfile();
  }, [user, businessProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.businessId) {
      console.error('No business ID available');
      return;
    }
    
    try {
      setSaving(true);
      await updateBusinessProfile(user.businessId, profile);
      
      // Notify parent component that profile was updated
      if (onUpdate) {
        onUpdate();
      }
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading profile information...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name
          </label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        {/* Added Industry dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Industry
          </label>
          <select
            name="industry"
            value={profile.industry}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            required
          >
            {industryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            name="website"
            value={profile.website}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="https://example.com"
          />
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Address
          </label>
          <input
            type="text"
            name="address"
            value={profile.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Description
          </label>
          <textarea
            name="description"
            value={profile.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="mt-6">
        <button
          type="submit"
          disabled={saving}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default BusinessProfileForm;
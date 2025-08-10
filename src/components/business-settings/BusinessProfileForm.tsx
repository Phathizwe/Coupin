import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import FormField from './FormField';
import SaveButton from './SaveButton';
import styles from './styles/form.module.css';
import { updateBusinessProfile, BusinessProfile } from '../../services/businessSettingsService';

interface BusinessProfileFormProps {
  onUpdate: () => void;
  onProfileCompletion?: (percentage: number) => void;
  isSimpleView?: boolean; // Added isSimpleView prop
}

const BusinessProfileForm: React.FC<BusinessProfileFormProps> = ({
  onUpdate,
  onProfileCompletion,
  isSimpleView
}) => {
  const { user, businessProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<BusinessProfile>>({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    industry: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Industry options with icons
  const industryOptions = [
    { value: 'retail', label: 'Retail', icon: '🛍️' },
    { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
    { value: 'beauty', label: 'Beauty & Wellness', icon: '💆' },
    { value: 'health', label: 'Health & Fitness', icon: '🏋️' },
    { value: 'education', label: 'Education', icon: '🎓' },
    { value: 'technology', label: 'Technology', icon: '💻' },
    { value: 'professional', label: 'Professional Services', icon: '👔' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎭' },
    { value: 'travel', label: 'Travel & Hospitality', icon: '✈️' },
    { value: 'other', label: 'Other', icon: '📦' }
  ];

  // Load business profile data
  useEffect(() => {
    if (businessProfile) {
      setFormData({
        name: businessProfile.businessName || '',
        description: businessProfile.description || '',
        email: user?.email || '',
        phone: businessProfile.phone || '',
        address: businessProfile.address || '',
        website: businessProfile.website || '',
        industry: businessProfile.industry || ''
      });
    }
  }, [businessProfile, user]);

  // Calculate completion percentage
  useEffect(() => {
    calculateCompletionPercentage();
  }, [formData]);

  const calculateCompletionPercentage = () => {
    // Required fields
    const requiredFields: (keyof typeof formData)[] = ['name', 'industry', 'email'];
    // Optional fields that contribute to completion
    const optionalFields: (keyof typeof formData)[] = ['description', 'phone', 'address', 'website'];

    // Count required fields that are filled
    const requiredFilled = requiredFields.filter(field =>
      formData[field] && formData[field].toString().trim() !== ''
    ).length;

    // Count optional fields that are filled
    const optionalFilled = optionalFields.filter(field =>
      formData[field] && formData[field].toString().trim() !== ''
    ).length;

    // Calculate percentage - required fields have more weight
    const requiredWeight = 0.7; // 70% of total
    const optionalWeight = 0.3; // 30% of total

    const requiredPercentage = (requiredFilled / requiredFields.length) * requiredWeight * 100;
    const optionalPercentage = (optionalFilled / optionalFields.length) * optionalWeight * 100;

    const totalPercentage = Math.round(requiredPercentage + optionalPercentage);

    setCompletionPercentage(totalPercentage);

    // Notify parent component
    if (onProfileCompletion) {
      onProfileCompletion(totalPercentage);
    }
  };

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.businessId) {
      console.error('No business ID found');
      return;
    }

    setIsSaving(true);

    try {
      await updateBusinessProfile(user.businessId, {
        name: formData.name || '',
        description: formData.description || '',
        email: formData.email || '',
        phone: formData.phone || '',
        address: formData.address || '',
        website: formData.website || '',
        industry: formData.industry || ''
      });

      setSaveSuccess(true);
      onUpdate();

      // Reset success state after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating business profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Business Essentials</h3>
        <div className={styles.formGrid}>
          <FormField
            label="Business Name"
            type="text"
            value={formData.name || ''}
            onChange={handleChange('name')}
            required
            helperText="Your official business name"
            customerImpact="This appears on all receipts and customer communications"
          />

          <FormField
            label="Industry"
            type="select"
            value={formData.industry || ''}
            onChange={handleChange('industry')}
            options={industryOptions}
            required
            helperText="Select the category that best describes your business"
            customerImpact="Helps us suggest better features for your business type"
          />
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Contact Information</h3>
        <div className={styles.formGrid}>
          <FormField
            label="Email Address"
            type="email"
            value={formData.email || ''}
            onChange={handleChange('email')}
            required
            validation={[
              {
                test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                message: 'Please enter a valid email address'
              }
            ]}
            helperText="Your business contact email"
            customerImpact="Customers can reach you through this email"
          />

          <FormField
            label="Phone Number"
            type="tel"
            value={formData.phone || ''}
            onChange={handleChange('phone')}
            helperText="Include country code for international customers"
            customerImpact="For urgent customer support inquiries"
          />
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Online Presence</h3>
        <div className={styles.formGrid}>
          <FormField
            label="Website"
            type="text"
            value={formData.website || ''}
            onChange={handleChange('website')}
            helperText="Your business website URL"
            customerImpact="Customers can learn more about your business here"
            validation={[
              {
                test: (value) => !value || /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(value),
                message: 'Please enter a valid website URL'
              }
            ]}
          />

          <FormField
            label="Business Address"
            type="text"
            value={formData.address || ''}
            onChange={handleChange('address')}
            helperText="Your physical business location"
            customerImpact="Helps customers find your physical location"
          />
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Your Story</h3>
        <FormField
          label="Business Description"
          type="textarea"
          value={formData.description || ''}
          onChange={handleChange('description')}
          helperText="Tell customers about your business"
          maxLength={500}
          customerImpact="Tell customers what makes your business special"
        />
      </div>

      <div className={styles.formActions}>
        <SaveButton
          isLoading={isSaving}
          isSuccess={saveSuccess}
          completionPercentage={completionPercentage}
        />
      </div>
    </form>
  );
};

export default BusinessProfileForm;
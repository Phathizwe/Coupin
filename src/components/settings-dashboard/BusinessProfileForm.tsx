import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import FormField from './FormField';
import CollapsibleForm from './CollapsibleForm';
import styles from '../../styles/settings-dashboard/forms.module.css';

const BusinessProfileForm: React.FC = () => {
  const { businessProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    businessName: businessProfile?.businessName || '',
    industry: businessProfile?.industry || '',
    description: businessProfile?.description || '',
    email: businessProfile?.email || '',
    phone: businessProfile?.phone || '',
    website: businessProfile?.website || '',
    address: businessProfile?.address || ''
  });
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Industry options
  const industryOptions = [
    { value: 'retail', label: '🛍️ Retail' },
    { value: 'restaurant', label: '🍽️ Restaurant' },
    { value: 'beauty', label: '💆 Beauty & Wellness' },
    { value: 'health', label: '🏋️ Health & Fitness' },
    { value: 'education', label: '🎓 Education' },
    { value: 'technology', label: '💻 Technology' },
    { value: 'professional', label: '👔 Professional Services' },
    { value: 'entertainment', label: '🎭 Entertainment' },
    { value: 'travel', label: '✈️ Travel & Hospitality' },
    { value: 'other', label: '📦 Other' }
  ];
  
  return (
    <div className={styles.formContainer}>
      <CollapsibleForm 
        title="Basic Information" 
        icon="📋" 
        defaultExpanded={true}
      >
        <FormField
          id="businessName"
          label="Business Name"
          value={formData.businessName}
          onChange={(value) => handleChange('businessName', value)}
          placeholder="Enter your business name"
          required
        />
        
        <FormField
          id="industry"
          label="Industry"
          type="select"
          value={formData.industry}
          onChange={(value) => handleChange('industry', value)}
          placeholder="Select your industry"
          options={industryOptions}
          required
        />
        
        <FormField
          id="description"
          label="Business Description"
          type="textarea"
          value={formData.description}
          onChange={(value) => handleChange('description', value)}
          placeholder="Describe what your business offers..."
          helperText="A clear description helps customers understand your business better"
          maxLength={200}
        />
      </CollapsibleForm>
      
      <CollapsibleForm 
        title="Contact Information" 
        icon="📞"
      >
        <FormField
          id="email"
          label="Business Email"
          type="email"
          value={formData.email}
          onChange={(value) => handleChange('email', value)}
          placeholder="contact@yourbusiness.com"
          required
        />
        
        <FormField
          id="phone"
          label="Business Phone"
          type="tel"
          value={formData.phone}
          onChange={(value) => handleChange('phone', value)}
          placeholder="+1 (555) 123-4567"
        />
        
        <FormField
          id="website"
          label="Website"
          value={formData.website}
          onChange={(value) => handleChange('website', value)}
          placeholder="https://yourbusiness.com"
          helperText="Include https:// at the beginning"
        />
        
        <FormField
          id="address"
          label="Business Address"
          value={formData.address}
          onChange={(value) => handleChange('address', value)}
          placeholder="123 Main St, City, State, ZIP"
        />
      </CollapsibleForm>
    </div>
  );
};

export default BusinessProfileForm;
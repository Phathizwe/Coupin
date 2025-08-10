import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import FormField from '../business-settings/FormField';
import SaveButton from '../business-settings/SaveButton';
import styles from '../business-settings/styles/form.module.css';
import { updateBusinessProfile, BusinessProfile } from '../../services/businessSettingsService';

interface RegionalSettingsProps {
  onUpdate?: () => void;
}

const RegionalSettings: React.FC<RegionalSettingsProps> = ({ onUpdate }) => {
  const { user, businessProfile } = useAuth();
  const [formData, setFormData] = useState({
    currency: 'ZAR',
    timezone: 'Africa/Johannesburg',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-ZA',
    language: 'en'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Currency options
  const currencyOptions = [
    { value: 'USD', label: 'US Dollar ($)', icon: '💵' },
    { value: 'EUR', label: 'Euro (€)', icon: '💶' },
    { value: 'GBP', label: 'British Pound (£)', icon: '💷' },
    { value: 'JPY', label: 'Japanese Yen (¥)', icon: '💴' },
    { value: 'CAD', label: 'Canadian Dollar (C$)', icon: '🍁' },
    { value: 'AUD', label: 'Australian Dollar (A$)', icon: '🇦🇺' },
    { value: 'ZAR', label: 'South African Rand (R)', icon: '🇿🇦' },
    { value: 'INR', label: 'Indian Rupee (₹)', icon: '🇮🇳' },
    { value: 'CNY', label: 'Chinese Yuan (¥)', icon: '🇨🇳' },
    { value: 'BRL', label: 'Brazilian Real (R$)', icon: '🇧🇷' }
  ];

  // Timezone options (common ones)
  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)', icon: '🌍' },
    { value: 'America/New_York', label: 'Eastern Time (ET)', icon: '🇺🇸' },
    { value: 'America/Chicago', label: 'Central Time (CT)', icon: '🇺🇸' },
    { value: 'America/Denver', label: 'Mountain Time (MT)', icon: '🇺🇸' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', icon: '🇺🇸' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)', icon: '🇬🇧' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)', icon: '🇪🇺' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', icon: '🇯🇵' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)', icon: '🇨🇳' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)', icon: '🇦🇺' },
    { value: 'Africa/Johannesburg', label: 'South Africa Standard Time (SAST)', icon: '🇿🇦' }
  ];

  // Date format options
  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US Format)', icon: '📅' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (European Format)', icon: '📅' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO Format)', icon: '📅' },
    { value: 'DD MMM YYYY', label: 'DD MMM YYYY (e.g., 15 Jan 2024)', icon: '📅' }
  ];

  // Number format options
  const numberFormatOptions = [
    { value: 'en-US', label: 'US Format (1,234.56)', icon: '🔢' },
    { value: 'en-GB', label: 'UK Format (1,234.56)', icon: '🔢' },
    { value: 'de-DE', label: 'German Format (1.234,56)', icon: '🔢' },
    { value: 'fr-FR', label: 'French Format (1 234,56)', icon: '🔢' },
    { value: 'es-ES', label: 'Spanish Format (1.234,56)', icon: '🔢' }
  ];

  // Language options
  const languageOptions = [
    { value: 'en', label: 'English', icon: '🇺🇸' },
    { value: 'es', label: 'Español', icon: '🇪🇸' },
    { value: 'fr', label: 'Français', icon: '🇫🇷' },
    { value: 'de', label: 'Deutsch', icon: '🇩🇪' },
    { value: 'it', label: 'Italiano', icon: '🇮🇹' },
    { value: 'pt', label: 'Português', icon: '🇵🇹' },
    { value: 'zh', label: '中文', icon: '🇨🇳' },
    { value: 'ja', label: '日本語', icon: '🇯🇵' },
    { value: 'ko', label: '한국어', icon: '🇰🇷' },
    { value: 'ar', label: 'العربية', icon: '🇸🇦' }
  ];

  // Load existing regional settings
  useEffect(() => {
    if (businessProfile?.regionalSettings) {
      setFormData({
        currency: businessProfile.regionalSettings.currency || 'USD',
        timezone: businessProfile.regionalSettings.timezone || 'UTC',
        dateFormat: businessProfile.regionalSettings.dateFormat || 'MM/DD/YYYY',
        numberFormat: businessProfile.regionalSettings.numberFormat || 'en-US',
        language: businessProfile.regionalSettings.language || 'en'
      });
    }
  }, [businessProfile]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.businessId) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updatedProfile: Partial<BusinessProfile> = {
        regionalSettings: formData
      };

      await updateBusinessProfile(user.businessId, updatedProfile);
      setSaveSuccess(true);
      onUpdate?.();

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating regional settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.form}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Currency & Formatting</h3>
          <div className={styles.formGrid}>
            <FormField
              label="Currency"
              type="select"
              value={formData.currency}
              onChange={(value) => handleChange('currency', value)}
              options={currencyOptions}
              helperText="Choose your primary business currency for pricing and transactions"
              customerImpact="Customers will see prices in this currency"
            />

            <FormField
              label="Number Format"
              type="select"
              value={formData.numberFormat}
              onChange={(value) => handleChange('numberFormat', value)}
              options={numberFormatOptions}
              helperText="How numbers and prices are displayed"
              customerImpact="Affects how prices and quantities appear to customers"
            />
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Date & Time</h3>
          <div className={styles.formGrid}>
            <FormField
              label="Timezone"
              type="select"
              value={formData.timezone}
              onChange={(value) => handleChange('timezone', value)}
              options={timezoneOptions}
              helperText="Your business timezone for scheduling and timestamps"
              customerImpact="Affects coupon validity times and business hours display"
            />

            <FormField
              label="Date Format"
              type="select"
              value={formData.dateFormat}
              onChange={(value) => handleChange('dateFormat', value)}
              options={dateFormatOptions}
              helperText="How dates are displayed throughout the system"
              customerImpact="Customers will see dates in this format"
            />
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Language & Localization</h3>
          <div className={styles.formGrid}>
            <FormField
              label="Primary Language"
              type="select"
              value={formData.language}
              onChange={(value) => handleChange('language', value)}
              options={languageOptions}
              helperText="Default language for your business communications"
              customerImpact="Affects system messages and default text language"
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <SaveButton
            isLoading={isSaving}
            isSuccess={saveSuccess}
            completionPercentage={100}
          />
        </div>
      </form>
    </div>
  );
};

export default RegionalSettings;
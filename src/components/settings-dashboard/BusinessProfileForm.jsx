import React, { useState } from 'react';
import styles from '../../styles/settings-dashboard/forms.module.css';

const BusinessProfileForm = () => {
  const [formData, setFormData] = useState({
    businessName: 'TYCA Shop',
    industry: 'Retail',
    email: 'info@ss.co.za'
  });
  
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <div className={styles.formContainer}>
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Business Essentials</h2>
        
        <div className={styles.formField}>
          <label className={styles.label}>
            Business Name <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={formData.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
          />
          <p className={styles.helperText}>Your official business name</p>
        </div>
        
        <div className={styles.formField}>
          <label className={styles.label}>
            Industry <span className={styles.required}>*</span>
          </label>
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
            >
              <option value="Retail">🛍️ Retail</option>
              <option value="Restaurant">🍽️ Restaurant</option>
              <option value="Beauty">💆 Beauty & Wellness</option>
              <option value="Health">🏋️ Health & Fitness</option>
            </select>
          </div>
          <p className={styles.helperText}>Select the category that best describes your business</p>
        </div>
      </div>
      
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Contact Information</h2>
        
        <div className={styles.formField}>
          <label className={styles.label}>
            Email Address <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            className={styles.input}
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>
      </div>
      
      <div className={styles.formActions}>
        <button className={styles.saveButton}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default BusinessProfileForm;
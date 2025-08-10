import React, { useState } from 'react';
import styles from '../styles/settings-dashboard/forms.module.css';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  helperText?: string;
  maxLength?: number;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  options = [],
  helperText,
  maxLength,
  error
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  
  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            className={`${styles.input} ${styles.textarea} ${isFocused ? styles.focused : ''}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            onFocus={handleFocus}
            onBlur={handleBlur}
            maxLength={maxLength}
          />
        );
      case 'select':
        return (
          <div className={`${styles.selectWrapper} ${isFocused ? styles.focused : ''}`}>
            <select
              id={id}
              className={styles.select}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              required={required}
              onFocus={handleFocus}
              onBlur={handleBlur}
            >
              <option value="" disabled>{placeholder}</option>
              {options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      default:
        return (
          <input
            id={id}
            type={type}
            className={`${styles.input} ${isFocused ? styles.focused : ''}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            onFocus={handleFocus}
            onBlur={handleBlur}
            maxLength={maxLength}
          />
        );
    }
  };
  
  return (
    <div className={styles.formField}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      
      {renderField()}
      
      {helperText && (
        <p className={styles.helperText}>{helperText}</p>
      )}
      
      {maxLength && (
        <div className={styles.charCounter}>
          {value.length}/{maxLength}
        </div>
      )}
      
      {error && (
        <div className={styles.fieldError}>{error}</div>
      )}
    </div>
  );
};

export default FormField;
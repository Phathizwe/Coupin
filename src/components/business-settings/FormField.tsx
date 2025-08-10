import React, { useState, useEffect, useRef } from 'react';
import styles from './styles/form.module.css';

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

interface FormFieldProps {
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: { value: string; label: string; icon?: string }[];
  placeholder?: string;
  maxLength?: number;
  customerImpact?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  type,
  value,
  onChange,
  helperText,
  required = false,
  validation = [],
  options = [],
  placeholder = '',
  maxLength,
  customerImpact
}) => {
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationPassed, setValidationPassed] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    // Update character count for textarea
    if (type === 'textarea') {
      setCharCount(value.length);
    }
    
    // Validate on value change, but only if already touched
    if (touched) {
      validateField(value);
    }
  }, [value]);

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
    setTouched(true);
    validateField(value);
  };

  const validateField = (fieldValue: string) => {
    // Check required
    if (required && !fieldValue.trim()) {
      setError(`${label} is required`);
      setValidationPassed(false);
      return;
    }

    // Check validation rules
    for (const rule of validation) {
      if (!rule.test(fieldValue)) {
        setError(rule.message);
        setValidationPassed(false);
        return;
      }
    }

    // All validations passed
    setError(null);
    setValidationPassed(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <div className={styles.textareaWrapper}>
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={`${styles.textarea} ${focused ? styles.focused : ''} ${error ? styles.error : ''} ${validationPassed && touched ? styles.valid : ''}`}
              placeholder={placeholder}
              maxLength={maxLength}
              required={required}
            />
            {maxLength && (
              <div className={styles.charCount}>
                <span className={charCount > (maxLength * 0.8) ? styles.charCountWarning : ''}>
                  {charCount}
                </span>/{maxLength}
              </div>
            )}
          </div>
        );
      case 'select':
        return (
          <div className={styles.selectWrapper}>
            <select
              ref={inputRef as React.RefObject<HTMLSelectElement>}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={`${styles.select} ${focused ? styles.focused : ''} ${error ? styles.error : ''} ${validationPassed && touched ? styles.valid : ''}`}
              required={required}
            >
              <option value="" disabled>
                Select {label}
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon && `${option.icon} `}{option.label}
                </option>
              ))}
            </select>
            <div className={styles.selectArrow}>▼</div>
          </div>
        );
      default:
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`${styles.input} ${focused ? styles.focused : ''} ${error ? styles.error : ''} ${validationPassed && touched ? styles.valid : ''}`}
            placeholder={placeholder}
            required={required}
          />
        );
    }
  };

  return (
    <div className={`${styles.formField} ${focused ? styles.fieldFocused : ''}`}>
      <div className={styles.labelContainer}>
        <label className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
        {validationPassed && touched && (
          <span className={styles.validIcon}>✓</span>
        )}
      </div>
      
      {renderField()}
      
      <div className={styles.fieldFooter}>
        {error ? (
          <p className={styles.errorText}>{error}</p>
        ) : (
          <>
            {helperText && <p className={styles.helperText}>{helperText}</p>}
            {customerImpact && focused && (
              <div className={`${styles.customerImpact} ${styles.fadeIn}`}>
                <span className={styles.impactIcon}>👁️</span> {customerImpact}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FormField;
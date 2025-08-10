import React from 'react';
import styles from '../../styles/settings-dashboard/forms.module.css';

interface SaveButtonProps {
  onClick?: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  text?: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  onClick,
  isLoading = false,
  isDisabled = false,
  text = 'Save Changes'
}) => {
  return (
    <button
      className={styles.saveButton}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      type="submit"
    >
      {isLoading ? 'Saving...' : text}
    </button>
  );
};

export default SaveButton;
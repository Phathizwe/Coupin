import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  SecuritySettings,
  getSecuritySettings,
  updateSecuritySettings
} from '../../services/businessSettingsService';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth as firebaseAuth } from '../../config/firebase';

const AccountSecurity: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchSecuritySettings = async () => {
      if (!user?.businessId) return;
      
      try {
        setLoading(true);
        const settings = await getSecuritySettings(user.businessId);
        setSecuritySettings(settings);
      } catch (error) {
        console.error('Error fetching security settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSecuritySettings();
  }, [user]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setSecuritySettings(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setSecuritySettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any previous error when user starts typing
    if (passwordError) setPasswordError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.businessId) {
      console.error('No business ID available');
      return;
    }

    // Check if we have a current Firebase user
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      console.error('No Firebase user available');
      return;
    }
    
    try {
      setSaving(true);
      
      // Handle password change if new password is provided
      if (passwordData.newPassword) {
        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          setPasswordError('New passwords do not match');
          setSaving(false);
          return;
        }
        
        // Validate password strength
        if (passwordData.newPassword.length < 8) {
          setPasswordError('Password must be at least 8 characters long');
          setSaving(false);
          return;
        }
        
        try {
          // Re-authenticate user before changing password
          const credential = EmailAuthProvider.credential(
            currentUser.email || '', 
            passwordData.currentPassword
          );
          
          await reauthenticateWithCredential(currentUser, credential);
          
          // Update password
          await updatePassword(currentUser, passwordData.newPassword);
          
          // Clear password fields after successful update
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        } catch (error: any) {
          if (error.code === 'auth/wrong-password') {
            setPasswordError('Current password is incorrect');
          } else {
            setPasswordError('Error updating password: ' + error.message);
          }
          setSaving(false);
          return;
        }
      }
      
      // Update security settings
      await updateSecuritySettings(user.businessId, securitySettings);
      alert('Security settings updated successfully!');
    } catch (error) {
      console.error('Error saving security settings:', error);
      alert('Failed to update security settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading security settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Change Password</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters with a mix of letters, numbers, and symbols
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {passwordError && (
            <div className="text-red-500 text-sm">{passwordError}</div>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Two-Factor Authentication</h3>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="twoFactorEnabled"
            name="twoFactorEnabled"
            checked={securitySettings.twoFactorEnabled}
            onChange={handleSettingsChange}
            className="h-4 w-4 text-blue-600 mr-2"
          />
          <label htmlFor="twoFactorEnabled" className="text-sm text-gray-700">
            Enable two-factor authentication (Recommended)
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1 ml-6">
          Adds an extra layer of security to your account by requiring a verification code
        </p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Session Settings</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Session Timeout
          </label>
          <select
            name="sessionTimeout"
            value={securitySettings.sessionTimeout}
            onChange={handleSettingsChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="240">4 hours</option>
            <option value="480">8 hours</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Automatically log out after period of inactivity
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          type="submit"
          disabled={saving}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {saving ? 'Saving...' : 'Save Security Settings'}
        </button>
      </div>
    </form>
  );
};

export default AccountSecurity;
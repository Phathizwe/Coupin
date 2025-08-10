import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  NotificationPreferences,
  getNotificationPreferences,
  updateNotificationPreferences
} from '../../services/businessSettingsService';

const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      newOrders: true,
      orderUpdates: true,
      marketing: false,
      systemUpdates: true
    },
    push: {
      newOrders: true,
      orderUpdates: true,
      marketing: false,
      systemUpdates: false
    },
    sms: {
      newOrders: false,
      orderUpdates: false,
      marketing: false
    }
  });

  useEffect(() => {
    const fetchNotificationPreferences = async () => {
      if (!user?.businessId) return;
      
      try {
        setLoading(true);
        const notificationPrefs = await getNotificationPreferences(user.businessId);
        setPreferences(notificationPrefs);
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotificationPreferences();
  }, [user]);

  const handleToggle = (channel: keyof NotificationPreferences, type: string) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: !prev[channel][type as keyof typeof prev[typeof channel]]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.businessId) {
      console.error('No business ID available');
      return;
    }
    
    try {
      setSaving(true);
      await updateNotificationPreferences(user.businessId, preferences);
      alert('Notification preferences updated successfully!');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      alert('Failed to update notification preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading notification preferences...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 border-b">Notification Type</th>
              <th className="text-center p-3 border-b">Email</th>
              <th className="text-center p-3 border-b">Push</th>
              <th className="text-center p-3 border-b">SMS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border-b">
                <div className="font-medium">New Orders</div>
                <div className="text-sm text-gray-500">Receive alerts for new orders</div>
              </td>
              <td className="text-center p-3 border-b">
                <input 
                  type="checkbox" 
                  checked={preferences.email.newOrders}
                  onChange={() => handleToggle('email', 'newOrders')}
                  className="h-4 w-4 text-blue-600"
                />
              </td>
              <td className="text-center p-3 border-b">
                <input 
                  type="checkbox" 
                  checked={preferences.push.newOrders}
                  onChange={() => handleToggle('push', 'newOrders')}
                  className="h-4 w-4 text-blue-600"
                />
              </td>
              <td className="text-center p-3 border-b">
                <input 
                  type="checkbox" 
                  checked={preferences.sms.newOrders}
                  onChange={() => handleToggle('sms', 'newOrders')}
                  className="h-4 w-4 text-blue-600"
                />
              </td>
            </tr>
            
            <tr>
              <td className="p-3 border-b">
                <div className="font-medium">Order Updates</div>
                <div className="text-sm text-gray-500">Status changes and fulfillment updates</div>
              </td>
              <td className="text-center p-3 border-b">
                <input 
                  type="checkbox" 
                  checked={preferences.email.orderUpdates}
                  onChange={() => handleToggle('email', 'orderUpdates')}
                  className="h-4 w-4 text-blue-600"
                />
              </td>
              <td className="text-center p-3 border-b">
                <input 
                  type="checkbox" 
                  checked={preferences.push.orderUpdates}
                  onChange={() => handleToggle('push', 'orderUpdates')}
                  className="h-4 w-4 text-blue-600"
                />
              </td>
              <td className="text-center p-3 border-b">
                <input 
                  type="checkbox" 
                  checked={preferences.sms.orderUpdates}
                  onChange={() => handleToggle('sms', 'orderUpdates')}
                  className="h-4 w-4 text-blue-600"
                />
              </td>
            </tr>
            
            <tr>
              <td className="p-3 border-b">
                <div className="font-medium">Marketing</div>
                <div className="text-sm text-gray-500">Promotions, news, and special offers</div>
              </td>
              <td className="text-center p-3 border-b">
                <input 
                  type="checkbox" 
                  checked={preferences.email.marketing}
                  onChange={() => handleToggle('email', 'marketing')}
                  className="h-4 w-4 text-blue-600"
                />
              </td>
              <td className="text-center p-3 border-b">
                <input 
                  type="checkbox" 
                  checked={preferences.push.marketing}
                  onChange={() => handleToggle('push', 'marketing')}
                  className="h-4 w-4 text-blue-600"
                />
              </td>
              <td className="text-center p-3 border-b">
                <input 
                  type="checkbox" 
                  checked={preferences.sms.marketing}
                  onChange={() => handleToggle('sms', 'marketing')}
                  className="h-4 w-4 text-blue-600"
                />
              </td>
            </tr>
            
            <tr>
              <td className="p-3 border-b">
                <div className="font-medium">System Updates</div>
                <div className="text-sm text-gray-500">Platform updates and maintenance notices</div>
              </td>
              <td className="text-center p-3 border-b">
                <input 
                  type="checkbox" 
                  checked={preferences.email.systemUpdates}
                  onChange={() => handleToggle('email', 'systemUpdates')}
                  className="h-4 w-4 text-blue-600"
                />
              </td>
              <td className="text-center p-3 border-b">
                <input 
                  type="checkbox" 
                  checked={preferences.push.systemUpdates}
                  onChange={() => handleToggle('push', 'systemUpdates')}
                  className="h-4 w-4 text-blue-600"
                />
              </td>
              <td className="text-center p-3 border-b">
                <span className="text-gray-400">N/A</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-6">
        <button
          type="submit"
          disabled={saving}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  );
};

export default NotificationSettings;
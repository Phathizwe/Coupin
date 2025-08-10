import React, { useState } from 'react';
import { connectWhatsApp } from '../../utils/whatsappService';
import { connectEmail } from '../../utils/emailService';
import { useAuth } from '../../hooks/useAuth';
import { CommunicationTemplate } from '../../types';

interface Channel {
  id: string;
  type: 'email' | 'sms' | 'whatsapp';
  isConfigured: boolean;
  settings: Record<string, any>;
}

interface ChannelCardProps {
  channel: Channel;
  templates: CommunicationTemplate[];
  onChannelStatusChange?: (channelId: string, isConfigured: boolean) => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  templates,
  onChannelStatusChange
}) => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  // Configure channel display properties based on type
  const getChannelInfo = (type: string) => {
    switch (type) {
      case 'email':
        return {
          name: 'Email',
          description: channel.isConfigured
            ? 'Email service is configured and ready to use'
            : 'Connect your email service to send campaigns',
          iconColor: 'text-blue-500',
          iconPath: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
        };
      case 'sms':
        return {
          name: 'SMS',
          description: channel.isConfigured
            ? 'SMS service is configured and ready to use'
            : 'Connect your SMS provider to send text messages',
          iconColor: 'text-green-500',
          iconPath: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
        };
      case 'whatsapp':
        return {
          name: 'WhatsApp',
          description: channel.isConfigured
            ? 'WhatsApp service is configured and ready to use'
            : 'Connect WhatsApp to send messages to your customers',
          iconColor: 'text-green-600',
          iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
        };
      default:
        return {
          name: 'Unknown Channel',
          description: 'Channel type not recognized',
          iconColor: 'text-gray-500',
          iconPath: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
    }
  };

  const { name, description, iconColor, iconPath } = getChannelInfo(channel.type);

  const handleConnect = async () => {
    if (!user?.businessId) {
      console.error('No business ID found');
      return;
    }

    setIsConnecting(true);

    try {
      let success = false;

      // Handle different channel types
      switch (channel.type) {
        case 'whatsapp':
          success = await connectWhatsApp(user.businessId, channel.id, templates);
          break;
        case 'email':
          success = await connectEmail(user.businessId, channel.id, templates);
          break;
        case 'sms':
          // SMS implementation would go here
          console.log('SMS connection not yet implemented');
          break;
        default:
          console.error(`Unknown channel type: ${channel.type}`);
      }

      // Update channel status if connection was successful
      if (success && onChannelStatusChange) {
        onChannelStatusChange(channel.id, true);
      }
    } catch (error) {
      console.error(`Error connecting ${channel.type}:`, error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Determine button state
  const getButtonProps = () => {
    if (isConnecting) {
      return {
        className: 'bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm cursor-wait',
        disabled: true,
        text: 'Connecting...'
      };
    }

    if (channel.isConfigured) {
      return {
        className: 'bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300',
        disabled: false,
        text: 'Configure'
      };
    }

    return {
      className: 'bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700',
      disabled: false,
      text: 'Connect'
    };
  };

  const buttonProps = getButtonProps();

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <svg className={`h-8 w-8 ${iconColor} mr-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath} />
          </svg>
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <button
          className={buttonProps.className}
          disabled={buttonProps.disabled}
          onClick={handleConnect}
        >
          {buttonProps.text}
        </button>
      </div>
      
      {/* Status indicator for configured channels */}
      {channel.isConfigured && (
        <div className="mt-2 flex items-center">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          <span className="text-xs text-green-600">Connected</span>
        </div>
      )}
    </div>
  );
};

export default ChannelCard;
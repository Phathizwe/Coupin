import React, { useState } from 'react';
import { Channel } from '../../types/communications';
interface CommunicationChannelsProps {
  channels: Channel[];
  templates: any[];
  loading: boolean;
  onUpdateChannel: (channelId: string, updates: Partial<Channel>) => Promise<boolean>;
}

const CommunicationChannels: React.FC<CommunicationChannelsProps> = ({
  channels,
  templates,
  loading,
  onUpdateChannel
}) => {
  const [configuringChannel, setConfiguringChannel] = useState<string | null>(null);

  const handleConfigureChannel = (channel: Channel) => {
    setConfiguringChannel(channel.id);
    // Implementation for configuring the channel
    setTimeout(() => {
      onUpdateChannel(channel.id, { isConfigured: !channel.isConfigured })
        .then(() => {
    setConfiguringChannel(null);
        })
        .catch(() => {
          setConfiguringChannel(null);
        });
    }, 1000);
  };

  const getChannelIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email':
        return '✉️';
      case 'sms':
        return '📱';
      case 'whatsapp':
        return '💬';
      default:
        return '📣';
    }
  };

  // Button style to ensure visibility
  const buttonStyle = {
    backgroundColor: '#4a6cf7',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    visibility: 'visible' as const
};

  // Secondary button style for configured channels
  const secondaryButtonStyle = {
    backgroundColor: '#f1f1f1',
    color: '#333',
    padding: '8px 16px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    visibility: 'visible' as const
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Communication Channels</h2>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Communication Channels</h2>
      {channels.length === 0 ? (
        <p className="text-gray-500">No communication channels configured.</p>
      ) : (
        <div className="space-y-4">
          {channels.map((channel) => (
            <div key={channel.id} className="border rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getChannelIcon(channel.type)}</span>
                  <div>
                    <h3 className="font-medium capitalize">{channel.type}</h3>
                    <p className="text-sm text-gray-500">
                      {channel.isConfigured
                        ? `${channel.type} service is configured and ready to use`
                        : `Connect your ${channel.type} provider to send ${
                            channel.type.toLowerCase() === 'sms' ? 'text' : channel.type
                          } messages`}
                    </p>
                    {channel.isConfigured && (
                      <div className="mt-1">
                        <span className="inline-flex items-center text-sm text-green-600">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                          Connected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  style={channel.isConfigured ? secondaryButtonStyle : buttonStyle}
                  onClick={() => handleConfigureChannel(channel)}
                  disabled={configuringChannel === channel.id}
                >
                  {configuringChannel === channel.id
                    ? 'Configuring...'
                    : channel.isConfigured ? 'Reconfigure' : 'Configure'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunicationChannels;
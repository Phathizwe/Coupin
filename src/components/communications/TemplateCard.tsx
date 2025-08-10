import React, { useState } from 'react';
import { CommunicationTemplate } from '../../types';
import { detectTemplateChannel, validateTemplateForChannel } from '../../utils/templateChannelDetector';
import { openChannelWithTemplate } from '../../utils/channelRouter';
import { toast } from 'react-hot-toast';

interface TemplateCardProps {
  template: CommunicationTemplate;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Format date for display
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get icon based on template type
  const getTemplateTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';
      case 'sms':
        return 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z';
      case 'whatsapp':
        return 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z';
      default:
        return 'M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  };

  // Get color based on template type
  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'text-blue-500';
      case 'sms':
        return 'text-green-500';
      case 'whatsapp':
        return 'text-green-600';
      default:
        return 'text-gray-500';
    }
  };

  // Handle use template button click
  const handleUseTemplate = async () => {
    setIsProcessing(true);
    
    try {
      // Detect channel type if not explicitly set
      const channelType = template.type || detectTemplateChannel(template);
      
      if (!channelType) {
        toast.error('Unable to determine channel type for this template');
        setIsProcessing(false);
        return;
      }
      
      // Validate template for the detected channel
      const validation = validateTemplateForChannel(template, channelType);
      
      // Show warnings if any - using custom toast for warnings
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          // Use custom toast with orange color for warnings
          toast(warning, {
            icon: '⚠️',
            style: {
              borderLeft: '4px solid #f97316', // Orange color for warning
              background: '#fff7ed',
              color: '#9a3412',
            },
          });
        });
      }
      
      // Open the appropriate channel with the template
      const success = await openChannelWithTemplate(template, channelType);
      
      if (success) {
        toast.success(`Template opened in ${channelType.toUpperCase()} successfully`);
      }
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to use template. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Get preview of template content
  const getTemplatePreview = () => {
    const maxLength = 100;
    let preview = '';
    
    if (template.type === 'email' && template.subject) {
      preview = `Subject: ${template.subject}\n`;
    }
    
    // Add content preview
    const contentPreview = template.content.length > maxLength 
      ? template.content.substring(0, maxLength) + '...'
      : template.content;
      
    preview += contentPreview;
    
    return preview;
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{template.name}</h3>
          <div className="flex items-center mt-1">
            <svg className={`h-4 w-4 ${getTemplateTypeColor(template.type)} mr-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={getTemplateTypeIcon(template.type)} />
            </svg>
            <span className="text-xs text-gray-500 capitalize">{template.type}</span>
            {template.createdAt && (
              <>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-xs text-gray-500">Created {formatDate(template.createdAt)}</span>
              </>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-2 line-clamp-3 whitespace-pre-line">
            {template.type === 'email' && template.subject ? 
              <span className="font-medium">Subject: {template.subject}</span> : null}
            {template.content}
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end space-x-2">
        <button className="text-gray-600 hover:text-gray-800 text-sm">
          Edit
        </button>
        <button 
          className={`${isProcessing ? 'text-gray-400 cursor-wait' : 'text-primary-600 hover:text-primary-700'} text-sm font-medium`}
          onClick={handleUseTemplate}
          disabled={isProcessing}
        >
          {isProcessing ? 'Opening...' : 'Use Template'}
        </button>
      </div>
      
      {/* Template Preview Modal could be added here */}
    </div>
  );
};

export default TemplateCard;
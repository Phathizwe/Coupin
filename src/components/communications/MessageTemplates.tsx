import React, { useState } from 'react';
import TemplateCard from './TemplateCard';
import CreateTemplateModal from './CreateTemplateModal';
import { CommunicationTemplate } from '../../types';

interface MessageTemplatesProps {
  templates: CommunicationTemplate[];
  loading: boolean;
  onCreateTemplate?: (template: Partial<CommunicationTemplate>) => Promise<CommunicationTemplate | null>;
  error?: string | null;
}

const MessageTemplates: React.FC<MessageTemplatesProps> = ({ 
  templates, 
  loading,
  onCreateTemplate,
  error
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSaveTemplate = async (templateData: Partial<CommunicationTemplate>) => {
    setLocalError(null);

    if (onCreateTemplate) {
      try {
        const result = await onCreateTemplate(templateData);
        console.log('Template saved result in MessageTemplates:', result);
        if (result) {
          setIsModalOpen(false);
          return result;
        }
        // If we get here, there was an error but no exception
        setLocalError('Failed to create template. Please try again.');
        return null;
      } catch (error) {
        console.error('Error in handleSaveTemplate:', error);
        setLocalError('An unexpected error occurred. Please try again.');
        return null;
      }
    }
    return null;
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Use either the passed error or local error
  const displayError = error || localError;

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
    visibility: 'visible' as const,
    display: 'inline-block'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Message Templates</h2>
        <button 
          style={buttonStyle}
          onClick={handleOpenModal}
        >
          New Template
        </button>
      </div>

      {displayError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {displayError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-5xl mb-3">💌</div>
          <p className="text-gray-600 mb-4">No templates yet</p>
          <p className="text-gray-500 text-sm mb-6">
            Get started by creating a new message template.
          </p>
          <button 
            style={{
              ...buttonStyle,
              padding: '10px 20px',
              fontSize: '16px',
              margin: '0 auto',
              display: 'block'
            }}
            onClick={handleOpenModal}
          >
            Create Template
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <TemplateCard 
              key={template.id} 
              template={template} 
      />
          ))}
    </div>
      )}

      <CreateTemplateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTemplate}
        error={displayError}
      />
    </div>
  );
};

export default MessageTemplates;
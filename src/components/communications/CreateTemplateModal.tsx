import React, { useState, useEffect } from 'react';
import { CommunicationTemplate } from '../../types';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Partial<CommunicationTemplate>) => Promise<CommunicationTemplate | null>;
  error?: string | null;
}

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  error: externalError 
}) => {
  const [templateData, setTemplateData] = useState<Partial<CommunicationTemplate>>({
    name: '',
    type: 'email',
    content: '',
    subject: '', // For email templates
    variables: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reset the form when the modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setTemplateData({
        name: '',
        type: 'email',
        content: '',
        subject: '',
        variables: []
      });
      setError(null);
    }
  }, [isOpen]);
  
  // Update local error state when external error changes
  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTemplateData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const validateForm = (): boolean => {
    if (!templateData.name || templateData.name.trim() === '') {
      setError('Template name is required');
      return false;
    }
    
    if (!templateData.content || templateData.content.trim() === '') {
      setError('Content is required');
      return false;
    }
    
    if (templateData.type === 'email' && (!templateData.subject || templateData.subject.trim() === '')) {
      setError('Subject line is required for email templates');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Submitting template data:', templateData);
      const result = await onSave(templateData);
      console.log('Template save result:', result);
      
      if (result) {
        // Reset form and close modal only on success
        setTemplateData({
          name: '',
          type: 'email',
          content: '',
          subject: '',
          variables: []
        });
        onClose();
      } else {
        setError('Failed to create template. Please try again.');
      }
    } catch (err) {
      console.error('Error saving template:', err);
      setError('An error occurred while saving the template.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setTemplateData({
      name: '',
      type: 'email',
      content: '',
      subject: '',
      variables: []
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Template</h2>
          <button 
            onClick={resetAndClose}
            className="text-gray-500 hover:text-gray-700"
            type="button"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={templateData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Welcome Email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={templateData.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          {templateData.type === 'email' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Line <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={templateData.subject || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Welcome to our store!"
                required={templateData.type === 'email'}
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={templateData.content}
              onChange={handleChange}
              rows={5}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={templateData.type === 'email' 
                ? "Hello {firstName},\n\nWelcome to our store! We're excited to have you join us.\n\nBest regards,\nYour Store Team"
                : "Hi {firstName}! Welcome to our store. Use code WELCOME10 for 10% off your first purchase!"}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {"{firstName}"}, {"{lastName}"}, etc. as placeholders for customer information.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetAndClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplateModal;
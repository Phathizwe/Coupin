import React, { useState } from 'react';
import { TimelineEntry, timelineService } from '@/services/timelineService';

interface TimelineAdminProps {
  onEntryAdded: () => void;
}

const TimelineAdmin: React.FC<TimelineAdminProps> = ({ onEntryAdded }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState<Omit<TimelineEntry, 'id'>>({
    year: new Date().getFullYear().toString(),
    title: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEntry.year || !newEntry.title) {
      setError('Year and title are required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await timelineService.addTimelineEntry(newEntry);
      setNewEntry({
        year: new Date().getFullYear().toString(),
        title: '',
        description: '',
      });
      setIsAdding(false);
      onEntryAdded();
    } catch (err) {
      setError('Failed to add timeline entry');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Timeline Management</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition"
          >
            Add New Entry
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="text"
              id="year"
              name="year"
              value={newEntry.year}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., 2025"
            />
          </div>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={newEntry.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Built and Launched TYCA"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={newEntry.description || ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Add more details about this milestone..."
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Entry'}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TimelineAdmin;
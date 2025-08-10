import React, { useState, useEffect } from 'react';
import { TimelineEntry, timelineService } from '@/services/timelineService';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const TimelineManagement: React.FC = () => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimelineEntry | null>(null);
  const [formData, setFormData] = useState<Omit<TimelineEntry, 'id'>>({
    year: new Date().getFullYear().toString(),
    title: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch timeline entries
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const timelineEntries = await timelineService.getTimelineEntries();
      setEntries(timelineEntries);
    } catch (err) {
      console.error('Error fetching timeline entries:', err);
      setError('Failed to load timeline entries');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEntry = () => {
    setIsAdding(true);
    setIsEditing(false);
    setCurrentEntry(null);
    setFormData({
      year: new Date().getFullYear().toString(),
      title: '',
      description: '',
    });
    setError('');
    setSuccess('');
  };

  const handleEditEntry = (entry: TimelineEntry) => {
    setIsEditing(true);
    setIsAdding(false);
    setCurrentEntry(entry);
    setFormData({
      year: entry.year,
      title: entry.title,
      description: entry.description || '',
    });
    setError('');
    setSuccess('');
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this timeline entry?')) {
      return;
    }

    setLoading(true);
    try {
      await timelineService.deleteTimelineEntry(id);
      setSuccess('Timeline entry deleted successfully');
      fetchEntries();
    } catch (err) {
      console.error('Error deleting timeline entry:', err);
      setError('Failed to delete timeline entry');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.year || !formData.title) {
      setError('Year and title are required');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (isEditing && currentEntry?.id) {
        await timelineService.updateTimelineEntry(currentEntry.id, formData);
        setSuccess('Timeline entry updated successfully');
      } else {
        await timelineService.addTimelineEntry(formData);
        setSuccess('Timeline entry added successfully');
      }

      setIsAdding(false);
      setIsEditing(false);
      setCurrentEntry(null);
      fetchEntries();
    } catch (err) {
      console.error('Error saving timeline entry:', err);
      setError('Failed to save timeline entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setCurrentEntry(null);
    setError('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Timeline Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage timeline entries that appear on the About page
        </p>
      </div>

      {/* Action buttons */}
      <div className="mb-6">
        <button
          onClick={handleAddEntry}
          disabled={isAdding || isEditing}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Timeline Entry
        </button>
      </div>

      {/* Form for adding/editing */}
      {(isAdding || isEditing) && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Edit Timeline Entry' : 'Add Timeline Entry'}
            </h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., 2025"
                  required
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., Built and Launched TYCA"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Add more details about this milestone..."
                />
              </div>

              {error && (
                <div className="text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Entry' : 'Add Entry'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline entries list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Timeline Entries</h2>
          <p className="mt-1 text-sm text-gray-500">
            All timeline entries sorted by year (newest first)
          </p>
        </div>
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="px-4 py-5 sm:p-6 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {entries.length === 0 ? (
                <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
                  No timeline entries found. Add your first entry to get started.
                </li>
              ) : (
                entries.map((entry) => (
                  <li key={entry.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                            {entry.year}
                          </span>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {entry.title}
                          </p>
                        </div>
                        {entry.description && (
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {entry.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-5 flex-shrink-0 flex space-x-2">
                        <button
                          onClick={() => handleEditEntry(entry)}
                          className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id!)}
                          className="p-1 rounded-full text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineManagement;
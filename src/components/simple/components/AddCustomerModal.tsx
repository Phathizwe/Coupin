import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addCustomer } from '../../../services/customerService';

interface AddCustomerModalProps {
  businessId: string;
  onClose: () => void;
  onAdd: (customerId: string) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ businessId, onClose, onAdd }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email) {
      setError('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const newCustomer = await addCustomer({
        businessId,
        firstName,
        lastName,
        email,
        phone,
        notes,
        joinDate: new Date(),
      });
      onAdd(newCustomer.id);
    } catch (error) {
      console.error('Error adding customer:', error);
      setError('Failed to add customer. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
        className="bg-white rounded-xl w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring" as any, duration: 0.5 }}
        >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-amber-900">Welcome a New Friend</h3>
            <motion.button 
                onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              whileTap={{ scale: 0.9 }}
              >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
          
          {error && (
            <motion.div 
              className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              >
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <motion.button
                type="button"
                onClick={onClose}
                className="mr-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
              >
                Cancel
              </motion.button>
              
              <motion.button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-md shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Add Customer'
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddCustomerModal;
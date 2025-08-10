import React, { useState } from 'react';

interface AddCustomerModalProps {
  onClose: () => void;
  onSave: (customerData: { firstName: string; lastName: string; phone: string }) => void;
  isLoading: boolean;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ onClose, onSave, isLoading }) => {
  const [newCustomer, setNewCustomer] = useState({ firstName: '', lastName: '', phone: '' });

  const handleSubmit = () => {
    if (!newCustomer.firstName || !newCustomer.phone) return;
    onSave(newCustomer);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-4">
        <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name*
          </label>
          <input
            type="text"
            value={newCustomer.firstName}
            onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
            className="w-full p-2 border rounded-lg"
            placeholder="First Name"
          />
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            value={newCustomer.lastName}
            onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
            className="w-full p-2 border rounded-lg"
            placeholder="Last Name"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number*
          </label>
          <input
            type="tel"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
            className="w-full p-2 border rounded-lg"
            placeholder="Phone Number"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg"
          >
            CANCEL
          </button>
          <button
            onClick={handleSubmit}
            disabled={!newCustomer.firstName || !newCustomer.phone || isLoading}
            className={`flex-1 py-2 rounded-lg text-white ${
              !newCustomer.firstName || !newCustomer.phone || isLoading
                ? 'bg-gray-400'
                : 'bg-green-600 active:bg-green-700'
            }`}
          >
            {isLoading ? 'SAVING...' : 'SAVE CUSTOMER'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerModal;
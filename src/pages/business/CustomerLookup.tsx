import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { findCustomerByPhone, addCustomerToBusiness, enrollCustomer } from '../../services/customerLookupService';
import { getBusinessPrograms } from '../../customer/services/storeService.enhanced';

const CustomerLookup: React.FC = () => {
  const { user, businessProfile } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const handleSearch = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    if (!businessProfile?.businessId) {
      setError('Business ID not found');
      return;
    }

    setLoading(true);
    setError('');
    setCustomer(null);
    setEnrollmentSuccess(false);

    try {
      // Search for customer by phone number
      const result = await findCustomerByPhone(phoneNumber);

      if (result) {
        setCustomer(result);
        
        // Fetch available loyalty programs
        const businessPrograms = await getBusinessPrograms(businessProfile.businessId);
        setPrograms(businessPrograms);
      } else {
        setError('No customer found with this phone number');
        setNewCustomer({
          ...newCustomer,
          phone: phoneNumber
        });
        setShowAddForm(true);
      }
    } catch (error) {
      console.error('Error searching for customer:', error);
      setError('An error occurred while searching for the customer');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!customer || !selectedProgram || !businessProfile?.businessId) {
      setError('Please select a loyalty program');
      return;
    }

    setLoading(true);
    setError('');
    setEnrollmentSuccess(false);

    try {
      await enrollCustomer(customer.id, businessProfile.businessId, selectedProgram);
      setEnrollmentSuccess(true);
    } catch (error) {
      console.error('Error enrolling customer:', error);
      setError('An error occurred while enrolling the customer');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.phone) {
      setError('Please fill in all required fields');
      return;
    }

    if (!businessProfile?.businessId) {
      setError('Business ID not found');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Add customer to business
      const result = await addCustomerToBusiness(businessProfile.businessId, newCustomer);
      setCustomer(result);
      setShowAddForm(false);
      
      // Fetch available loyalty programs
      const businessPrograms = await getBusinessPrograms(businessProfile.businessId);
      setPrograms(businessPrograms);
    } catch (error) {
      console.error('Error adding customer:', error);
      setError('An error occurred while adding the customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Customer Lookup</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter customer phone number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Customer</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name*
              </label>
              <input
                type="text"
                id="firstName"
                value={newCustomer.firstName}
                onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name*
              </label>
              <input
                type="text"
                id="lastName"
                value={newCustomer.lastName}
                onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number*
              </label>
              <input
                type="tel"
                id="phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCustomer}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </div>
      )}

      {customer && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-500">Name</div>
              <div className="font-medium">{customer.firstName} {customer.lastName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Phone</div>
              <div className="font-medium">{customer.phone}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-medium">{customer.email || 'Not provided'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Customer Type</div>
              <div className="font-medium">
                {customer.platformUser ? 'Platform User' : 'Business Customer'}
              </div>
            </div>
          </div>
          
          {programs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Enroll in Loyalty Program</h3>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a loyalty program</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <button
                    onClick={handleEnroll}
                    disabled={loading || !selectedProgram}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? 'Enrolling...' : 'Enroll Customer'}
                  </button>
                </div>
              </div>
              
              {enrollmentSuccess && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                  Customer successfully enrolled in the loyalty program!
                </div>
              )}
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium mb-3">Record Visit</h3>
            
            <div className="flex justify-between items-center">
              <div>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Record Visit
                </button>
              </div>
              
              <div>
                <button
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Scan QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLookup;
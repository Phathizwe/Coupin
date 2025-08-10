import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { setUserAsAdmin } from '@/utils/adminRoleSetup';
import { ShieldCheckIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  createdAt?: any;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef);
        const querySnapshot = await getDocs(q);
        
        const fetchedUsers: User[] = [];
        querySnapshot.forEach((doc) => {
          fetchedUsers.push({
            id: doc.id,
            ...doc.data() as Omit<User, 'id'>
          });
        });
        
        setUsers(fetchedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [refreshTrigger]);

  const handleMakeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter an email address');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const success = await setUserAsAdmin(email);
      
      if (success) {
        setSuccess(`User ${email} has been successfully set as admin`);
        setEmail('');
        // Refresh the user list
        setRefreshTrigger(prev => prev + 1);
      } else {
        setError(`User ${email} not found`);
      }
    } catch (err) {
      console.error('Error setting admin role:', err);
      setError('Failed to set admin role. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId: string, userEmail: string) => {
    if (window.confirm(`Are you sure you want to remove admin privileges from ${userEmail}?`)) {
      setLoading(true);
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          role: 'business'
        });
        
        setSuccess(`Admin privileges removed from ${userEmail}`);
        // Refresh the user list
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        console.error('Error removing admin role:', err);
        setError('Failed to remove admin role. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Manage admin users and system settings</p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Add New Admin</h2>
          <p className="mt-1 text-sm text-gray-500">Grant admin privileges to a user by email</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <form onSubmit={handleMakeAdmin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-primary focus:border-primary flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                  placeholder="user@example.com"
                />
              </div>
            </div>
            
            {error && (
              <div className="text-sm text-red-600">
                {error}
              </div>
            )}
            
            {success && (
              <div className="text-sm text-green-600">
                {success}
              </div>
            )}
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                <ShieldCheckIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                {loading ? 'Processing...' : 'Make Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Admin Users</h2>
          <p className="mt-1 text-sm text-gray-500">List of all users with admin privileges</p>
        </div>
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="px-4 py-5 sm:p-6 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {users
                .filter(user => user.role === 'admin')
                .map((user) => (
                  <li key={user.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.displayName || 'No Name'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveAdmin(user.id, user.email)}
                        className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="-ml-1 mr-1 h-4 w-4" aria-hidden="true" />
                        Remove Admin
                      </button>
                    </div>
                  </li>
                ))}
              
              {users.filter(user => user.role === 'admin').length === 0 && (
                <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
                  No admin users found
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Homepage Management Card */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Homepage Management</h2>
          <p className="mt-1 text-sm text-gray-500">Manage website content, pricing, and more</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <Link
            to="/admin/homepage"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Manage Homepage Content
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
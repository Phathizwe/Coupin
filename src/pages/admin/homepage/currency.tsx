import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import CurrencyManagementContent from '@/components/admin/currency/CurrencyManagement';

// Let's check what AdminLayout looks like in your project
// For now, we'll assume it's a simple wrapper component
const CurrencyManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not logged in
  React.useEffect(() => {
    if (user === null) {
      navigate('/login?redirect=/admin/homepage/currency');
  }
  }, [user, navigate]);
  
  if (!user) {
  return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
  );
  }
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link to="/admin/homepage" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Homepage Management
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-2">Currency Management</h1>
      <p className="text-gray-600 mb-8">
        Manage the currencies available in the system. Add new currencies, edit existing ones, or deactivate currencies.
      </p>
      
      <CurrencyManagementContent />
    </div>
  );
};

export default CurrencyManagementPage;
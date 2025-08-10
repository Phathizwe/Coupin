import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DebugRenderer from '../../components/auth/DebugRenderer';

const SimpleLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    console.log('[SimpleLoginPage] Component mounted');
    
    return () => {
      console.log('[SimpleLoginPage] Component unmounted');
    };
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Just simulate a login attempt
    console.log('Login attempt with:', { email });
    
    setTimeout(() => {
      setIsLoading(false);
      setError('This is a test login page. No actual authentication is performed.');
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <DebugRenderer componentName="SimpleLoginPage" />
      
      <div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Simple Login Test</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          This is a simplified login page for testing
        </p>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Sign in'}
          </button>
        </div>
      </form>
      
      <div className="text-center">
        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
          Need an account? Register
        </Link>
      </div>
    </div>
  );
};

export default SimpleLoginPage;
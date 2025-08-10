import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Currency } from '@/services/currencyService';
import { PricingPlan } from '@/types/billing.types';
import { PricingManagerState } from './pricing/types';

// Import modular components
import CollectionTools from './pricing/CollectionTools';
import PlanEditor from './pricing/PlanEditor';
import PlansList from './pricing/PlansList';
import Notifications from './pricing/Notifications';
import PlanCreator from './pricing/PlanCreator';
import PlanOrderManager from './pricing/PlanOrderManager';

const PricingManager: React.FC = () => {
  const [state, setState] = useState<PricingManagerState>({
    plans: [],
    currencies: [],
    loading: true,
    editingPlan: null,
    notification: {
      error: null,
      success: null
    },
    isManagingOrder: false
  });
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);

  // Fetch pricing plans and currencies
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      // Fetch pricing plans
      const plansRef = collection(db, 'pricing_plans');
      const snapshot = await getDocs(plansRef);
      const fetchedPlans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PricingPlan[];

      // Fetch currencies directly from Firestore without filtering
      const currencies = await fetchAllCurrencies();
      
      setState(prev => ({
        ...prev,
        plans: fetchedPlans,
        currencies: currencies,
        loading: false
      }));
    } catch (err) {
      console.error('Error fetching data:', err);
      setNotification({ 
        error: 'Failed to load pricing plans or currencies', 
        success: null 
      });
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // New function to fetch all currencies directly from Firestore
  const fetchAllCurrencies = async (): Promise<Currency[]> => {
    try {
      const currenciesRef = collection(db, 'currencies');
      const currenciesSnapshot = await getDocs(currenciesRef);
      
      if (currenciesSnapshot.empty) {
        console.log('No currencies found');
        return [];
      }
      
      // Map the documents to Currency objects, ensuring code is set from document ID
      const currencies = currenciesSnapshot.docs.map(doc => ({
        code: doc.id, // Always use document ID as the code
        name: doc.data().name,
        symbol: doc.data().symbol,
        isActive: doc.data().isActive ?? true,
        updatedAt: doc.data().updatedAt,
        updatedBy: doc.data().updatedBy
      } as Currency));
      
      // Sort currencies by code
      currencies.sort((a, b) => a.code.localeCompare(b.code));
      
      return currencies;
    } catch (error) {
      console.error('Error fetching currencies:', error);
      return [];
    }
  };

  const startEditingPlan = (plan: PricingPlan) => {
    // If plan doesn't have currencyPrices, initialize with empty array
    const planToEdit = {
      ...plan,
      currencyPrices: plan.currencyPrices || []
    };
    setState(prev => ({ 
      ...prev, 
      editingPlan: planToEdit,
      notification: { error: null, success: null },
      isManagingOrder: false
    }));
    setIsCreatingPlan(false);
  };

  const cancelEditing = () => {
    setState(prev => ({ 
      ...prev, 
      editingPlan: null,
      notification: { error: null, success: null }
    }));
  };

  const startCreatingPlan = () => {
    setIsCreatingPlan(true);
    setState(prev => ({
      ...prev,
      editingPlan: null,
      notification: { error: null, success: null },
      isManagingOrder: false
    }));
  };

  const cancelCreatingPlan = () => {
    setIsCreatingPlan(false);
  };

  const startManagingOrder = () => {
    setState(prev => ({
      ...prev,
      isManagingOrder: true,
      editingPlan: null,
      notification: { error: null, success: null }
    }));
    setIsCreatingPlan(false);
  };

  const cancelManagingOrder = () => {
    setState(prev => ({
      ...prev,
      isManagingOrder: false
    }));
  };

  const handlePlanSaved = (updatedPlan: PricingPlan) => {
    // Update the local plans state
    const updatedPlans = state.plans.map(plan => 
      plan.id === updatedPlan.id ? updatedPlan : plan
    );
    
    setState(prev => ({
      ...prev,
      plans: updatedPlans,
      editingPlan: null
    }));
  };

  const handlePlanCreated = () => {
    // Refresh the plans list to include the new plan
    fetchPlans();
    setIsCreatingPlan(false);
  };

  const setNotification = (notification: { error: string | null, success: string | null }) => {
    setState(prev => ({
      ...prev,
      notification
    }));
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Pricing Plan Management</h2>
          <p className="mt-1 text-sm text-gray-500">Set different prices for each currency by plan</p>
        </div>
        
        <div className="flex space-x-3">
          {!isCreatingPlan && !state.editingPlan && !state.isManagingOrder && (
            <>
              <button
                onClick={startManagingOrder}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Manage Display Order
              </button>
              <button
                onClick={startCreatingPlan}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Create New Plan
              </button>
            </>
          )}
          
          {state.isManagingOrder && (
            <button
              onClick={cancelManagingOrder}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Plans
            </button>
          )}
        </div>
      </div>

      {/* Collection Management Tools */}
      {!isCreatingPlan && !state.editingPlan && !state.isManagingOrder && (
        <CollectionTools 
          onSuccess={(message) => setNotification({ success: message, error: null })}
          onError={(message) => setNotification({ error: message, success: null })}
          onMigrationComplete={fetchPlans}
        />
      )}

      {/* Notifications */}
      <Notifications notification={state.notification} />

      {/* Plan Order Manager, Creator, Editor, or Plans List */}
      {state.isManagingOrder ? (
        <PlanOrderManager
          plans={state.plans}
          onSuccess={(message) => setNotification({ success: message, error: null })}
          onError={(message) => setNotification({ error: message, success: null })}
          onOrderUpdated={fetchPlans}
        />
      ) : isCreatingPlan ? (
        <PlanCreator
          currencies={state.currencies}
          existingPlansCount={state.plans.length}
          onSuccess={(message) => setNotification({ success: message, error: null })}
          onError={(message) => setNotification({ error: message, success: null })}
          onPlanCreated={handlePlanCreated}
          onCancel={cancelCreatingPlan}
        />
      ) : state.editingPlan ? (
        <PlanEditor
          plan={state.editingPlan}
          currencies={state.currencies}
          onSave={handlePlanSaved}
          onCancel={cancelEditing}
          onError={(message) => setNotification({ error: message, success: null })}
          onSuccess={(message) => setNotification({ success: message, error: null })}
        />
      ) : (
        <PlansList
          plans={state.plans}
          currencies={state.currencies}
          onEditPlan={startEditingPlan}
        />
      )}
    </div>
  );
};

export default PricingManager;
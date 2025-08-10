import React, { useState } from 'react';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { PricingPlan } from '@/types/billing.types';

interface PlanOrderManagerProps {
  plans: PricingPlan[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onOrderUpdated: () => void;
}

const PlanOrderManager: React.FC<PlanOrderManagerProps> = ({
  plans,
  onSuccess,
  onError,
  onOrderUpdated
}) => {
  const [orderedPlans, setOrderedPlans] = useState<PricingPlan[]>(
    // Sort plans by displayOrder if it exists, otherwise keep original order
    [...plans].sort((a, b) => {
      const orderA = a.displayOrder !== undefined ? a.displayOrder : 999;
      const orderB = b.displayOrder !== undefined ? b.displayOrder : 999;
      return orderA - orderB;
    })
  );
  const [isSaving, setIsSaving] = useState(false);

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const newOrderedPlans = [...orderedPlans];
    const temp = newOrderedPlans[index];
    newOrderedPlans[index] = newOrderedPlans[index - 1];
    newOrderedPlans[index - 1] = temp;
    setOrderedPlans(newOrderedPlans);
  };

  const moveDown = (index: number) => {
    if (index >= orderedPlans.length - 1) return;
    const newOrderedPlans = [...orderedPlans];
    const temp = newOrderedPlans[index];
    newOrderedPlans[index] = newOrderedPlans[index + 1];
    newOrderedPlans[index + 1] = temp;
    setOrderedPlans(newOrderedPlans);
  };

  const saveOrder = async () => {
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      
      // Update each plan with its new display order
      orderedPlans.forEach((plan, index) => {
        const planRef = doc(db, 'pricing_plans', plan.id);
        batch.update(planRef, { 
          displayOrder: index,
          updatedAt: new Date()
        });
      });
      
      await batch.commit();
      onSuccess('Plan display order updated successfully');
      onOrderUpdated();
    } catch (err) {
      console.error('Error updating plan order:', err);
      onError(`Failed to update plan order: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border-t border-gray-200 px-4 py-5 bg-gray-50">
      <h3 className="text-md font-medium text-gray-700 mb-3">Manage Display Order</h3>
      <p className="text-sm text-gray-500 mb-4">
        Drag and drop or use the arrows to change the order in which pricing plans appear on the pricing page.
      </p>
      
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {orderedPlans.map((plan, index) => (
            <li key={plan.id} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-gray-600 text-sm font-medium mr-3">
                  {index + 1}
                </span>
                <span className="font-medium">{plan.name}</span>
                {plan.popularPlan && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Popular
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30"
                  title="Move up"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === orderedPlans.length - 1}
                  className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30"
                  title="Move down"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={saveOrder}
          disabled={isSaving}
          className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Display Order'}
        </button>
      </div>
    </div>
  );
};

export default PlanOrderManager;
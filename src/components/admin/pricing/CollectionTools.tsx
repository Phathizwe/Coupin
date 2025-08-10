import React, { useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { PricingPlan } from '@/types/billing.types';

interface CollectionToolsProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onMigrationComplete: () => void;
}

const CollectionTools: React.FC<CollectionToolsProps> = ({ 
  onSuccess, 
  onError,
  onMigrationComplete 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  const deleteOldCollection = async () => {
    if (window.confirm('Are you sure you want to delete all documents in the old pricingPlans collection?')) {
      setIsDeleting(true);
      
      try {
        // Get all documents from the old collection
        const oldPlansRef = collection(db, 'pricingPlans');
        const snapshot = await getDocs(oldPlansRef);
        
        if (snapshot.empty) {
          onSuccess('No documents found in old pricingPlans collection. Nothing to delete.');
          setIsDeleting(false);
          return;
        }
        
        // Delete each document
        const deletePromises = snapshot.docs.map(docSnapshot => {
          return deleteDoc(docSnapshot.ref);
        });
        
        await Promise.all(deletePromises);
        onSuccess('Successfully deleted all documents in the old pricingPlans collection.');
      } catch (err) {
        console.error('Error deleting old pricing plans:', err);
        onError(`Error deleting collection: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const migratePricingPlans = async () => {
    if (window.confirm('Are you sure you want to migrate pricing plans from the old collection to the new pricing_plans collection?')) {
      setIsMigrating(true);
      
      try {
        // Get all documents from the old collection
        const oldPlansRef = collection(db, 'pricingPlans');
        const oldPlansSnapshot = await getDocs(oldPlansRef);
        
        if (oldPlansSnapshot.empty) {
          onSuccess('No documents found in old pricingPlans collection.');
          setIsMigrating(false);
          return;
        }
        
        // Create new collection with the plans, adding the active flag
        const newPlansRef = collection(db, 'pricing_plans');
        
        for (const docSnapshot of oldPlansSnapshot.docs) {
          const planData = docSnapshot.data() as Omit<PricingPlan, 'id'>;
          
          // Add the active flag if it doesn't exist
          if (planData.active === undefined) {
            planData.active = true;
          }
          
          // Add to the new collection
          await addDoc(newPlansRef, {
            ...planData,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
        onSuccess('Successfully migrated pricing plans to the new collection.');
        onMigrationComplete();
      } catch (err) {
        console.error('Error migrating pricing plans:', err);
        onError(`Error migrating plans: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsMigrating(false);
      }
    }
  };

  return (
    <div className="border-t border-gray-200 px-4 py-5 bg-gray-50">
      <h3 className="text-md font-medium text-gray-700 mb-3">Collection Management Tools</h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={migratePricingPlans}
          disabled={isMigrating}
          className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isMigrating ? 'Migrating...' : 'Migrate from Old Collection'}
        </button>
        
        <button
          onClick={deleteOldCollection}
          disabled={isDeleting}
          className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete Old Collection'}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Use these tools to migrate pricing plans from the old 'pricingPlans' collection to the new 'pricing_plans' collection.
      </p>
    </div>
  );
};

export default CollectionTools;
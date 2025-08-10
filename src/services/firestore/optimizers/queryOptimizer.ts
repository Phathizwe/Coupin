// src/services/firestore/optimizers/queryOptimizer.ts
import { 
query, 
where, 
orderBy, 
limit, 
startAfter, 
QueryConstraint,
DocumentSnapshot,
CollectionReference
} from 'firebase/firestore';

export class QueryOptimizer {
  /**
   * Build optimized compound queries with proper indexing
   */
  static buildCompoundQuery(
    collection: CollectionReference,
    filters: Record<string, any>,
    orderField?: string,
    orderDirection: 'asc' | 'desc' = 'desc',
    maxResults: number = 100,
    lastDoc?: DocumentSnapshot
  ) {
    const constraints: QueryConstraint[] = [];
    
    // Add where clauses in optimal order (equality first, then range)
    const equalityFilters = Object.entries(filters).filter(([_, value]) => 
      typeof value !== 'object' || !value.operator
    );
    const rangeFilters = Object.entries(filters).filter(([_, value]) => 
      typeof value === 'object' && value.operator
    );
    
    // Add equality filters first for better index usage
    equalityFilters.forEach(([field, value]) => {
      constraints.push(where(field, '==', value));
    });
    
    // Add range filters
    rangeFilters.forEach(([field, filterObj]) => {
      constraints.push(where(field, filterObj.operator, filterObj.value));
    });
    
    // Add ordering (must come after where clauses)
    if (orderField) {
      constraints.push(orderBy(orderField, orderDirection));
    }
    
    // Add cursor pagination
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    
    // Add limit
    if (maxResults > 0) {
      constraints.push(limit(maxResults));
    }
    
    return query(collection, ...constraints);
  }
  
  /**
   * Optimize phone number queries with normalized lookup
   */
  static normalizePhoneNumber(phone: string): string {
    return phone.replace(/\s+|-|\(|\)|\+/g, '');
  }
  
  /**
   * Create batched query for multiple document IDs
   */
  static createBatchedIdQuery(
    collection: CollectionReference,
    ids: string[],
    batchSize: number = 10
  ) {
    const batches = [];
    for (let i = 0; i < ids.length; i += batchSize) {
      const batchIds = ids.slice(i, i + batchSize);
      batches.push(
        query(collection, where('__name__', 'in', batchIds))
      );
    }
    return batches;
  }
  
  /**
   * Build query with proper field selection for minimal data transfer
   */
  static selectFields(baseQuery: any, fields: string[]) {
    // Note: Firestore doesn't support field selection in queries directly
    // This would be handled in the data transformation layer
    return {
      query: baseQuery,
      selectedFields: fields
    };
  }
}

/**
 * Required Firestore indexes configuration
 */
export const REQUIRED_COMPOUND_INDEXES = {
  coupons: [
    ['businessId', 'active', 'createdAt'],
    ['businessId', 'status', 'createdAt'],
    ['businessId', 'active', 'status', 'createdAt']
  ],
  customerCoupons: [
    ['customerId', 'allocatedDate'],
    ['customerId', 'status', 'allocatedDate'],
    ['businessId', 'customerId', 'allocatedDate']
  ],
  couponDistribution: [
    ['couponId', 'distributedAt'],
    ['businessId', 'couponId', 'distributedAt']
  ],
  customers: [
    ['phone_normalized'], // New field for optimized phone lookup
    ['businessId', 'phone_normalized']
  ]
};
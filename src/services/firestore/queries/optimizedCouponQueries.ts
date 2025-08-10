// src/services/firestore/queries/optimizedCouponQueries.ts
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  DocumentSnapshot 
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { QueryOptimizer } from '../optimizers/queryOptimizer';
import { CacheManager } from '../cache/cacheManager';
import { PerformanceMonitor } from '../../../utils/performanceMonitor';

export interface OptimizedCouponFilters {
  businessId: string;
  status?: string;
  active?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface PaginationOptions {
  maxResults: number;
  lastDoc?: DocumentSnapshot;
}

export class OptimizedCouponService {
  private static cache = new CacheManager();
  private static monitor = new PerformanceMonitor();
  
  /**
   * Optimized coupon fetching with caching and performance monitoring
   */
  static async getCouponsOptimized(
    filters: OptimizedCouponFilters,
    pagination: PaginationOptions = { maxResults: 100 }
  ) {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(filters, pagination);
    
    // Check cache first
    const cachedResult = await this.cache.get(cacheKey);
    if (cachedResult) {
      this.monitor.trackCacheHit(cacheKey);
      return cachedResult;
    }
    
    try {
      const couponsRef = collection(db, 'coupons');
      
      // Build optimized query filters
      const queryFilters: Record<string, any> = {
        businessId: filters.businessId
      };
      
      if (filters.active !== undefined) {
        queryFilters.active = filters.active;
      }
      
      if (filters.status) {
        queryFilters.status = filters.status;
      }
      
      if (filters.dateRange) {
        queryFilters.createdAt = {
          operator: '>=',
          value: filters.dateRange.start
        };
      }
      
      // Build optimized compound query
      const optimizedQuery = QueryOptimizer.buildCompoundQuery(
        couponsRef,
        queryFilters,
        'createdAt',
        'desc',
        pagination.maxResults,
        pagination.lastDoc
      );
      
      const querySnapshot = await getDocs(optimizedQuery);
      
      const coupons = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Cache the result
      await this.cache.set(cacheKey, coupons, 5 * 60 * 1000); // 5 minutes
      
      const endTime = performance.now();
      this.monitor.trackQueryPerformance('getCouponsOptimized', startTime, endTime);
      
      return {
        coupons,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === pagination.maxResults
      };
    } catch (error) {
      this.monitor.trackQueryError('getCouponsOptimized', error);
      throw error;
    }
  }
  
  /**
   * Optimized customer coupon fetching with denormalized data
   */
  static async getCustomerCouponsOptimized(
    customerId: string,
    options: {
      includeExpired?: boolean;
      maxResults?: number;
      lastDoc?: DocumentSnapshot;
    } = {}
  ) {
    const startTime = performance.now();
    const cacheKey = `customer_coupons_${customerId}_${JSON.stringify(options)}`;
    
    const cachedResult = await this.cache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    const customerCouponsRef = collection(db, 'customerCoupons');
    const filters: Record<string, any> = { customerId };
    
    if (!options.includeExpired) {
      filters.expiresAt = {
        operator: '>',
        value: new Date()
      };
    }
    
    const query = QueryOptimizer.buildCompoundQuery(
      customerCouponsRef,
      filters,
      'allocatedDate',
      'desc',
      options.maxResults || 50,
      options.lastDoc
    );
    
    const snapshot = await getDocs(query);
    
    const customerCoupons = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Cache for 2 minutes (shorter for user-specific data)
    await this.cache.set(cacheKey, customerCoupons, 2 * 60 * 1000);
    
    const endTime = performance.now();
    this.monitor.trackQueryPerformance('getCustomerCouponsOptimized', startTime, endTime);
    
    return customerCoupons;
  }
  
  /**
   * Optimized phone-based customer lookup
   */
  static async findCustomerByPhoneOptimized(phone: string) {
    const normalizedPhone = QueryOptimizer.normalizePhoneNumber(phone);
    const cacheKey = `customer_phone_${normalizedPhone}`;
    
    const cachedResult = await this.cache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    const customersRef = collection(db, 'customers');
    const query = QueryOptimizer.buildCompoundQuery(
      customersRef,
      { phone_normalized: normalizedPhone }, // Use normalized field
      undefined,
      'desc',
      1
    );
    
    const snapshot = await getDocs(query);
    const customer = snapshot.docs[0]?.data() || null;
    
    // Cache for 10 minutes (customer data changes less frequently)
    await this.cache.set(cacheKey, customer, 10 * 60 * 1000);
    
    return customer;
  }
  
  /**
   * Generate consistent cache keys
   */
  private static generateCacheKey(filters: OptimizedCouponFilters, pagination: PaginationOptions): string {
    const filterStr = JSON.stringify(filters);
    const paginationStr = JSON.stringify({
      maxResults: pagination.maxResults,
      lastDocId: pagination.lastDoc?.id
    });
    return `coupons_${btoa(filterStr + paginationStr)}`;
  }
}
// src/utils/performanceMonitor.ts

export interface QueryMetrics {
  queryName: string;
  duration: number;
  timestamp: number;
  cacheHit?: boolean;
  error?: any;
}

export class PerformanceMonitor {
  private metrics: QueryMetrics[] = [];
  private readonly MAX_METRICS = 1000;
  
  /**
   * Track query performance
   */
  trackQueryPerformance(queryName: string, startTime: number, endTime: number): void {
    const duration = endTime - startTime;
    const metric: QueryMetrics = {
      queryName,
      duration,
      timestamp: Date.now()
    };
    this.addMetric(metric);
    this.logPerformance(queryName, duration);
  }
  
  /**
   * Track cache hit
   */
  trackCacheHit(cacheKey: string): void {
    const metric: QueryMetrics = {
      queryName: `cache_hit_${cacheKey}`,
      duration: 0,
      timestamp: Date.now(),
      cacheHit: true
    };
    this.addMetric(metric);
    console.log(`🎯 Cache hit: ${cacheKey}`);
  }
  
  /**
   * Track query errors
   */
  trackQueryError(queryName: string, error: any): void {
    const metric: QueryMetrics = {
      queryName,
      duration: -1,
      timestamp: Date.now(),
      error: error.message || error
    };
    this.addMetric(metric);
    console.error(`❌ Query error in ${queryName}:`, error);
  }
  
  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageQueryTime: number;
    slowQueries: QueryMetrics[];
    cacheHitRate: number;
    totalQueries: number;
  } {
    const queryMetrics = this.metrics.filter(m => !m.cacheHit && !m.error);
    const cacheHits = this.metrics.filter(m => m.cacheHit).length;
    
    const averageQueryTime = queryMetrics.length > 0 
      ? queryMetrics.reduce((sum, m) => sum + m.duration, 0) / queryMetrics.length 
      : 0;
      
    const slowQueries = queryMetrics
      .filter(m => m.duration > 1000)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);
      
    const cacheHitRate = this.metrics.length > 0 
      ? (cacheHits / this.metrics.length) * 100 
      : 0;
      
    return {
      averageQueryTime,
      slowQueries,
      cacheHitRate,
      totalQueries: this.metrics.length
    };
  }
  
  /**
   * Export metrics for analysis
   */
  exportMetrics(): QueryMetrics[] {
    return [...this.metrics];
  }
  
  /**
   * Clear old metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }
  
  /**
   * Add metric with size limit enforcement
   */
  private addMetric(metric: QueryMetrics): void {
    this.metrics.push(metric);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }
  
  /**
   * Log performance with appropriate warnings
   */
  private logPerformance(queryName: string, duration: number): void {
    if (duration > 2000) {
      console.warn(`🐌 Very slow query: ${queryName} took ${duration.toFixed(2)}ms`);
    } else if (duration > 1000) {
      console.warn(`⚠️ Slow query: ${queryName} took ${duration.toFixed(2)}ms`);
    } else if (duration > 500) {
      console.log(`⏱️ ${queryName}: ${duration.toFixed(2)}ms`);
    } else {
      console.log(`⚡ Fast query: ${queryName}: ${duration.toFixed(2)}ms`);
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Development helper to log performance summary
if (process.env.NODE_ENV === 'development') {
  (window as any).getPerformanceSummary = () => {
    console.table(performanceMonitor.getPerformanceSummary());
  };
}
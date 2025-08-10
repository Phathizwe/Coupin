/**
 * Network Error Handler Utility
 * Handles common network-related errors gracefully
 */

export class NetworkErrorHandler {
  private static instance: NetworkErrorHandler;
  private blockedRequests: Set<string> = new Set();

  private constructor() {
    this.setupGlobalHandlers();
  }

  public static getInstance(): NetworkErrorHandler {
    if (!NetworkErrorHandler.instance) {
      NetworkErrorHandler.instance = new NetworkErrorHandler();
    }
    return NetworkErrorHandler.instance;
  }

  private setupGlobalHandlers() {
    // Override fetch to handle blocked requests gracefully
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        return await originalFetch(...args);
      } catch (error: any) {
        const url = args[0]?.toString() || 'unknown';

        // Check if this is a blocked analytics request
        if (this.isAnalyticsRequest(url) || this.isBlockedRequest(error)) {
          console.warn(`[NetworkErrorHandler] Analytics request blocked: ${url}`);
          this.blockedRequests.add(url);

          // Return a mock successful response for analytics requests
          return new Response('{}', {
            status: 200,
            statusText: 'OK',
            headers: { 'Content-Type': 'application/json' }
          });
        }

        throw error;
      }
    };

    // Handle XMLHttpRequest errors
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
      const urlString = url.toString();

      if (NetworkErrorHandler.getInstance().isAnalyticsRequest(urlString)) {
        console.warn(`[NetworkErrorHandler] Analytics XHR request intercepted: ${urlString}`);

        // Override error handler for analytics requests
        this.addEventListener('error', (event) => {
          console.warn(`[NetworkErrorHandler] Analytics XHR error handled gracefully`);
          event.stopPropagation();
        });
      }

      return originalXHROpen.call(this, method, url, async ?? true, user ?? null, password ?? null);
    };
  }

  private isAnalyticsRequest(url: string): boolean {
    const analyticsPatterns = [
      'google-analytics.com',
      'googletagmanager.com',
      'analytics.google.com',
      'gtag',
      'ga.js',
      'analytics.js',
      'gtm.js'
    ];

    return analyticsPatterns.some(pattern => url.includes(pattern));
  }

  private isBlockedRequest(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    const blockedPatterns = [
      'blocked',
      'network error',
      'failed to fetch',
      'cors',
      'content security policy'
    ];

    return blockedPatterns.some(pattern => errorMessage.includes(pattern));
  }

  public getBlockedRequests(): string[] {
    return Array.from(this.blockedRequests);
  }

  public clearBlockedRequests(): void {
    this.blockedRequests.clear();
  }
}

// Initialize the network error handler
export const initializeNetworkErrorHandler = () => {
  NetworkErrorHandler.getInstance();
  console.log('[NetworkErrorHandler] Initialized network error handling');
};

export default NetworkErrorHandler;
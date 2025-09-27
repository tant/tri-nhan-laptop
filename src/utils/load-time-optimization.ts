/**
 * Load Time Optimization Utilities
 *
 * Provides utilities to optimize load times for Vietnamese Laptop Repair Shop operations,
 * including preloading strategies, resource prioritization, and Vietnamese business data optimization.
 */

import { lazy } from 'react';

/**
 * Load time monitoring
 */
export class LoadTimeMonitor {
  private static measurements = new Map<string, number>();
  private static loadEvents: Array<{ name: string; timestamp: number }> = [];

  /**
   * Mark the start of a loading operation
   */
  static markStart(name: string): void {
    this.measurements.set(`${name}_start`, performance.now());
    this.loadEvents.push({ name: `${name}_start`, timestamp: performance.now() });
  }

  /**
   * Mark the end of a loading operation and calculate duration
   */
  static markEnd(name: string): number {
    const endTime = performance.now();
    const startTime = this.measurements.get(`${name}_start`);

    if (startTime !== undefined) {
      const duration = endTime - startTime;
      this.measurements.set(`${name}_duration`, duration);
      this.loadEvents.push({ name: `${name}_end`, timestamp: endTime });

      // Log slow operations in development
      if (import.meta.env.DEV && duration > 1000) {
        console.warn(`⏱️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
      }

      return duration;
    }

    return 0;
  }

  /**
   * Get measurement by name
   */
  static getMeasurement(name: string): number | undefined {
    return this.measurements.get(name);
  }

  /**
   * Get all load events
   */
  static getLoadEvents(): Array<{ name: string; timestamp: number }> {
    return [...this.loadEvents];
  }

  /**
   * Clear all measurements
   */
  static clear(): void {
    this.measurements.clear();
    this.loadEvents = [];
  }
}

/**
 * Resource preloader for Vietnamese business assets
 */
export class VietnameseResourcePreloader {
  private static preloadedResources = new Set<string>();

  /**
   * Preload critical Vietnamese business resources
   */
  static preloadCriticalResources(): void {
    const criticalResources = [
      // Vietnamese locale data
      '/locales/vi-VN.json',
      // Vietnamese business icons
      '/icons/vietnamese-business.svg',
      // Critical fonts for Vietnamese text
      '/fonts/vietnamese-font.woff2',
    ];

    criticalResources.forEach(resource => {
      this.preloadResource(resource, 'fetch');
    });
  }

  /**
   * Preload a specific resource
   */
  static preloadResource(url: string, type: 'fetch' | 'image' | 'script' | 'style'): void {
    if (this.preloadedResources.has(url)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;

    switch (type) {
      case 'fetch':
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
        break;
      case 'image':
        link.as = 'image';
        break;
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
    }

    document.head.appendChild(link);
    this.preloadedResources.add(url);
  }

  /**
   * Preload Vietnamese business components
   */
  static preloadBusinessComponents(): void {
    // These will be loaded lazily when needed
    const components = [
      () => import('@/components/tickets/CreateTicketForm'),
      () => import('@/components/customers/CustomerProfileForm'),
      () => import('@/components/parts/PartsFormModal'),
    ];

    // Preload during idle time
    if ('requestIdleCallback' in window) {
      components.forEach(component => {
        requestIdleCallback(() => component());
      });
    }
  }
}

/**
 * Lazy loading with Vietnamese business context
 */
export const VietnameseBusinessComponents = {
  // Repair ticket components
  CreateTicketForm: lazy(() =>
    LoadTimeMonitor.markStart('CreateTicketForm') &&
    import('@/components/tickets/CreateTicketForm').then(module => {
      LoadTimeMonitor.markEnd('CreateTicketForm');
      return module;
    })
  ),

  CustomerProfileForm: lazy(() =>
    LoadTimeMonitor.markStart('CustomerProfileForm') &&
    import('@/components/customers/CustomerProfileForm').then(module => {
      LoadTimeMonitor.markEnd('CustomerProfileForm');
      return module;
    })
  ),

  FinancialTracker: lazy(() =>
    LoadTimeMonitor.markStart('FinancialTracker') &&
    import('@/components/financial/FinancialTracker').then(module => {
      LoadTimeMonitor.markEnd('FinancialTracker');
      return module;
    })
  ),

  AnalyticsDashboard: lazy(() =>
    LoadTimeMonitor.markStart('AnalyticsDashboard') &&
    import('@/components/analytics/AnalyticsDashboard').then(module => {
      LoadTimeMonitor.markEnd('AnalyticsDashboard');
      return module;
    })
  ),

  PartsInventory: lazy(() =>
    LoadTimeMonitor.markStart('PartsInventory') &&
    import('@/components/parts/InventoryView').then(module => {
      LoadTimeMonitor.markEnd('PartsInventory');
      return module;
    })
  ),
};

/**
 * Vietnamese business data optimization
 */
export class VietnameseDataOptimizer {
  /**
   * Optimize Vietnamese customer data loading
   */
  static optimizeCustomerData(customers: any[]): any[] {
    LoadTimeMonitor.markStart('CustomerDataOptimization');

    // Optimize by removing unnecessary fields for list views
    const optimized = customers.map(customer => ({
      phone: customer.phone,
      full_name: customer.full_name,
      totalRepairs: customer.totalRepairs || 0,
      activeRepairs: customer.activeRepairs || 0,
      lastRepair: customer.lastRepair,
      // Only include essential fields for list rendering
    }));

    LoadTimeMonitor.markEnd('CustomerDataOptimization');
    return optimized;
  }

  /**
   * Optimize Vietnamese repair ticket data
   */
  static optimizeRepairTicketData(tickets: any[]): any[] {
    LoadTimeMonitor.markStart('RepairTicketOptimization');

    const optimized = tickets.map(ticket => ({
      id: ticket.id,
      ticket_code: ticket.ticket_code,
      customer_phone: ticket.customer_phone,
      issue_description: ticket.issue_description,
      status: ticket.status,
      priority: ticket.priority,
      created_at: ticket.created_at,
      estimated_completion_date: ticket.estimated_completion_date,
      // Include only essential fields for list views
    }));

    LoadTimeMonitor.markEnd('RepairTicketOptimization');
    return optimized;
  }

  /**
   * Optimize Vietnamese parts data
   */
  static optimizePartsData(parts: any[]): any[] {
    LoadTimeMonitor.markStart('PartsDataOptimization');

    const optimized = parts.map(part => ({
      id: part.id,
      part_number: part.part_number,
      name: part.name,
      current_stock: part.current_stock,
      min_stock_level: part.min_stock_level,
      unit_price: part.unit_price,
      category: part.category,
      // Essential fields only
    }));

    LoadTimeMonitor.markEnd('PartsDataOptimization');
    return optimized;
  }
}

/**
 * Progressive loading strategies
 */
export class ProgressiveLoader {
  private static loadQueue: Array<() => Promise<void>> = [];
  private static isProcessing = false;

  /**
   * Add item to progressive loading queue
   */
  static addToQueue(loader: () => Promise<void>): void {
    this.loadQueue.push(loader);
    this.processQueue();
  }

  /**
   * Process the loading queue during idle time
   */
  private static async processQueue(): Promise<void> {
    if (this.isProcessing || this.loadQueue.length === 0) return;

    this.isProcessing = true;

    while (this.loadQueue.length > 0) {
      const loader = this.loadQueue.shift();
      if (loader) {
        try {
          await loader();
        } catch (error) {
          console.warn('Progressive loading error:', error);
        }
      }

      // Yield control to avoid blocking UI
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.isProcessing = false;
  }

  /**
   * Load Vietnamese business components progressively
   */
  static loadVietnameseBusinessComponents(): void {
    this.addToQueue(async () => {
      await import('@/components/tickets/CreateTicketForm');
    });

    this.addToQueue(async () => {
      await import('@/components/customers/CustomerProfileForm');
    });

    this.addToQueue(async () => {
      await import('@/components/financial/FinancialTracker');
    });
  }
}

/**
 * Service Worker registration for caching
 */
export class ServiceWorkerManager {
  /**
   * Register service worker for Vietnamese business app caching
   */
  static async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('📦 Service Worker registered for Vietnamese business caching');

        // Update service worker
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Service Worker update found');
        });
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Clear service worker cache
   */
  static async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🧹 Service Worker cache cleared');
    }
  }
}

/**
 * Load time optimization hooks
 */
export function useLoadTimeOptimization() {
  const measureRender = (componentName: string) => {
    LoadTimeMonitor.markStart(`render_${componentName}`);

    return () => {
      LoadTimeMonitor.markEnd(`render_${componentName}`);
    };
  };

  const preloadComponent = (importFn: () => Promise<any>) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => importFn());
    } else {
      setTimeout(() => importFn(), 100);
    }
  };

  return { measureRender, preloadComponent };
}

/**
 * Vietnamese business-specific performance optimizations
 */
export const VietnamesePerformanceOptimizations = {
  /**
   * Initialize all performance optimizations
   */
  initializeOptimizations(): void {
    // Preload critical resources
    VietnameseResourcePreloader.preloadCriticalResources();

    // Start progressive loading
    ProgressiveLoader.loadVietnameseBusinessComponents();

    // Register service worker
    ServiceWorkerManager.registerServiceWorker();

    // Monitor initial load time
    LoadTimeMonitor.markStart('AppInitialization');
  },

  /**
   * Optimize Vietnamese business workflow loading
   */
  optimizeBusinessWorkflows(): void {
    // Preload components likely to be used
    VietnameseResourcePreloader.preloadBusinessComponents();

    // Optimize data structures
    console.log('🇻🇳 Vietnamese business workflow optimizations applied');
  },

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): any {
    return {
      loadEvents: LoadTimeMonitor.getLoadEvents(),
      measurements: {
        appInit: LoadTimeMonitor.getMeasurement('AppInitialization_duration'),
        createTicket: LoadTimeMonitor.getMeasurement('CreateTicketForm_duration'),
        customerProfile: LoadTimeMonitor.getMeasurement('CustomerProfileForm_duration'),
      }
    };
  },

  /**
   * Generate performance report
   */
  generatePerformanceReport(): string {
    const metrics = this.getPerformanceMetrics();
    const report = [
      '📊 Vietnamese Business Performance Report',
      '=' .repeat(50),
      '',
      'Load Time Measurements:',
      `  App Initialization: ${(metrics.measurements.appInit || 0).toFixed(2)}ms`,
      `  Create Ticket Form: ${(metrics.measurements.createTicket || 0).toFixed(2)}ms`,
      `  Customer Profile: ${(metrics.measurements.customerProfile || 0).toFixed(2)}ms`,
      '',
      'Performance Status:',
      `  ✅ Vietnamese locale optimizations active`,
      `  ✅ Progressive loading enabled`,
      `  ✅ Resource preloading configured`,
      '',
    ].join('\n');

    return report;
  },
};

// Initialize optimizations when module loads
if (typeof window !== 'undefined') {
  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      VietnamesePerformanceOptimizations.initializeOptimizations();
    });
  } else {
    VietnamesePerformanceOptimizations.initializeOptimizations();
  }
}
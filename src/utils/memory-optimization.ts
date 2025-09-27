/**
 * Memory Optimization Utilities
 *
 * Provides memory management utilities specifically for Vietnamese Laptop Repair Shop
 * operations, including Vietnamese business data caching and component lifecycle optimization.
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Memory usage monitoring for development
 */
export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private measurements: Array<{ timestamp: number; used: number; total: number }> = [];
  private isMonitoring = false;

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  /**
   * Start monitoring memory usage
   */
  startMonitoring(intervalMs = 5000): void {
    if (this.isMonitoring || typeof window === 'undefined') return;

    this.isMonitoring = true;
    const monitor = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.measurements.push({
          timestamp: Date.now(),
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
        });

        // Keep only last 100 measurements
        if (this.measurements.length > 100) {
          this.measurements = this.measurements.slice(-100);
        }
      }

      if (this.isMonitoring) {
        setTimeout(monitor, intervalMs);
      }
    };

    monitor();
  }

  /**
   * Stop monitoring memory usage
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  /**
   * Get current memory usage
   */
  getCurrentUsage(): { used: number; total: number } | null {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return null;
    }

    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
    };
  }

  /**
   * Get memory usage history
   */
  getUsageHistory(): Array<{ timestamp: number; used: number; total: number }> {
    return [...this.measurements];
  }

  /**
   * Check if memory usage is concerning
   */
  isMemoryUsageConcerning(): boolean {
    const current = this.getCurrentUsage();
    if (!current) return false;

    // Consider concerning if using more than 80% of available heap
    return current.used / current.total > 0.8;
  }
}

/**
 * Vietnamese business data cache with memory optimization
 */
export class VietnameseDataCache {
  private static instance: VietnameseDataCache;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize = 100; // Maximum cache entries
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): VietnameseDataCache {
    if (!VietnameseDataCache.instance) {
      VietnameseDataCache.instance = new VietnameseDataCache();
    }
    return VietnameseDataCache.instance;
  }

  /**
   * Set cached data with TTL
   */
  set(key: string, data: any, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Get cached data if still valid
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if data has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // TODO: Implement hit rate tracking
    };
  }
}

/**
 * Hook for optimizing component memory usage
 */
export function useMemoryOptimization() {
  const cleanupFunctions = useRef<Array<() => void>>([]);

  /**
   * Register a cleanup function to run on unmount
   */
  const registerCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.push(cleanup);
  }, []);

  /**
   * Clean up event listeners and subscriptions
   */
  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.warn('Error during memory cleanup:', error);
        }
      });
      cleanupFunctions.current = [];
    };
  }, []);

  return { registerCleanup };
}

/**
 * Hook for Vietnamese business data with memory-efficient caching
 */
export function useVietnameseDataCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; enabled?: boolean } = {}
) {
  const cache = VietnameseDataCache.getInstance();
  const { enabled = true, ttl } = options;

  const getCachedData = useCallback(async (): Promise<T> => {
    if (!enabled) {
      return fetcher();
    }

    // Try to get from cache first
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }

    // Fetch fresh data and cache it
    const data = await fetcher();
    cache.set(key, data, ttl);
    return data;
  }, [key, fetcher, enabled, ttl, cache]);

  return { getCachedData, clearCache: () => cache.clear() };
}

/**
 * Vietnamese phone number validation with memoization
 */
const phoneValidationCache = new Map<string, boolean>();

export function validateVietnamesePhoneMemoized(phone: string): boolean {
  // Check cache first
  if (phoneValidationCache.has(phone)) {
    return phoneValidationCache.get(phone)!;
  }

  // Perform validation
  const isValid = /^(0[3-9]|84[3-9]|1[8-9])\d{8,9}$/.test(phone);

  // Cache result (limit cache size)
  if (phoneValidationCache.size >= 1000) {
    const firstKey = phoneValidationCache.keys().next().value;
    phoneValidationCache.delete(firstKey);
  }

  phoneValidationCache.set(phone, isValid);
  return isValid;
}

/**
 * Vietnamese currency formatting with memoization
 */
const currencyFormatCache = new Map<number, string>();

export function formatVietnameseCurrencyMemoized(amount: number): string {
  // Check cache first
  if (currencyFormatCache.has(amount)) {
    return currencyFormatCache.get(amount)!;
  }

  // Perform formatting
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);

  // Cache result (limit cache size)
  if (currencyFormatCache.size >= 500) {
    const firstKey = currencyFormatCache.keys().next().value;
    currencyFormatCache.delete(firstKey);
  }

  currencyFormatCache.set(amount, formatted);
  return formatted;
}

/**
 * Debounced function for memory-efficient search
 */
export function createMemoryEfficientDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout;
  let result: ReturnType<T>;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      result = func(...args);
    }, wait);

    return result;
  }) as T;
}

/**
 * Memory usage hook for components
 */
export function useMemoryUsage() {
  const monitor = MemoryMonitor.getInstance();

  useEffect(() => {
    monitor.startMonitoring();
    return () => monitor.stopMonitoring();
  }, [monitor]);

  const getCurrentUsage = useCallback(() => {
    return monitor.getCurrentUsage();
  }, [monitor]);

  const isUsageConcerning = useCallback(() => {
    return monitor.isMemoryUsageConcerning();
  }, [monitor]);

  return { getCurrentUsage, isUsageConcerning };
}

/**
 * Virtual scrolling utilities for large Vietnamese business data lists
 */
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function calculateVirtualScrollParams(
  totalItems: number,
  scrollTop: number,
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options;

  const visibleItems = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleItems + overscan * 2);

  return {
    startIndex,
    endIndex,
    visibleItems,
    totalHeight: totalItems * itemHeight,
    offsetY: startIndex * itemHeight,
  };
}

/**
 * Memory optimization strategies
 */
export const MemoryOptimizationStrategies = {
  /**
   * Clean up Vietnamese business data caches
   */
  cleanupVietnameseDataCaches(): void {
    VietnameseDataCache.getInstance().clearExpired();

    // Clear phone validation cache if too large
    if (phoneValidationCache.size > 1000) {
      phoneValidationCache.clear();
    }

    // Clear currency format cache if too large
    if (currencyFormatCache.size > 500) {
      currencyFormatCache.clear();
    }
  },

  /**
   * Force garbage collection in development
   */
  forceGarbageCollection(): void {
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
  },

  /**
   * Get memory optimization recommendations
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const monitor = MemoryMonitor.getInstance();
    const cache = VietnameseDataCache.getInstance();

    if (monitor.isMemoryUsageConcerning()) {
      recommendations.push('High memory usage detected - consider reducing data cache size');
    }

    const cacheStats = cache.getStats();
    if (cacheStats.size >= cacheStats.maxSize * 0.8) {
      recommendations.push('Vietnamese data cache is nearly full - consider increasing TTL or reducing cache size');
    }

    if (phoneValidationCache.size > 800) {
      recommendations.push('Phone validation cache is large - consider clearing or reducing retention');
    }

    return recommendations;
  },
};

// Initialize memory monitoring in development
if (import.meta.env.DEV) {
  MemoryMonitor.getInstance().startMonitoring();

  // Clean up caches periodically
  setInterval(() => {
    MemoryOptimizationStrategies.cleanupVietnameseDataCaches();
  }, 60000); // Every minute
}
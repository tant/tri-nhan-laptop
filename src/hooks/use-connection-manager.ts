/**
 * Connection Manager Hook
 * Handles automatic reconnection, network state monitoring, and connection quality management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export interface NetworkState {
  online: boolean;
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}

export interface ConnectionMetrics {
  latency: number;
  jitter: number;
  packet_loss: number;
  throughput: number;
  quality_score: number;
  quality_grade: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  last_measured: string;
}

export interface ReconnectionConfig {
  enabled: boolean;
  max_attempts: number;
  initial_delay: number;
  max_delay: number;
  backoff_multiplier: number;
  jitter: boolean;
}

export interface ConnectionHistory {
  timestamp: string;
  event: 'connected' | 'disconnected' | 'reconnecting' | 'failed' | 'degraded';
  latency?: number;
  error?: string;
  duration?: number;
}

export function useConnectionManager() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    online: navigator.onLine
  });
  const [connectionMetrics, setConnectionMetrics] = useState<ConnectionMetrics>({
    latency: 0,
    jitter: 0,
    packet_loss: 0,
    throughput: 0,
    quality_score: 0,
    quality_grade: 'good',
    last_measured: ''
  });
  const [connectionHistory, setConnectionHistory] = useState<ConnectionHistory[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectionAttempts, setReconnectionAttempts] = useState(0);

  // Configuration
  const reconnectionConfig: ReconnectionConfig = {
    enabled: true,
    max_attempts: 10,
    initial_delay: 1000, // 1 second
    max_delay: 30000, // 30 seconds
    backoff_multiplier: 1.5,
    jitter: true
  };

  // Refs for intervals and timeouts
  const reconnectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const latencyHistoryRef = useRef<number[]>([]);

  // Vietnamese status messages
  const getConnectionMessage = (event: ConnectionHistory['event']): string => {
    switch (event) {
      case 'connected': return 'Đã kết nối thành công';
      case 'disconnected': return 'Mất kết nối';
      case 'reconnecting': return 'Đang thử kết nối lại';
      case 'failed': return 'Kết nối thất bại';
      case 'degraded': return 'Chất lượng kết nối giảm';
      default: return 'Trạng thái không xác định';
    }
  };

  // Add connection event to history
  const addConnectionEvent = useCallback((
    event: ConnectionHistory['event'],
    details?: { latency?: number; error?: string; duration?: number }
  ) => {
    const historyEntry: ConnectionHistory = {
      timestamp: new Date().toISOString(),
      event,
      ...details
    };

    setConnectionHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Keep last 50 events

    // Emit custom event for UI notifications
    window.dispatchEvent(new CustomEvent('connection-event', {
      detail: {
        ...historyEntry,
        message: getConnectionMessage(event)
      }
    }));
  }, []);

  // Measure connection latency
  const measureLatency = useCallback(async (): Promise<number> => {
    try {
      const start = Date.now();

      // Use a simple query to measure response time
      await supabase
        .from('repair_tickets')
        .select('id')
        .limit(1);

      const latency = Date.now() - start;

      // Update latency history for jitter calculation
      latencyHistoryRef.current.push(latency);
      if (latencyHistoryRef.current.length > 10) {
        latencyHistoryRef.current = latencyHistoryRef.current.slice(-10);
      }

      return latency;
    } catch (error) {
      return 9999; // High latency indicates connection problems
    }
  }, []);

  // Calculate connection quality metrics
  const calculateMetrics = useCallback(async () => {
    const latency = await measureLatency();
    const latencyHistory = latencyHistoryRef.current;

    // Calculate jitter (standard deviation of latency)
    const jitter = latencyHistory.length > 1 ?
      Math.sqrt(
        latencyHistory
          .map(l => Math.pow(l - latency, 2))
          .reduce((a, b) => a + b, 0) / latencyHistory.length
      ) : 0;

    // Estimate packet loss based on failed requests
    const packet_loss = latency > 5000 ? 10 : latency > 2000 ? 5 : 0;

    // Estimate throughput based on latency
    const throughput = latency < 100 ? 100 :
                       latency < 300 ? 50 :
                       latency < 1000 ? 25 : 10;

    // Calculate quality score (0-100)
    const latency_score = Math.max(0, 100 - latency / 10);
    const jitter_score = Math.max(0, 100 - jitter / 5);
    const loss_score = Math.max(0, 100 - packet_loss * 10);
    const quality_score = (latency_score + jitter_score + loss_score) / 3;

    // Determine quality grade
    const quality_grade: ConnectionMetrics['quality_grade'] =
      quality_score >= 90 ? 'excellent' :
      quality_score >= 75 ? 'good' :
      quality_score >= 60 ? 'fair' :
      quality_score >= 40 ? 'poor' : 'critical';

    const metrics: ConnectionMetrics = {
      latency,
      jitter,
      packet_loss,
      throughput,
      quality_score,
      quality_grade,
      last_measured: new Date().toISOString()
    };

    setConnectionMetrics(metrics);

    // Check for degraded connection
    if (quality_grade === 'poor' || quality_grade === 'critical') {
      addConnectionEvent('degraded', { latency });
    }

    return metrics;
  }, [measureLatency, addConnectionEvent]);

  // Test connection health
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const startTime = Date.now();

      // Test database connectivity
      const { error } = await supabase
        .from('repair_tickets')
        .select('id')
        .limit(1);

      if (error) throw error;

      const duration = Date.now() - startTime;
      setIsConnected(true);

      return true;
    } catch (error) {
      setIsConnected(false);
      console.error('Connection test failed:', error);
      return false;
    }
  }, []);

  // Calculate reconnection delay with exponential backoff
  const calculateReconnectionDelay = useCallback((attempt: number): number => {
    const { initial_delay, max_delay, backoff_multiplier, jitter } = reconnectionConfig;

    let delay = initial_delay * Math.pow(backoff_multiplier, attempt);
    delay = Math.min(delay, max_delay);

    if (jitter) {
      // Add random jitter ±25%
      const jitterAmount = delay * 0.25;
      delay += (Math.random() * 2 - 1) * jitterAmount;
    }

    return Math.floor(delay);
  }, [reconnectionConfig]);

  // Attempt reconnection
  const attemptReconnection = useCallback(async () => {
    if (!reconnectionConfig.enabled ||
        reconnectionAttempts >= reconnectionConfig.max_attempts) {
      return;
    }

    setIsReconnecting(true);
    setReconnectionAttempts(prev => prev + 1);

    addConnectionEvent('reconnecting');

    try {
      const connected = await testConnection();

      if (connected) {
        setIsReconnecting(false);
        setReconnectionAttempts(0);
        addConnectionEvent('connected');

        // Resume health checks
        startHealthCheck();
        return;
      }

      // Schedule next attempt
      const delay = calculateReconnectionDelay(reconnectionAttempts);

      reconnectionTimeoutRef.current = setTimeout(() => {
        attemptReconnection();
      }, delay);

    } catch (error) {
      addConnectionEvent('failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Schedule next attempt
      const delay = calculateReconnectionDelay(reconnectionAttempts);

      reconnectionTimeoutRef.current = setTimeout(() => {
        attemptReconnection();
      }, delay);
    }
  }, [
    reconnectionAttempts,
    reconnectionConfig,
    testConnection,
    calculateReconnectionDelay,
    addConnectionEvent
  ]);

  // Handle connection lost
  const handleConnectionLost = useCallback(() => {
    setIsConnected(false);
    addConnectionEvent('disconnected');

    // Stop health checks
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
    }

    // Start reconnection process
    if (reconnectionConfig.enabled) {
      setTimeout(() => {
        attemptReconnection();
      }, reconnectionConfig.initial_delay);
    }
  }, [attemptReconnection, addConnectionEvent, reconnectionConfig]);

  // Start periodic health checks
  const startHealthCheck = useCallback(() => {
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
    }

    healthCheckIntervalRef.current = setInterval(async () => {
      const connected = await testConnection();

      if (!connected && isConnected) {
        handleConnectionLost();
      }
    }, 10000); // Check every 10 seconds
  }, [testConnection, isConnected, handleConnectionLost]);

  // Start periodic metrics collection
  const startMetricsCollection = useCallback(() => {
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
    }

    metricsIntervalRef.current = setInterval(() => {
      calculateMetrics();
    }, 30000); // Collect metrics every 30 seconds
  }, [calculateMetrics]);

  // Monitor network state changes
  useEffect(() => {
    const handleOnline = () => {
      setNetworkState(prev => ({ ...prev, online: true }));

      if (!isConnected) {
        // Network came back online, test connection
        testConnection().then(connected => {
          if (connected) {
            setIsConnected(true);
            addConnectionEvent('connected');
            startHealthCheck();
          }
        });
      }
    };

    const handleOffline = () => {
      setNetworkState(prev => ({ ...prev, online: false }));
      handleConnectionLost();
    };

    // Monitor network state changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitor connection quality if supported
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      const updateNetworkInfo = () => {
        setNetworkState({
          online: navigator.onLine,
          downlink: connection.downlink,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData
        });
      };

      connection.addEventListener('change', updateNetworkInfo);
      updateNetworkInfo(); // Initial update

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected, testConnection, addConnectionEvent, handleConnectionLost, startHealthCheck]);

  // Initialize connection monitoring
  useEffect(() => {
    // Initial connection test
    testConnection().then(connected => {
      if (connected) {
        addConnectionEvent('connected');
        startHealthCheck();
        startMetricsCollection();
      } else {
        handleConnectionLost();
      }
    });

    return () => {
      // Cleanup intervals
      if (reconnectionTimeoutRef.current) {
        clearTimeout(reconnectionTimeoutRef.current);
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, [testConnection, addConnectionEvent, handleConnectionLost, startHealthCheck, startMetricsCollection]);

  // Manual reconnection
  const reconnect = useCallback(async () => {
    // Cancel any existing reconnection attempts
    if (reconnectionTimeoutRef.current) {
      clearTimeout(reconnectionTimeoutRef.current);
    }

    setReconnectionAttempts(0);
    await attemptReconnection();
  }, [attemptReconnection]);

  // Get connection status summary
  const getConnectionStatus = useCallback(() => {
    return {
      connected: isConnected,
      reconnecting: isReconnecting,
      network_online: networkState.online,
      quality: connectionMetrics.quality_grade,
      latency: connectionMetrics.latency,
      attempts: reconnectionAttempts,
      max_attempts: reconnectionConfig.max_attempts,
      last_event: connectionHistory[0]
    };
  }, [
    isConnected,
    isReconnecting,
    networkState.online,
    connectionMetrics,
    reconnectionAttempts,
    reconnectionConfig.max_attempts,
    connectionHistory
  ]);

  return {
    // State
    networkState,
    connectionMetrics,
    connectionHistory,
    isConnected,
    isReconnecting,
    reconnectionAttempts,

    // Actions
    testConnection,
    reconnect,
    measureLatency,
    calculateMetrics,

    // Status
    getConnectionStatus,

    // Utilities
    getConnectionMessage,

    // Configuration
    maxReconnectionAttempts: reconnectionConfig.max_attempts,
    canRetry: reconnectionAttempts < reconnectionConfig.max_attempts
  };
}
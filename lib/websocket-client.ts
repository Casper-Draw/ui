/**
 * WebSocket Client Hook for Listening to Randomness Fulfillment
 *
 * Usage: useWaitForFulfillment(requestId)
 * - Connects to backend WebSocket
 * - Listens for Fulfilled event for specific request_id
 * - Auto-disconnects after fulfilled or 2-minute timeout
 */

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

interface FulfilledEvent {
  requestId: string;
  randomness: string;
  timestamp: string;
}

interface UseWaitForFulfillmentResult {
  isFulfilled: boolean;
  isWaiting: boolean;
  isTimedOut: boolean;
}

/**
 * Hook to wait for randomness fulfillment for a specific request_id
 *
 * @param requestId - The request_id to listen for (e.g., "0x1f")
 * @param enabled - Whether to start listening (default: true)
 * @returns Object with isFulfilled, isWaiting, isTimedOut flags
 */
export function useWaitForFulfillment(
  requestId: string | null,
  enabled: boolean = true
): UseWaitForFulfillmentResult {
  const [isFulfilled, setIsFulfilled] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Don't connect if disabled or no requestId
    if (!enabled || !requestId) {
      setIsWaiting(false);
      return;
    }

    setIsFulfilled(false);
    setIsTimedOut(false);

    console.log(`[WS] Connecting to wait for fulfillment of request_id: ${requestId}`);
    setIsWaiting(true);

    // Create socket connection
    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[WS] Connected, subscribing to request_id: ${requestId}`);
      socket.emit('subscribe', requestId);
    });

    socket.on('fulfilled', (data: FulfilledEvent) => {
      console.log(`[WS] Fulfilled event received:`, data);
      setIsFulfilled(true);
      setIsWaiting(false);
      socketRef.current = null;
      socket.disconnect();
    });

    socket.on('timeout', () => {
      console.log(`[WS] Timeout waiting for request_id: ${requestId}`);
      setIsTimedOut(true);
      setIsWaiting(false);
      socketRef.current = null;
      socket.disconnect();
    });

    socket.on('disconnect', () => {
      console.log('[WS] Disconnected from fulfillment server');
      setIsWaiting(false);
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    });

    socket.on('connect_error', (error) => {
      console.error('[WS] Connection error:', error);
      setIsWaiting(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log('[WS] Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsWaiting(false);
    };
  }, [requestId, enabled]);

  return {
    isFulfilled,
    isWaiting,
    isTimedOut,
  };
}

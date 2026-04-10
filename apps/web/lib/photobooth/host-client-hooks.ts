"use client";

import { useCallback, useEffect, useState } from "react";
import type { PhotoboothSession, PhotoboothStatus } from "./contracts";
import type { EventHandler } from "./host-client";
import {
  capture,
  connectToEvents,
  disconnectFromEvents,
  getPhotoboothSessionById,
  getPhotoboothStatus,
  resetSession,
} from "./host-client";

export function usePhotoboothStatus(pollInterval = 2000): {
  status: PhotoboothStatus | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [status, setStatus] = useState<PhotoboothStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getPhotoboothStatus();
      setStatus(data);
      setError(data ? null : new Error("Booth host unavailable"));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch status"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    const interval = setInterval(fetchStatus, pollInterval);
    return () => clearInterval(interval);
  }, [fetchStatus, pollInterval]);

  return { status, isLoading, error, refresh: fetchStatus };
}

export function usePhotoboothSession(sessionId: string | null): {
  session: PhotoboothSession | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  capture: () => Promise<PhotoboothSession | null>;
  reset: () => Promise<PhotoboothSession | null>;
} {
  const [session, setSession] = useState<PhotoboothSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const data = await getPhotoboothSessionById(sessionId);
      setSession(data);
      setError(data ? null : new Error("Session unavailable"));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch session"));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleCapture = useCallback(async () => {
    if (!sessionId) return null;
    return await capture(sessionId);
  }, [sessionId]);

  const handleReset = useCallback(async () => {
    if (!sessionId) return null;
    return await resetSession(sessionId);
  }, [sessionId]);

  return {
    session,
    isLoading,
    error,
    refresh: fetchSession,
    capture: handleCapture,
    reset: handleReset,
  };
}

export function usePhotoboothEvents(onEvent: EventHandler): {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
} {
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    connectToEvents({
      onEvent,
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
    });
  }, [onEvent]);

  const disconnect = useCallback(() => {
    disconnectFromEvents();
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { isConnected, connect, disconnect };
}

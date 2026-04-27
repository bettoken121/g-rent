'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRealtimeStore } from './store';
import { GPSPosition, Vehicle } from '@g-rent/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const setVehicleUpdate = useRealtimeStore((s) => s.setVehicleUpdate);
  const addPosition = useRealtimeStore((s) => s.addPosition);

  useEffect(() => {
    if (socketRef.current) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[WS] Connected:', socket.id);
    });

    socket.on('position', (data: GPSPosition) => {
      addPosition(data);
    });

    socket.on('vehicleUpdate', (vehicle: Vehicle) => {
      setVehicleUpdate(vehicle.id, vehicle);
    });

    socket.on('disconnect', (reason) => {
      console.log('[WS] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[WS] Connection error:', err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [setVehicleUpdate, addPosition]);
}

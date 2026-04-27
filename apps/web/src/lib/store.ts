import { create } from 'zustand';
import { Vehicle, GPSPosition } from '@g-rent/types';

interface RealtimeState {
  vehicleUpdates: Record<string, Partial<Vehicle>>;
  positions: GPSPosition[];
  setVehicleUpdate: (id: string, data: Partial<Vehicle>) => void;
  addPosition: (position: GPSPosition) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  vehicleUpdates: {},
  positions: [],
  setVehicleUpdate: (id, data) =>
    set((state) => ({
      vehicleUpdates: {
        ...state.vehicleUpdates,
        [id]: { ...state.vehicleUpdates[id], ...data },
      },
    })),
  addPosition: (position) =>
    set((state) => ({
      positions: [...state.positions.slice(-99), position],
    })),
}));

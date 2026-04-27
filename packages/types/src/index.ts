export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  status: VehicleStatus;
  pricePerDay: number;
  imageUrl?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  currentSpeed?: number;
  lastPositionAt?: string;
  gpsDeviceId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum VehicleStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline',
}

export interface GPSDevice {
  id: string;
  imei: string;
  vehicleId?: string;
  isActive: boolean;
  lastSeenAt?: string;
  createdAt: string;
}

export interface PositionLog {
  id: string;
  deviceId: string;
  vehicleId?: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
  rawData?: string;
  createdAt: string;
}

export interface Rental {
  id: string;
  vehicleId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  pricePerDay: number;
  totalPrice: number;
  status: RentalStatus;
  createdAt: string;
  updatedAt: string;
}

export enum RentalStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface GPSPosition {
  imei: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: Date;
}

export interface PricingTier {
  minDays: number;
  maxDays: number;
  pricePerDay: number;
}

export interface CreateRentalDto {
  vehicleId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
}

export interface GPSIngestDto {
  imei: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
}

export interface WebSocketEvents {
  position: GPSPosition;
  vehicleUpdate: Vehicle;
}

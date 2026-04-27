'use client';

import { useQuery } from '@tanstack/react-query';
import { Vehicle } from '@g-rent/types';
import { VehicleCard } from '@/components/vehicle-card';
import { api } from '@/lib/api';
import { useRealtimeStore } from '@/lib/store';
import { useSocket } from '@/lib/use-socket';

export default function DashboardPage() {
  useSocket();

  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/vehicles').then((r) => r.data),
    refetchInterval: 10000,
  });

  const vehicleUpdates = useRealtimeStore((s) => s.vehicleUpdates);

  const mergedVehicles = vehicles?.map((v) => ({
    ...v,
    ...vehicleUpdates[v.id],
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Real-time fleet overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Vehicles"
          value={mergedVehicles?.length ?? 0}
          color="blue"
        />
        <StatCard
          title="Available"
          value={mergedVehicles?.filter((v) => v.status === 'available').length ?? 0}
          color="green"
        />
        <StatCard
          title="Rented"
          value={mergedVehicles?.filter((v) => v.status === 'rented').length ?? 0}
          color="orange"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-500">Loading vehicles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mergedVehicles?.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-75">{title}</p>
      <p className="text-4xl font-bold mt-1">{value}</p>
    </div>
  );
}

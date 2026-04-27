'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Vehicle } from '@g-rent/types';
import { api } from '@/lib/api';
import { RentalForm } from '@/components/rental-form';
import { useSocket } from '@/lib/use-socket';
import { useRealtimeStore } from '@/lib/store';

export default function CarPage() {
  useSocket();
  const params = useParams();
  const id = params.id as string;

  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: ['vehicle', id],
    queryFn: () => api.get(`/vehicles/${id}`).then((r) => r.data),
  });

  const vehicleUpdate = useRealtimeStore((s) => s.vehicleUpdates[id]);
  const merged = vehicle ? { ...vehicle, ...vehicleUpdate } : null;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        <p className="mt-4 text-gray-500">Loading vehicle...</p>
      </div>
    );
  }

  if (!merged) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Vehicle Not Found</h1>
      </div>
    );
  }

  const statusColor =
    merged.status === 'available'
      ? 'bg-green-100 text-green-700'
      : merged.status === 'rented'
        ? 'bg-orange-100 text-orange-700'
        : 'bg-gray-100 text-gray-700';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {merged.imageUrl && (
          <div className="h-64 bg-gray-200 overflow-hidden">
            <img
              src={merged.imageUrl}
              alt={`${merged.make} ${merged.model}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {merged.make} {merged.model}
              </h1>
              <p className="text-gray-500 mt-1">
                {merged.year} &middot; {merged.licensePlate}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${statusColor}`}
            >
              {merged.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <InfoCard label="Base Price" value={`€${merged.pricePerDay}/day`} />
            <InfoCard
              label="Location"
              value={
                merged.currentLatitude
                  ? `${merged.currentLatitude.toFixed(4)}, ${merged.currentLongitude?.toFixed(4)}`
                  : 'Unknown'
              }
            />
            <InfoCard
              label="Speed"
              value={
                merged.currentSpeed != null
                  ? `${merged.currentSpeed} km/h`
                  : 'N/A'
              }
            />
            <InfoCard
              label="Last Update"
              value={
                merged.lastPositionAt
                  ? new Date(merged.lastPositionAt).toLocaleTimeString()
                  : 'N/A'
              }
            />
          </div>

          {merged.status === 'available' ? (
            <RentalForm vehicleId={merged.id} />
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
              <p className="text-orange-700 font-medium">
                This vehicle is currently {merged.status}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

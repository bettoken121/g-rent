'use client';

import Link from 'next/link';
import { Vehicle } from '@g-rent/types';

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const statusColor =
    vehicle.status === 'available'
      ? 'bg-green-100 text-green-700'
      : vehicle.status === 'rented'
        ? 'bg-orange-100 text-orange-700'
        : 'bg-gray-100 text-gray-700';

  return (
    <Link href={`/car/${vehicle.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        {vehicle.imageUrl && (
          <div className="h-48 bg-gray-200 overflow-hidden">
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-sm text-gray-500">
                {vehicle.year} &middot; {vehicle.licensePlate}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor}`}
            >
              {vehicle.status}
            </span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-2xl font-bold text-primary-600">
              €{vehicle.pricePerDay}
              <span className="text-sm text-gray-400 font-normal">/day</span>
            </span>
            {vehicle.currentSpeed != null && (
              <span className="text-sm text-gray-500">
                {vehicle.currentSpeed} km/h
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

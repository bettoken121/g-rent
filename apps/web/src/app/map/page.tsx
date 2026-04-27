'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Vehicle } from '@g-rent/types';
import { api } from '@/lib/api';
import { useRealtimeStore } from '@/lib/store';
import { useSocket } from '@/lib/use-socket';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function MapPage() {
  useSocket();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const [mapboxgl, setMapboxgl] = useState<typeof import('mapbox-gl') | null>(null);

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/vehicles').then((r) => r.data),
    refetchInterval: 10000,
  });

  const vehicleUpdates = useRealtimeStore((s) => s.vehicleUpdates);

  useEffect(() => {
    import('mapbox-gl').then((mod) => {
      setMapboxgl(mod);
    });
  }, []);

  useEffect(() => {
    if (!mapboxgl || !mapContainer.current || mapRef.current) return;

    if (!MAPBOX_TOKEN) {
      console.warn('Mapbox token not set. Map will not render.');
      return;
    }

    (mapboxgl as typeof import('mapbox-gl')).default.accessToken = MAPBOX_TOKEN;

    const map = new (mapboxgl as typeof import('mapbox-gl')).default.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [2.3522, 48.8566],
      zoom: 13,
    });

    map.addControl(
      new (mapboxgl as typeof import('mapbox-gl')).default.NavigationControl(),
      'top-right',
    );

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxgl]);

  useEffect(() => {
    if (!mapRef.current || !mapboxgl || !vehicles) return;

    const map = mapRef.current;
    const mbgl = mapboxgl as typeof import('mapbox-gl');

    vehicles.forEach((vehicle) => {
      const updated = vehicleUpdates[vehicle.id];
      const lat = updated?.currentLatitude ?? vehicle.currentLatitude;
      const lng = updated?.currentLongitude ?? vehicle.currentLongitude;

      if (lat == null || lng == null) return;

      const statusColor =
        (updated?.status ?? vehicle.status) === 'available'
          ? '#22c55e'
          : (updated?.status ?? vehicle.status) === 'rented'
            ? '#f97316'
            : '#6b7280';

      if (markersRef.current[vehicle.id]) {
        markersRef.current[vehicle.id].setLngLat([lng, lat]);
      } else {
        const el = document.createElement('div');
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = statusColor;
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>';

        const popup = new mbgl.default.Popup({ offset: 20 }).setHTML(`
          <div style="font-family: sans-serif;">
            <strong>${vehicle.make} ${vehicle.model}</strong><br/>
            <span style="color: ${statusColor}; text-transform: capitalize;">${updated?.status ?? vehicle.status}</span><br/>
            <small>${vehicle.licensePlate}</small>
          </div>
        `);

        const marker = new mbgl.default.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current[vehicle.id] = marker;
      }
    });
  }, [vehicles, vehicleUpdates, mapboxgl]);

  return (
    <div className="h-[calc(100vh-64px)] relative">
      {!MAPBOX_TOKEN ? (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Map Not Available</h2>
            <p className="text-gray-600 mb-4">
              Set <code className="bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> in your environment to enable the live map.
            </p>
            <p className="text-sm text-gray-500">
              Get a free token at{' '}
              <a
                href="https://mapbox.com"
                className="text-primary-600 hover:underline"
                target="_blank"
                rel="noopener"
              >
                mapbox.com
              </a>
            </p>
          </div>
        </div>
      ) : (
        <div ref={mapContainer} className="w-full h-full" />
      )}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
        <h2 className="font-bold text-lg mb-2">Live Fleet Map</h2>
        <div className="flex gap-3 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500" /> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-orange-500" /> Rented
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-500" /> Offline
          </span>
        </div>
      </div>
    </div>
  );
}

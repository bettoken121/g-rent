'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { calculatePrice } from '@g-rent/utils';

interface RentalFormProps {
  vehicleId: string;
}

export function RentalForm({ vehicleId }: RentalFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    startDate: '',
    endDate: '',
  });
  const [pricePreview, setPricePreview] = useState<{
    pricePerDay: number;
    totalPrice: number;
    totalDays: number;
  } | null>(null);

  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const diffMs = end.getTime() - start.getTime();
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (days > 0) {
        try {
          const price = calculatePrice(days);
          setPricePreview({ ...price, totalDays: days });
        } catch {
          setPricePreview(null);
        }
      } else {
        setPricePreview(null);
      }
    } else {
      setPricePreview(null);
    }
  }, [form.startDate, form.endDate]);

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/rentals', { ...form, vehicleId }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
      alert('Rental booked successfully!');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      alert(
        err.response?.data?.message || 'Failed to create rental',
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Book This Vehicle</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={form.customerEmail}
            onChange={(e) =>
              setForm({ ...form, customerEmail: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            required
            value={form.customerPhone}
            onChange={(e) =>
              setForm({ ...form, customerPhone: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="+33 6 12 34 56 78"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            required
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            required
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      {pricePreview && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
          <h3 className="font-semibold text-primary-800 mb-3">Price Preview</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-primary-600">Duration</p>
              <p className="text-xl font-bold text-primary-900">
                {pricePreview.totalDays} days
              </p>
            </div>
            <div>
              <p className="text-sm text-primary-600">Per Day</p>
              <p className="text-xl font-bold text-primary-900">
                €{pricePreview.pricePerDay}
              </p>
            </div>
            <div>
              <p className="text-sm text-primary-600">Total</p>
              <p className="text-xl font-bold text-primary-900">
                €{pricePreview.totalPrice}
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {mutation.isPending ? 'Booking...' : 'Book Now'}
      </button>
    </form>
  );
}

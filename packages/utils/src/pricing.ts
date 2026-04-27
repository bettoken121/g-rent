import { PricingTier } from '@g-rent/types';

export const PRICING_TIERS: PricingTier[] = [
  { minDays: 1, maxDays: 1, pricePerDay: 50 },
  { minDays: 2, maxDays: 3, pricePerDay: 45 },
  { minDays: 4, maxDays: 7, pricePerDay: 40 },
  { minDays: 8, maxDays: 30, pricePerDay: 30 },
  { minDays: 31, maxDays: Infinity, pricePerDay: 25 },
];

export function calculatePrice(days: number): { pricePerDay: number; totalPrice: number } {
  if (days <= 0) {
    throw new Error('Number of days must be positive');
  }

  const roundedDays = Math.ceil(days);

  const tier = PRICING_TIERS.find(
    (t) => roundedDays >= t.minDays && roundedDays <= t.maxDays,
  );

  if (!tier) {
    throw new Error(`No pricing tier found for ${roundedDays} days`);
  }

  return {
    pricePerDay: tier.pricePerDay,
    totalPrice: tier.pricePerDay * roundedDays,
  };
}

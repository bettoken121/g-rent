import { calculatePrice, PRICING_TIERS } from './pricing';

describe('calculatePrice', () => {
  it('should return 50€/day for 1 day rental', () => {
    const result = calculatePrice(1);
    expect(result.pricePerDay).toBe(50);
    expect(result.totalPrice).toBe(50);
  });

  it('should return 45€/day for 2 day rental', () => {
    const result = calculatePrice(2);
    expect(result.pricePerDay).toBe(45);
    expect(result.totalPrice).toBe(90);
  });

  it('should return 45€/day for 3 day rental', () => {
    const result = calculatePrice(3);
    expect(result.pricePerDay).toBe(45);
    expect(result.totalPrice).toBe(135);
  });

  it('should return 40€/day for 4 day rental', () => {
    const result = calculatePrice(4);
    expect(result.pricePerDay).toBe(40);
    expect(result.totalPrice).toBe(160);
  });

  it('should return 40€/day for 7 day rental', () => {
    const result = calculatePrice(7);
    expect(result.pricePerDay).toBe(40);
    expect(result.totalPrice).toBe(280);
  });

  it('should return 30€/day for 8 day rental', () => {
    const result = calculatePrice(8);
    expect(result.pricePerDay).toBe(30);
    expect(result.totalPrice).toBe(240);
  });

  it('should return 30€/day for 30 day rental', () => {
    const result = calculatePrice(30);
    expect(result.pricePerDay).toBe(30);
    expect(result.totalPrice).toBe(900);
  });

  it('should return 25€/day for 31 day rental', () => {
    const result = calculatePrice(31);
    expect(result.pricePerDay).toBe(25);
    expect(result.totalPrice).toBe(775);
  });

  it('should return 25€/day for 60 day rental', () => {
    const result = calculatePrice(60);
    expect(result.pricePerDay).toBe(25);
    expect(result.totalPrice).toBe(1500);
  });

  it('should throw error for 0 days', () => {
    expect(() => calculatePrice(0)).toThrow('Number of days must be positive');
  });

  it('should throw error for negative days', () => {
    expect(() => calculatePrice(-1)).toThrow('Number of days must be positive');
  });

  it('should ceil fractional days', () => {
    const result = calculatePrice(1.5);
    expect(result.pricePerDay).toBe(45);
    expect(result.totalPrice).toBe(90);
  });

  it('should have correct number of tiers', () => {
    expect(PRICING_TIERS).toHaveLength(5);
  });
});

import { describe, it, expect } from 'vitest';
import { formatPrice } from '../lib/api';

describe('formatPrice', () => {
  it('formats a number with euro sign', () => {
    expect(formatPrice(1200)).toBe('€ 1,200');
  });

  it('formats a string price', () => {
    expect(formatPrice('4500.99')).toBe('€ 4,501');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('€ 0');
  });
});

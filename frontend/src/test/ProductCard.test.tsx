import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../lib/api';

// Mock useUserAuth so ProductCard doesn't need a provider
vi.mock('../lib/userAuth', () => ({
  useUserAuth: () => ({ user: null, favorites: new Set(), toggleFavorite: vi.fn() }),
}));

const mockProduct: Product = {
  id: '1',
  name: 'Arco Lounge Chair',
  slug: 'arco-lounge-chair',
  designer: 'Studio Morel',
  description: 'A timeless piece.',
  price: '3200',
  discountPrice: null,
  stock: 5,
  featured: false,
  published: true,
  material: 'Oak',
  color: 'Natural',
  dimensions: null,
  weightKg: null,
  modelUrl: null,
  assembled: false,
  category: null,
  images: [],
};

function renderCard(product = mockProduct) {
  return render(
    <MemoryRouter>
      <ProductCard product={product} onRequireAuth={vi.fn()} />
    </MemoryRouter>,
  );
}

describe('ProductCard', () => {
  it('renders the product name', () => {
    renderCard();
    expect(screen.getByText('Arco Lounge Chair')).toBeInTheDocument();
  });

  it('renders the designer name', () => {
    renderCard();
    expect(screen.getByText('Studio Morel')).toBeInTheDocument();
  });

  it('renders the price', () => {
    renderCard();
    expect(screen.getByText(/€\s*3,200/)).toBeInTheDocument();
  });

  it('shows a Sale badge when discounted', () => {
    renderCard({ ...mockProduct, discountPrice: '2500' });
    expect(screen.getByText('Sale')).toBeInTheDocument();
  });

  it('links to the product detail page', () => {
    renderCard();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/arco-lounge-chair');
  });
});

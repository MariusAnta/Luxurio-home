import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

// Mock Prisma before importing the app so the DB is never touched in tests
vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    product: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    category: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

// Provide required env vars
process.env.JWT_SECRET = 'test-secret-for-vitest-only';
process.env.CORS_ORIGIN = 'http://localhost:5173';

let app: any;

beforeAll(async () => {
  // Dynamic import after mocks are in place
  const mod = await import('../src/server.js');
  app = mod.default ?? mod.app ?? mod;
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('GET /api/health', () => {
  it('returns { ok: true }', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('GET /api/products', () => {
  it('returns empty items list with total=0', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ items: [], total: 0 });
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await request(app).get('/api/products/does-not-exist');
    expect(res.status).toBe(404);
  });
});

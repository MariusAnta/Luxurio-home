import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  // Super admin
  const email = process.env.ADMIN_EMAIL || 'admin@luxurio.local';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { role: 'SUPER_ADMIN' },
    create: { email, password: hash, name: 'Founder', role: 'SUPER_ADMIN' },
  });

  // Categories from the Noir design
  const cats = [
    { name: 'Seating',  slug: 'seating',  number: '001' },
    { name: 'Tables',   slug: 'tables',   number: '002' },
    { name: 'Lighting', slug: 'lighting', number: '003' },
    { name: 'Objects',  slug: 'objects',  number: '004' },
    { name: 'Textiles', slug: 'textiles', number: '005' },
    { name: 'Storage',  slug: 'storage',  number: '006' },
  ];
  for (const c of cats) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  const seating  = await prisma.category.findUnique({ where: { slug: 'seating' } });
  const tables   = await prisma.category.findUnique({ where: { slug: 'tables' } });
  const lighting = await prisma.category.findUnique({ where: { slug: 'lighting' } });
  const objects  = await prisma.category.findUnique({ where: { slug: 'objects' } });
  const textiles = await prisma.category.findUnique({ where: { slug: 'textiles' } });
  const storage  = await prisma.category.findUnique({ where: { slug: 'storage' } });

  const samples = [
    // ── Seating ──────────────────────────────────────────────────────────
    {
      slug: 'margaux-lounge-chair',
      name: 'The Margaux Lounge Chair',
      designer: 'Luca Ferretti, Milan',
      description: 'Hand-sculpted from solid walnut, generously upholstered in vegetable-tanned leather. Each piece takes 14 hours to complete in our Milanese atelier.',
      price: 4200, discountPrice: null, featured: true,
      material: 'Walnut, Leather', color: 'Cognac', dimensions: '85 × 90 × 82 cm',
      categoryId: seating.id,
      images: [
        'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900',
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=900',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900',
      ],
    },
    {
      slug: 'porto-armchair',
      name: 'Porto Armchair',
      designer: 'Studio Lievore',
      description: 'Solid oak frame with woven cane back and a generously padded bouclé seat cushion. A study in warmth and restraint.',
      price: 5600, discountPrice: 4900,
      material: 'Oak, Cane, Bouclé', color: 'Natural', dimensions: '70 × 75 × 80 cm',
      categoryId: seating.id,
      images: [
        'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900',
        'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?w=900',
      ],
    },
    {
      slug: 'colline-sofa',
      name: 'Colline Sofa',
      designer: 'Patricia Urquiola',
      description: 'Low-slung, modular sofa with solid ashwood legs and a hand-stitched linen slipcover. Available in three configurations.',
      price: 9800, discountPrice: 8200,
      material: 'Ash, Linen', color: 'Chalk', dimensions: '240 × 95 × 72 cm',
      categoryId: seating.id,
      images: [
        'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=900',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900',
      ],
    },

    // ── Tables ────────────────────────────────────────────────────────────
    {
      slug: 'eclat-side-table',
      name: 'Éclat Side Table',
      designer: 'Neri & Hu',
      description: 'Sculptural side table cast in solid brass with a hand-honed Carrara marble top. Each marble slab is unique.',
      price: 1840, discountPrice: 1599,
      material: 'Brass, Carrara Marble', color: 'White / Brass', dimensions: '45 × 45 × 55 cm',
      categoryId: tables.id,
      images: [
        'https://images.unsplash.com/photo-1549497538-303791108f95?w=900',
        'https://images.unsplash.com/photo-1618220179428-22790b461013?w=900',
      ],
    },
    {
      slug: 'monolith-console',
      name: 'Monolith Console',
      designer: 'Claesson Koivisto',
      description: 'Sculpted from a single block of Roman travertine with a slim brushed-bronze base. A statement piece for entrance halls.',
      price: 7400,
      material: 'Travertine, Bronze', color: 'Stone / Bronze', dimensions: '180 × 40 × 80 cm',
      categoryId: tables.id,
      images: [
        'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=900',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900',
      ],
    },
    {
      slug: 'calla-dining-table',
      name: 'Calla Dining Table',
      designer: 'Ferretti Studio',
      description: 'Solid smoked-oak dining table with a subtly curved monolithic top and tapered legs. Seats up to eight.',
      price: 6200,
      material: 'Smoked Oak', color: 'Dark Oak', dimensions: '220 × 95 × 74 cm',
      categoryId: tables.id,
      images: [
        'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=900',
        'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=900',
      ],
    },

    // ── Lighting ──────────────────────────────────────────────────────────
    {
      slug: 'sereno-pendant',
      name: 'Sereno Pendant',
      designer: 'Ferretti Studio',
      description: 'Hand-blown smoked-glass orb suspended on a slender brass rod. Available in three diameters.',
      price: 3200,
      material: 'Smoked Glass, Brass', color: 'Smoke', dimensions: 'Ø 38 cm',
      categoryId: lighting.id,
      images: [
        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900',
      ],
    },
    {
      slug: 'arco-floor-lamp',
      name: 'Arco Floor Lamp',
      designer: 'Studio Lievore',
      description: 'Sweeping arc floor lamp in patinated bronze with a mouth-blown alabaster shade. Dimmable.',
      price: 2900, discountPrice: 2490,
      material: 'Bronze, Alabaster', color: 'Patina', dimensions: 'H 185 cm',
      categoryId: lighting.id,
      images: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900',
        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900',
      ],
    },

    // ── Objects ───────────────────────────────────────────────────────────
    {
      slug: 'volta-vase',
      name: 'Volta Vase',
      designer: 'Neri & Hu',
      description: 'Wheel-thrown stoneware vase with a poured-ash glaze. No two are identical.',
      price: 380,
      material: 'Stoneware', color: 'Ash White', dimensions: 'Ø 14 × H 32 cm',
      categoryId: objects.id,
      images: ['https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=900'],
    },
    {
      slug: 'petra-sculpture',
      name: 'Petra Sculpture',
      designer: 'Charlotte Perriand Studio',
      description: 'Hand-carved black granite abstract sculpture. A meditation on mass and negative space.',
      price: 2200,
      material: 'Black Granite', color: 'Noir', dimensions: '22 × 18 × 40 cm',
      categoryId: objects.id,
      images: ['https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=900'],
    },

    // ── Textiles ──────────────────────────────────────────────────────────
    {
      slug: 'dune-throw',
      name: 'Dune Throw',
      designer: 'Atelier Pfister',
      description: 'Hand-loomed from pure Mongolian cashmere. Generous 200 × 140 cm proportion.',
      price: 640, discountPrice: 520,
      material: 'Cashmere', color: 'Sand', dimensions: '200 × 140 cm',
      categoryId: textiles.id,
      images: ['https://images.unsplash.com/photo-1611486212557-88be5ff6f941?w=900'],
    },
    {
      slug: 'silence-rug',
      name: 'Silence Rug',
      designer: 'Claesson Koivisto',
      description: 'Hand-knotted from New Zealand wool with a subtle geometric weave. 300 knots per square inch.',
      price: 4800,
      material: 'New Zealand Wool', color: 'Ivory / Flint', dimensions: '250 × 350 cm',
      categoryId: textiles.id,
      images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=900'],
    },

    // ── Storage ───────────────────────────────────────────────────────────
    {
      slug: 'arc-sideboard',
      name: 'Arc Sideboard',
      designer: 'Luca Ferretti, Milan',
      description: 'Four-door sideboard in solid smoked oak with integrated brushed-brass pulls. Felt-lined interior drawers.',
      price: 8600, discountPrice: 7400,
      material: 'Smoked Oak, Brass', color: 'Dark Oak', dimensions: '210 × 50 × 75 cm',
      categoryId: storage.id,
      images: [
        'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=900',
        'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=900',
      ],
    },
    {
      slug: 'forma-bookshelf',
      name: 'Forma Bookshelf',
      designer: 'Patricia Urquiola',
      description: 'Asymmetric open shelving unit in powder-coated steel with hand-sanded oak shelves. Modular by design.',
      price: 3100,
      material: 'Steel, Oak', color: 'Matte Black / Oak', dimensions: '120 × 35 × 200 cm',
      categoryId: storage.id,
      images: ['https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=900'],
    },
  ];

  for (const s of samples) {
    const { images, ...rest } = s;
    await prisma.product.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        ...rest,
        images: { create: images.map((url, order) => ({ url, order })) },
      },
    });
  }

  console.log('Seed complete.');
  console.log(`Super admin: ${admin.email} / ${password}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

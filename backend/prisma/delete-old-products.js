import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const all = await prisma.product.findMany({ select: { id: true, name: true, description: true } });
const old = all.filter(p => !p.description || !p.description.includes('MATERIALS'));

console.log(`Found ${old.length} old products to delete:`);
old.forEach(p => console.log(' -', p.name));

for (const p of old) {
  await prisma.productImage.deleteMany({ where: { productId: p.id } });
  await prisma.favorite.deleteMany({ where: { productId: p.id } });
  await prisma.product.delete({ where: { id: p.id } });
}

console.log('\nDone. Deleted', old.length, 'products.');
await prisma.$disconnect();

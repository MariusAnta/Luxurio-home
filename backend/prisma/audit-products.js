import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const all = await prisma.product.findMany({
  select: { id: true, name: true, categoryId: true, assembled: true, description: true },
  orderBy: { name: 'asc' }
});

const noCat = all.filter(p => !p.categoryId);
console.log('Total:', all.length, '| No category:', noCat.length);
console.log('\nProducts missing category:');
noCat.forEach(p => console.log(' -', p.name));

console.log('\nAll products assembly status:');
all.forEach(p => {
  const inDesc = p.description?.includes('Assembly required') ? 'required'
    : p.description?.includes('Fully assembled') ? 'fully' : '?';
  const mismatch = (inDesc === 'fully' && p.assembled === false) || (inDesc === 'required' && p.assembled === true);
  console.log((mismatch ? '⚠ ' : '  ') + p.name + ' | db:' + p.assembled + ' | desc:' + inDesc);
});

await prisma.$disconnect();

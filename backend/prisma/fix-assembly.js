import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const all = await prisma.product.findMany({
  select: { id: true, name: true, assembled: true, description: true }
});

let fixed = 0;
for (const p of all) {
  const desc = p.description || '';
  const fullyAssembled = desc.includes('Fully assembled');
  const requiresAssembly = desc.includes('Assembly required');

  // Only update if we can determine from description AND it mismatches
  if (fullyAssembled && p.assembled !== true) {
    await prisma.product.update({ where: { id: p.id }, data: { assembled: true } });
    console.log('✓ Set assembled=true:', p.name);
    fixed++;
  } else if (requiresAssembly && p.assembled !== false) {
    await prisma.product.update({ where: { id: p.id }, data: { assembled: false } });
    console.log('✓ Set assembled=false:', p.name);
    fixed++;
  }
}

console.log('\nFixed', fixed, 'products.');

// Also check categories are correct
const cats = await prisma.category.findMany({ select: { id: true, name: true, slug: true, parentId: true } });
console.log('\nCategories (' + cats.length + '):');
const parents = cats.filter(c => !c.parentId);
const children = cats.filter(c => c.parentId);
parents.forEach(p => {
  console.log(' ' + p.name);
  children.filter(c => c.parentId === p.id).forEach(c => console.log('   └ ' + c.name));
});

await prisma.$disconnect();

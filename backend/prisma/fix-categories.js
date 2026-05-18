import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get all categories
const cats = await prisma.category.findMany();
const bySlug = Object.fromEntries(cats.map(c => [c.slug, c]));

// Fix 1: 'tables' is self-referencing (parentId = its own id) — it should be a root parent
const tables = bySlug['tables'];
if (tables && tables.parentId === tables.id) {
  await prisma.category.update({ where: { id: tables.id }, data: { parentId: null } });
  console.log('✓ Fixed tables: removed self-referencing parentId');
}

// Fix 2: beds/nightstands/benches point to old 'bedroom' id (cmp19oqvx...) 
//         Make sure they point to the correct 'bedroom' slug category
const bedroom = bySlug['bedroom'];
if (bedroom) {
  const bedsChildren = ['beds', 'nightstands', 'benches'];
  for (const slug of bedsChildren) {
    const cat = bySlug[slug];
    if (cat && cat.parentId !== bedroom.id) {
      await prisma.category.update({ where: { id: cat.id }, data: { parentId: bedroom.id } });
      console.log('✓ Fixed', slug, '-> bedroom');
    }
  }
}

// Fix 3: Delete orphaned/duplicate old category that beds used to point to
const orphanId = 'cmp19oqvx00004bn7eon1frgi';
const orphan = cats.find(c => c.id === orphanId);
if (orphan && orphan.slug !== 'bedroom') {
  // Move any products under it to bedroom
  if (bedroom) {
    await prisma.product.updateMany({ where: { categoryId: orphanId }, data: { categoryId: bedroom.id } });
  }
  await prisma.category.delete({ where: { id: orphanId } });
  console.log('✓ Deleted orphan category:', orphan.name, '(' + orphan.slug + ')');
}

// Show final structure
console.log('\nFinal category tree:');
const finalCats = await prisma.category.findMany({ orderBy: { name: 'asc' } });
const roots = finalCats.filter(c => !c.parentId);
roots.forEach(r => {
  console.log(r.name + ' (' + r.slug + ')');
  finalCats.filter(c => c.parentId === r.id).forEach(c => console.log('  └ ' + c.name + ' (' + c.slug + ')'));
});

console.log('\nProduct count per category:');
for (const cat of finalCats) {
  const count = await prisma.product.count({ where: { categoryId: cat.id } });
  if (count > 0) console.log(' ', cat.name + ':', count);
}

await prisma.$disconnect();

# Product Variants — Implementation Plan

Add support for product variants (e.g. different sizes / materials, each with its own price, stock, and optionally images) so that:

- **Admin** can create a single product (e.g. "Oak Dining Table") and define multiple variants ("120 cm — €499", "160 cm — €699", "200 cm — €899").
- **User** on the product detail page can click a size/material option and the displayed price, stock, and images update accordingly.
- Favorites, cart (future), and orders (future) reference the selected variant — not just the product.

---

## 1. Data Model (Prisma)

Add a `ProductVariant` model. Keep `Product.price` as a **fallback/base price** so existing products without variants keep working.

### 1.1 Schema changes — `backend/prisma/schema.prisma`

```prisma
model Product {
  // ...existing fields...
  price         Float       // becomes the "base/from" price
  discountPrice Float?
  stock         Int    @default(0)  // used only when no variants exist

  variants      ProductVariant[]
  // ...rest unchanged...
}

model ProductVariant {
  id            String   @id @default(cuid())
  productId     String
  product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  // Human label shown in the option button (e.g. "120 cm", "Oak / Large")
  label         String

  // Structured options for filtering/multi-axis variants
  // JSON string, e.g. {"size":"120 cm","material":"Oak"}
  options       String?

  sku           String?  @unique
  price         Float
  discountPrice Float?
  stock         Int      @default(0)

  // Optional: variant-specific dimensions/weight/image override
  dimensions    String?  // same JSON shape as Product.dimensions
  weightKg      Float?
  imageUrl      String?  // optional override; otherwise use product images

  order         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([productId])
}
```

### 1.2 Migration

```powershell
cd backend
npx prisma migrate dev --name add_product_variants
```

---

## 2. Backend API

### 2.1 Update `backend/src/routes/products.routes.js`

**Zod schema additions:**

```js
const variantSchema = z.object({
  id: z.string().optional(),         // present when editing
  label: z.string().min(1),
  options: z.record(z.string()).optional().nullable(), // {size,material,...}
  sku: z.string().optional().nullable(),
  price: z.number().nonnegative(),
  discountPrice: z.number().nonnegative().optional().nullable(),
  stock: z.number().int().nonnegative().default(0),
  dimensions: z.string().optional().nullable(),
  weightKg: z.number().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  order: z.number().int().optional(),
});

const productSchema = z.object({
  // ...existing fields...
  variants: z.array(variantSchema).optional(),
});
```

**On every `findMany` / `findFirst` / `findUnique`** include variants:

```js
include: {
  images: { orderBy: { order: 'asc' } },
  category: true,
  variants: { orderBy: { order: 'asc' } },
}
```

**POST `/`** — create product with variants:

```js
const { images, variants, ...rest } = data;
const created = await prisma.product.create({
  data: {
    ...rest,
    images: images?.length ? { create: images.map((img,i)=>({...img, order: img.order ?? i})) } : undefined,
    variants: variants?.length
      ? { create: variants.map((v,i)=>({
          ...v,
          options: v.options ? JSON.stringify(v.options) : null,
          order: v.order ?? i,
        })) }
      : undefined,
  },
  include: { images: true, category: true, variants: true },
});
```

**PUT `/:id`** — replace variants (simplest correct strategy: delete + recreate, mirrors how `images` is handled):

```js
...(variants
  ? { variants: {
        deleteMany: {},
        create: variants.map((v,i)=>({
          ...v,
          options: v.options ? JSON.stringify(v.options) : null,
          order: v.order ?? i,
        })),
      } }
  : {}),
```

> Note: deleting variants breaks existing favorites/orders that reference them. When favorites/cart link to variants (section 5), switch to a diff-based upsert: keep existing IDs, update changed ones, delete removed ones.

### 2.2 Stock & price logic

- If `product.variants.length > 0`:
  - Display "from {min(variant.price)}" on listings.
  - Product detail uses the **selected variant's** price/stock.
  - `Product.stock` is ignored.
- Otherwise: fall back to `Product.price` / `Product.stock`.

Add a small helper (e.g. `backend/src/lib/pricing.js`) to compute `effectivePrice(product, variant?)` and reuse it in any future cart/order code.

---

## 3. Admin UI — `frontend/src/pages/admin/AdminProducts.tsx`

### 3.1 Form state

```ts
type VariantForm = {
  id?: string;
  label: string;                       // "120 cm"
  options: { key: string; value: string }[]; // [{key:'Size', value:'120 cm'}]
  sku: string;
  price: number | '';
  discountPrice: number | '';
  stock: number | '';
  dimensions: { name: string; value: string }[]; // optional override
  weightKg: number | '';
  imageUrl: string;
};

type ProductForm = {
  // ...existing...
  variants: VariantForm[];
};
```

### 3.2 UI block (place under "Dimensions" / above Images)

A new collapsible **"Variants"** section:

- Header with `+ Add variant` button.
- Each variant row:
  - **Label** (required, e.g. "120 cm")
  - **Options** key/value list (optional, repeatable: Size = 120 cm, Material = Oak)
  - **Price**, **Discount price**, **Stock**, **SKU**
  - Optional: override **Dimensions**, **Weight**, **Image URL** (picker from existing product images)
  - **Reorder** (drag handle or up/down)
  - **Delete**
- If no variants are added, the existing base price/stock fields apply.
- Show a hint: "If you add variants, the base price becomes the 'from' price; per-variant prices are used at checkout."

### 3.3 Submit

Map `options` array → `Record<string,string>` and send `variants` array along with the product payload (the route already accepts it after section 2 changes).

---

## 4. Public Product Detail — `frontend/src/pages/ProductDetail.tsx`

### 4.1 Types — `frontend/src/lib/api.ts`

```ts
export type ProductVariant = {
  id: string;
  label: string;
  options?: Record<string, string> | null; // already parsed (parse on client)
  sku?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  dimensions?: string | null;
  weightKg?: number | null;
  imageUrl?: string | null;
  order: number;
};

export type Product = {
  // ...existing...
  variants?: ProductVariant[];
};
```

### 4.2 Component logic

```tsx
const variants = p.variants ?? [];
const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
  variants[0]?.id ?? null
);
const selected = variants.find(v => v.id === selectedVariantId) ?? null;

const price         = selected?.price ?? p.price;
const discountPrice = selected?.discountPrice ?? p.discountPrice ?? null;
const stock         = selected?.stock ?? p.stock;
const dimensions    = selected?.dimensions ?? p.dimensions;
```

### 4.3 UI — option selector

If `variants.length > 0`, render **before** the Add-to-cart / Favorite buttons:

- Group variants by **option axis** when possible. If all variants share the same option keys (e.g. all have `size`), render one row of buttons per axis: `Size: [120 cm] [160 cm] [200 cm]`.
- Otherwise fall back to a single row of buttons using `variant.label`.
- Selected button gets `.is-active`. Out-of-stock variants get `.is-disabled` (still clickable to show "Out of stock").

```tsx
{variants.length > 0 && (
  <div className="pd-variants">
    <div className="pd-variants-label">Size</div>
    <div className="pd-variant-options">
      {variants.map(v => (
        <button
          key={v.id}
          type="button"
          className={`pd-variant-btn ${v.id === selectedVariantId ? 'is-active' : ''} ${v.stock === 0 ? 'is-disabled' : ''}`}
          onClick={() => setSelectedVariantId(v.id)}
        >
          {v.label}
        </button>
      ))}
    </div>
  </div>
)}
```

### 4.4 Price block

Replace direct reads of `p.price` / `p.discountPrice` with the resolved `price` / `discountPrice` computed above. Same for stock and dimensions.

### 4.5 Listings (Shop, ProductCard)

In `ProductCard` show "**nuo €499**" (from price) when `variants.length > 0`:

```ts
const minPrice = product.variants?.length
  ? Math.min(...product.variants.map(v => v.discountPrice ?? v.price))
  : (product.discountPrice ?? product.price);
const isFrom = (product.variants?.length ?? 0) > 1;
```

---

## 5. Favorites / Cart / Orders (forward-compatible)

When the cart is added later, the line item must reference the **variant**, not just the product:

- `CartItem { productId, variantId?, qty }`
- `Favorite` can stay product-scoped (UX choice), but consider adding optional `variantId`:
  ```prisma
  model Favorite {
    // ...
    variantId String?
    @@unique([userId, productId, variantId])
  }
  ```
  Skip this in v1 if not needed.

---

## 6. Backward Compatibility & Migration

- Existing products have **0 variants** → everything keeps working (price/stock fall back to product fields).
- No data migration required for existing products.
- Old API consumers will simply ignore the new `variants` array.

---

## 7. Validation & Edge Cases

- Reject saving a variant with `price < 0` (Zod handles this).
- If admin removes all variants on edit, fall back to base price/stock — show a confirm dialog.
- Variant `label` must be unique per product (enforce in Zod via `superRefine`).
- When `discountPrice >= price`, treat as no discount (already the pattern used elsewhere).
- Out-of-stock variants: still selectable, but disable Add-to-cart.

---

## 8. SEO / JSON-LD

In `Seo.tsx` / `JsonLd.tsx`, when variants exist emit `Product` JSON-LD with `offers` as an array of `Offer`, one per variant (price, availability, sku).

---

## 9. Testing

- `backend/tests/products.test.ts`: add cases for create / update / delete with variants, and that `findMany` returns variants.
- Frontend manual checklist:
  1. Create product with no variants → unchanged behaviour.
  2. Create product with 3 size variants → detail page shows selector, price updates on click.
  3. Edit product, remove a variant → saves correctly.
  4. Shop card shows "nuo €X" when variants exist.

---

## 10. Implementation Order (suggested)

1. Prisma schema + migration (section 1).
2. Backend Zod + routes (section 2).
3. Update `Product` type in `frontend/src/lib/api.ts` (section 4.1).
4. Admin UI variants editor (section 3).
5. ProductDetail variant selector + price binding (section 4.2–4.4).
6. ProductCard "from" price (section 4.5).
7. JSON-LD `offers` array (section 8).
8. Tests (section 9).
9. (Later) Cart/Order variant wiring (section 5).

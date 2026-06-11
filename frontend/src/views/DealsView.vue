<template>
  <div class="deals-page">
    <div class="deals-hero">
      <h1>Top Deals</h1>
      <p>Bundle discounts — buy books from the same author or series and save.</p>
    </div>

    <div v-if="loading" class="loading">Loading deals...</div>

    <div v-else-if="bundles.length === 0" class="empty">
      <p>No deals available right now. Check back soon.</p>
    </div>

    <div v-else class="bundles">
      <article v-for="bundle in bundles" :key="bundle.key" class="bundle-card">
        <div class="bundle-header">
          <div>
            <span class="badge">{{ bundle.discountLabel }}</span>
            <h2>{{ bundle.title }}</h2>
            <p class="sub">{{ bundle.subtitle }}</p>
          </div>
          <div class="price-block">
            <p class="original">{{ bundle.originalTotal.toFixed(2) }} TL</p>
            <p class="discounted">{{ bundle.discountedTotal.toFixed(2) }} TL</p>
          </div>
        </div>

        <div class="book-list">
          <div
            v-for="book in bundle.books"
            :key="book.id"
            class="book-row"
            @click="router.push(`/product/${book.id}`)"
          >
            <img :src="book.image" :alt="book.name" class="cover" />
            <div class="book-info">
              <p class="book-name">{{ book.name }}</p>
              <p class="book-author">{{ book.distributor }}</p>
              <p class="book-price">{{ book.price.toFixed(2) }} TL</p>
            </div>
          </div>
        </div>

        <button
          class="add-bundle-btn"
          :disabled="bundle.books.every(b => b.quantity === 0)"
          @click="addBundle(bundle)"
        >
          Add all to cart — save {{ bundle.savings.toFixed(2) }} TL
        </button>

        <p v-if="bundle.added" class="added-msg">Added to cart!</p>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useProductsStore } from "../stores/products.js";
import { useCartStore } from "../stores/cart";

const router = useRouter();
const { state: productsState, fetchProducts, listCatalogProducts } = useProductsStore();
const { addToCart } = useCartStore();

const loading = ref(true);
const addedKeys = ref(new Set());

onMounted(async () => {
  if (productsState.products.length === 0) await fetchProducts();
  loading.value = false;
});

function discountRate(count) {
  if (count >= 4) return 0.20;
  if (count === 3) return 0.15;
  return 0.10;
}

const bundles = computed(() => {
  const products = listCatalogProducts();
  const result = [];

  // Group by author (distributor) — only authors with 2+ books
  const byAuthor = {};
  for (const p of products) {
    const key = p.distributor?.trim();
    if (!key) continue;
    if (!byAuthor[key]) byAuthor[key] = [];
    byAuthor[key].push(p);
  }

  for (const [author, books] of Object.entries(byAuthor)) {
    if (books.length < 2) continue;
    const sorted = [...books].sort((a, b) => b.rating - a.rating).slice(0, 4);
    const rate = discountRate(sorted.length);
    const originalTotal = sorted.reduce((s, b) => s + b.price, 0);
    const discountedTotal = originalTotal * (1 - rate);

    result.push({
      key: `author-${author}`,
      title: `${author} Collection`,
      subtitle: `${sorted.length} books by ${author} — bundle deal`,
      books: sorted,
      originalTotal,
      discountedTotal,
      savings: originalTotal - discountedTotal,
      discountLabel: `Save ${Math.round(rate * 100)}%`,
      added: addedKeys.value.has(`author-${author}`),
    });
  }

  // Group by category — top-rated books per category (3 books min)
  const byCategory = {};
  for (const p of products) {
    const key = p.category?.trim();
    if (!key) continue;
    if (!byCategory[key]) byCategory[key] = [];
    byCategory[key].push(p);
  }

  for (const [category, books] of Object.entries(byCategory)) {
    // Only add category bundle if no author bundle covers most of these books
    const sorted = [...books].sort((a, b) => b.rating - a.rating).slice(0, 3);
    if (sorted.length < 3) continue;
    // Skip if all books in this category-bundle are already in an author bundle
    const key = `cat-${category}`;
    const rate = 0.10;
    const originalTotal = sorted.reduce((s, b) => s + b.price, 0);
    const discountedTotal = originalTotal * (1 - rate);

    result.push({
      key,
      title: `${category} Starter Pack`,
      subtitle: `Top 3 rated ${category} books — bundle deal`,
      books: sorted,
      originalTotal,
      discountedTotal,
      savings: originalTotal - discountedTotal,
      discountLabel: "Save 10%",
      added: addedKeys.value.has(key),
    });
  }

  return result.sort((a, b) => b.savings - a.savings).slice(0, 8);
});

function addBundle(bundle) {
  // Apply discount by reducing each book's price proportionally
  const rate = 1 - bundle.discountedTotal / bundle.originalTotal;
  for (const book of bundle.books) {
    if (book.quantity > 0) {
      addToCart({ ...book, price: Math.round(book.price * (1 - rate) * 100) / 100 });
    }
  }
  addedKeys.value = new Set([...addedKeys.value, bundle.key]);
}
</script>

<style scoped>
.deals-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 56px;
  color: #0f172a;
}

.deals-hero {
  margin-bottom: 28px;
}

.deals-hero h1 {
  margin: 0 0 8px;
  font-size: 1.8rem;
  letter-spacing: -0.02em;
}

.deals-hero p {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.loading, .empty {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.bundles {
  display: grid;
  gap: 20px;
}

.bundle-card {
  background: #fff;
  border: 1px solid #dbe5f1;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
}

.bundle-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: #1f2937;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bundle-header h2 {
  margin: 0 0 4px;
  font-size: 1.15rem;
}

.sub {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
}

.price-block {
  text-align: right;
  flex-shrink: 0;
}

.original {
  margin: 0;
  color: #94a3b8;
  text-decoration: line-through;
  font-size: 0.9rem;
}

.discounted {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #16a34a;
}

.book-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.book-row {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.book-row:hover {
  border-color: rgba(37, 99, 235, 0.3);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.cover {
  width: 42px;
  height: 56px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  background: #f1f5f9;
}

.book-info {
  min-width: 0;
}

.book-name {
  margin: 0 0 2px;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-author {
  margin: 0 0 2px;
  font-size: 0.74rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-price {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: #0f172a;
}

.add-bundle-btn {
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(145deg, #1d4ed8, #2563eb);
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s;
}

.add-bundle-btn:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.add-bundle-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.added-msg {
  margin: 10px 0 0;
  text-align: center;
  color: #16a34a;
  font-weight: 700;
  font-size: 0.9rem;
}
</style>

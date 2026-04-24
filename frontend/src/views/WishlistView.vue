<template>
  <div class="wishlist-page">
    <h1>Wishlist</h1>
    <p class="lead">Saved titles you love — available across the app.</p>

    <section class="wishlist-section" aria-label="Wishlisted products">
      <div class="product-grid" v-if="wishlistProducts.length > 0">
        <ProductCard
          v-for="product in wishlistProducts"
          :key="product.id"
          :product="product"
        />
      </div>

      <div v-else class="empty-state" role="status">
        <p class="empty-title">Your wishlist is empty.</p>
        <p class="empty-sub">Tap the heart on any product to save it here.</p>
      </div>
    </section>

    <router-link class="back-link" to="/">Continue shopping</router-link>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { products } from "../data/products.js";
import ProductCard from "../components/ProductCard.vue";
import { useWishlistStore } from "../stores/wishlist";

const { state } = useWishlistStore();

const wishlistProducts = computed(() => {
  const idSet = new Set(state.ids);
  return products.filter((p) => idSet.has(p.id));
});
</script>

<style scoped>
.wishlist-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 40px 24px 56px;
  color: #0f172a;
}

h1 {
  margin: 0 0 10px;
  font-size: 1.5rem;
}

.lead {
  margin: 0 0 20px;
  color: #64748b;
  line-height: 1.5;
}

.wishlist-section {
  margin: 18px 0 18px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 18px;
}

.empty-state {
  border: 1px dashed rgba(148, 163, 184, 0.55);
  border-radius: 10px;
  background: rgba(248, 251, 255, 0.6);
  padding: 18px 16px;
}

.empty-title {
  margin: 0 0 4px;
  font-weight: 800;
  color: #0f172a;
}

.empty-sub {
  margin: 0;
  color: #64748b;
  line-height: 1.5;
}

.back-link {
  display: inline-block;
  font-weight: 700;
  color: #2563eb;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
</style>

<template>
  <div
    class="product-card"
    role="link"
    tabindex="0"
    @click="goToDetail"
    @keydown.enter.self.prevent="goToDetail"
    @keydown.space.self.prevent="goToDetail"
  >
    <div class="image-wrapper">
      <button
        type="button"
        class="wishlist-btn"
        :class="{ active: isWishlisted }"
        :aria-pressed="isWishlisted"
        :aria-label="isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'"
        @click.stop="onToggleWishlist"
      >
        <svg
          v-if="isWishlisted"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          aria-hidden="true"
        >
          <path
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
          />
        </svg>
      </button>
      <img
        :src="imageSrc"
        :alt="product.name"
        class="product-image"
        loading="lazy"
        @error="onImageError"
      />
      <span class="badge" v-if="product.quantity === 0">Sold out</span>
      <span class="badge top" v-else-if="product.rating >= 4.8">Top rated</span>
    </div>

    <div class="product-info">
      <p class="product-category">{{ product.category }}</p>
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-author">Author: {{ product.distributor }}</p>

      <div class="rating-row">
        <div class="stars">
          <span
            v-for="n in 5"
            :key="n"
            class="star"
            :class="{ filled: n <= Math.round(product.rating || 0) }"
          >
            ★
          </span>
        </div>
        <span class="rating-count">
          {{ (product.ratingCount || 0).toLocaleString() }}
        </span>
      </div>

      <div class="price-row">
        <span class="price">{{ product.price.toFixed(2) }} TL</span>
        <span class="list-price">{{ (product.price * 1.18).toFixed(2) }} TL</span>
      </div>
      <p class="shipping-note">Eligible for free shipping</p>

      <p
        v-if="product.quantity > 0"
        class="stock-info"
        :class="{ low: product.quantity <= 5 }"
      >
        <span v-if="product.quantity <= 5">
          Only {{ product.quantity }} left in stock
        </span>
        <span v-else>In Stock</span>
      </p>

      <button
        v-if="product.quantity > 0"
        type="button"
        class="add-btn"
        aria-label="Add to cart"
        @click.stop="addToCart"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
          <path
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 6h15l-1.5 9h-12zM6 6L5 3H2M9 20a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z"
          />
        </svg>
      </button>
      <div v-else class="unavailable-block" role="status">
        <span class="unavailable-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none" />
            <path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M8.5 8.5l7 7m0-7l-7 7" />
          </svg>
        </span>
        <span>Currently unavailable</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";
import { useWishlistStore } from "../stores/wishlist";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const router = useRouter();
const { addToCart: addItemToCart } = useCartStore();
const { isInWishlist, toggleWishlist: toggleWishlistItem } = useWishlistStore();

const imageFailed = ref(false);
const isWishlisted = computed(() => isInWishlist(props.product?.id));
const placeholderImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='1125' viewBox='0 0 900 1125'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23f8fafc'/%3E%3Cstop offset='1' stop-color='%23e2e8f0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='900' height='1125' fill='url(%23g)'/%3E%3Crect x='78' y='92' width='744' height='940' rx='38' fill='%23ffffff' opacity='0.75'/%3E%3Cpath d='M322 390h256c22 0 40 18 40 40v240c0 22-18 40-40 40H322c-22 0-40-18-40-40V430c0-22 18-40 40-40z' fill='%23e2e8f0'/%3E%3Cpath d='M370 520l64 64l44-44l116 116H306l64-64z' fill='%23cbd5e1'/%3E%3Ccircle cx='536' cy='486' r='28' fill='%2394a3b8'/%3E%3Cpath d='M294 786h312' stroke='%23cbd5e1' stroke-width='26' stroke-linecap='round'/%3E%3Cpath d='M294 856h248' stroke='%23e2e8f0' stroke-width='24' stroke-linecap='round'/%3E%3Ctext x='450' y='326' text-anchor='middle' font-family='ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial' font-weight='700' font-size='46' fill='%2364748b'%3ENo image%3C/text%3E%3C/svg%3E";

const imageSrc = computed(() => {
  if (imageFailed.value) return placeholderImage;
  if (!props.product?.image) return placeholderImage;
  return props.product.image;
});

function onImageError() {
  imageFailed.value = true;
}

function goToDetail() {
  router.push(`/product/${props.product.id}`);
}

function addToCart() {
  addItemToCart(props.product);
}

function onToggleWishlist() {
  toggleWishlistItem(props.product?.id);
}
</script>

<style scoped>
.product-card {
  background: var(--card-bg);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    transform 0.15s,
    border-color 0.2s;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow-sm);
  min-height: 100%;
}

.product-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-6px);
  border-color: rgba(59, 130, 246, 0.28);
}

.product-card:focus-within {
  box-shadow:
    var(--shadow-md),
    0 0 0 4px rgba(37, 99, 235, 0.12);
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #f8fafc, #edf2f8);
}

.wishlist-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.55);
  background: rgba(255, 255, 255, 0.92);
  color: #334155;
  cursor: pointer;
  display: grid;
  place-items: center;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 150ms ease,
    background 150ms ease,
    border-color 150ms ease,
    color 150ms ease,
    box-shadow 150ms ease;
}

.wishlist-btn:hover {
  transform: translateY(-1px);
  background: #ffffff;
  border-color: rgba(148, 163, 184, 0.85);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12);
}

.wishlist-btn:active {
  transform: translateY(0px);
}

.wishlist-btn:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.28);
  outline-offset: 2px;
}

.wishlist-btn.active {
  color: #e11d48;
  border-color: rgba(225, 29, 72, 0.35);
}

.product-image {
  width: 100%;
  height: 230px;
  object-fit: cover;
  transition: transform 260ms ease;
  display: block;
  background: #f1f5f9;
}

.product-card:hover .product-image {
  transform: scale(1.06);
}

.badge {
  position: absolute;
  top: 12px;
  left: 10px;
  background: #cc0c39;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.badge.top {
  background: #1d4ed8;
}

.product-info {
  padding: 14px 14px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0;
}

.product-category {
  font-size: 0.75rem;
  color: #1d4ed8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.product-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f1111;
  margin-bottom: 4px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-author {
  font-size: 0.79rem;
  color: #64748b;
  margin-bottom: 10px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.stars {
  display: flex;
  gap: 1px;
}

.star {
  color: #d5d5d5;
  font-size: 0.95rem;
}

.star.filled {
  color: #ffa41c;
}

.rating-count {
  font-size: 0.8rem;
  color: #334155;
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.price {
  font-size: 1.48rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.list-price {
  font-size: 0.76rem;
  color: #64748b;
  text-decoration: line-through;
}

.shipping-note {
  margin: 0 0 10px;
  color: #047857;
  font-size: 0.76rem;
  font-weight: 600;
}

.stock-info {
  font-size: 0.78rem;
  color: #166534;
  margin: 0 0 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  max-width: 100%;
  padding: 7px 10px;
  border-radius: 6px;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.25);
}

.stock-info.low {
  color: #9a3412;
  background: rgba(249, 115, 22, 0.12);
  border-color: rgba(249, 115, 22, 0.25);
}

.add-btn {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #fbbf24, #f59e0b);
  border: 1px solid rgba(180, 83, 9, 0.92);
  border-radius: 8px;
  color: #111827;
  cursor: pointer;
  transition:
    background 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
  margin-top: auto;
}

.add-btn:hover {
  background: linear-gradient(145deg, #facc15, #d97706);
  transform: translateY(-1px);
  box-shadow: 0 16px 26px rgba(245, 158, 11, 0.26);
  border-color: rgba(180, 83, 9, 0.75);
}

.add-btn:active {
  transform: translateY(0px);
}

.add-btn:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.28);
  outline-offset: 2px;
}

.unavailable-block {
  margin-top: auto;
  padding: 10px 4px 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.3;
  text-align: center;
}

.unavailable-icon {
  display: grid;
  place-items: center;
  color: #cbd5e1;
  flex-shrink: 0;
}
</style>

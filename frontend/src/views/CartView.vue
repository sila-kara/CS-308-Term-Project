<template>
  <div class="cart-page">
    <div class="page-head">
      <div>
        <h1>Shopping cart</h1>
        <p v-if="items.length">{{ cartCount }} items</p>
      </div>
      <button v-if="items.length" type="button" class="empty-cart-link" @click="onEmptyCart">
        Empty cart
      </button>
    </div>

    <div v-if="items.length === 0" class="empty">
      <p>Your cart is empty.</p>
      <router-link class="btn primary" to="/">Continue shopping</router-link>
    </div>

    <div v-else class="layout">
      <div class="main-col">
        <section v-if="recommendedProducts.length" class="offers-block" aria-labelledby="offers-heading">
          <div class="offers-toolbar">
            <h2 id="offers-heading" class="offers-title">
              Special picks for your cart
              <span class="offers-count">({{ recommendedProducts.length }} titles)</span>
            </h2>
            <div class="offers-arrows">
              <button
                type="button"
                class="offer-arrow"
                aria-label="Scroll recommendations left"
                @click="scrollOffers(-1)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                  <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              <button
                type="button"
                class="offer-arrow"
                aria-label="Scroll recommendations right"
                @click="scrollOffers(1)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                  <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
          <div ref="offersTrackRef" class="offers-track">
            <article v-for="p in recommendedProducts" :key="p.id" class="offer-card">
              <img :src="p.image" :alt="p.name" />
              <div class="offer-info">
                <h3 class="offer-name">{{ p.name }}</h3>
                <p class="offer-price">{{ p.price.toFixed(2) }} TL</p>
                <button
                  type="button"
                  class="offer-add"
                  :disabled="p.quantity === 0"
                  aria-label="Add to cart"
                  @click="addRecommended(p)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                    <path
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 6h15l-1.5 9h-12zM6 6L5 3H2M9 20a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z"
                    />
                  </svg>
                </button>
              </div>
            </article>
          </div>
        </section>

        <ul class="lines">
          <li v-for="item in items" :key="item.id" class="line">
            <img :src="item.image" :alt="item.name" />
            <div class="meta">
              <h2>{{ item.name }}</h2>
              <p class="price-unit">{{ item.price.toFixed(2) }} TL each</p>
              <div class="qty-row">
                <label>
                  Qty
                  <input
                    type="number"
                    min="1"
                    :value="item.quantity"
                    @change="onQty(item.id, $event.target.value)"
                  />
                </label>
                <button
                  type="button"
                  class="remove-btn"
                  aria-label="Remove from cart"
                  title="Remove from cart"
                  @click="removeFromCart(item.id)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                    <path
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div class="line-total">
              {{ (item.price * item.quantity).toFixed(2) }} TL
            </div>
          </li>
        </ul>

        <div class="gift-wrap">
          <div class="gift-row">
            <div class="gift-left">
              <span class="gift-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <path
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6M2 7h20v5H2V7zm10 13V7M9 7V5a3 3 0 016 0v2"
                  />
                </svg>
              </span>
              <span class="gift-text">Add gift wrapping</span>
            </div>
            <button
              type="button"
              class="gift-add-btn"
              :aria-expanded="giftExpanded"
              @click="giftExpanded = !giftExpanded"
            >
              {{ giftWrapSelected ? "Added" : "Add" }}
              <svg
                class="gift-chevron"
                :class="{ open: giftExpanded }"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                aria-hidden="true"
              >
                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
          <div v-if="giftExpanded" class="gift-panel">
            <p class="gift-desc">
              Kraft paper, ribbon, and a short gift note. One fee covers your whole order.
            </p>
            <label class="gift-check">
              <input v-model="giftWrapSelected" type="checkbox" />
              <span>Include gift wrapping (+{{ giftWrapFee.toFixed(2) }} TL)</span>
            </label>
          </div>
        </div>
      </div>

      <aside class="summary">
        <h3>Order summary ({{ lineCount }} {{ lineCount === 1 ? "item" : "items" }})</h3>
        <div class="row">
          <span>Cart subtotal</span>
          <span>{{ subtotal.toFixed(2) }} TL</span>
        </div>
        <div v-if="giftWrapSelected" class="row">
          <span>Gift wrapping</span>
          <span>{{ giftWrapFee.toFixed(2) }} TL</span>
        </div>
        <div class="row">
          <span>Estimated tax</span>
          <span>{{ tax.toFixed(2) }} TL</span>
        </div>
        <div class="row strong">
          <span>Total</span>
          <span>{{ grandTotal.toFixed(2) }} TL</span>
        </div>
        <router-link class="btn checkout" to="/checkout">Continue</router-link>
        <p class="hint">Sign in required at checkout.</p>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useProductsStore } from "../stores/products.js";
import { useCartStore } from "../stores/cart";
import { computeCartTotal } from "../utils/cartMath";

const { state: productsState } = useProductsStore();

const GIFT_WRAP_FEE = 25;

const {
  state,
  cartCount,
  removeFromCart,
  updateItemQuantity,
  addToCart: addProductToCart,
  clearCart,
} = useCartStore();

const items = computed(() => state.items);
const lineCount = computed(() => items.value.length);

const cartIds = computed(() => new Set(items.value.map((i) => i.id)));

const recommendedProducts = computed(() =>
  productsState.products
    .filter((p) => !cartIds.value.has(p.id) && p.quantity > 0)
    .sort((a, b) => a.price - b.price)
    .slice(0, 24),
);

const subtotal = computed(() => computeCartTotal(items.value));
const giftWrapFee = GIFT_WRAP_FEE;
const giftWrapSelected = ref(false);
const giftExpanded = ref(false);

const taxableBase = computed(
  () => subtotal.value + (giftWrapSelected.value ? giftWrapFee : 0),
);
const tax = computed(() => Math.round(taxableBase.value * 0.1 * 100) / 100);
const grandTotal = computed(() => taxableBase.value + tax.value);

const offersTrackRef = ref(null);

function scrollOffers(direction) {
  const el = offersTrackRef.value;
  if (!el) return;
  const step = Math.min(320, Math.max(240, el.clientWidth * 0.75));
  el.scrollBy({ left: direction * step, behavior: "smooth" });
}

function onQty(id, raw) {
  updateItemQuantity(id, raw);
}

function onEmptyCart() {
  clearCart();
}

function addRecommended(product) {
  addProductToCart(product);
}
</script>

<style scoped>
.cart-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.page-head h1 {
  margin: 0;
  font-size: 1.6rem;
  color: #0f172a;
}

.page-head p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.empty-cart-link {
  border: none;
  background: none;
  padding: 6px 0;
  font-size: 0.86rem;
  font-weight: 700;
  color: #2563eb;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.empty-cart-link:hover {
  color: #1d4ed8;
}

.empty {
  background: #fff;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;
}

.main-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.offers-block {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px 14px 14px;
}

.offers-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.offers-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #1d4ed8;
  letter-spacing: -0.02em;
}

.offers-count {
  font-weight: 700;
  color: #64748b;
  font-size: 0.88rem;
}

.offers-arrows {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.offer-arrow {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
  cursor: pointer;
  display: grid;
  place-items: center;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  transition:
    border-color 0.15s ease,
    color 0.15s ease;
}

.offer-arrow:hover {
  border-color: #cbd5e1;
  color: #0f172a;
}

.offers-track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 6px;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}

.offer-card {
  flex: 0 0 min(260px, 78vw);
  display: flex;
  gap: 12px;
  align-items: stretch;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
}

.offer-card img {
  width: 72px;
  height: 92px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.offer-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  padding-bottom: 36px;
}

.offer-name {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.offer-price {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #1d4ed8;
}

.offer-add {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.15s ease;
}

.offer-add:hover:not(:disabled) {
  background: #1d4ed8;
}

.offer-add:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.lines {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.line {
  display: grid;
  grid-template-columns: 88px 1fr auto;
  gap: 14px;
  background: #fff;
  border: 1px solid #dbe5f1;
  border-radius: 8px;
  padding: 12px;
}

.line img {
  width: 88px;
  height: 110px;
  object-fit: cover;
  border-radius: 8px;
}

.meta h2 {
  margin: 0 0 6px;
  font-size: 1rem;
}

.price-unit {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 0.85rem;
}

.qty-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.qty-row label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
}

.qty-row input {
  width: 64px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid #cfdbea;
}

.remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: -6px 0;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition:
    color 160ms ease,
    background 160ms ease;
}

.remove-btn:hover {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
}

.remove-btn:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.25);
  outline-offset: 2px;
}

.line-total {
  font-weight: 800;
  align-self: center;
}

.gift-wrap {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.gift-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
}

.gift-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.gift-icon {
  color: #2563eb;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.gift-text {
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
}

.gift-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  padding: 8px 14px;
  font-size: 0.86rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.gift-add-btn:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}

.gift-chevron {
  transition: transform 0.2s ease;
}

.gift-chevron.open {
  transform: rotate(180deg);
}

.gift-panel {
  padding: 0 16px 16px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}

.gift-desc {
  margin: 12px 0 10px;
  font-size: 0.84rem;
  color: #64748b;
  line-height: 1.5;
}

.gift-check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
}

.gift-check input {
  margin-top: 3px;
}

.summary {
  background: #f8fbff;
  border: 1px solid #dbe5f1;
  border-radius: 8px;
  padding: 16px;
  position: sticky;
  top: 120px;
}

.summary h3 {
  margin: 0 0 12px;
  font-size: 1rem;
}

.row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 8px;
  color: #475569;
}

.row.strong {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #dbe5f1;
  font-weight: 800;
  color: #0f172a;
}

.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 700;
  margin-top: 12px;
  width: 100%;
  box-sizing: border-box;
}

.btn.primary {
  background: #2563eb;
  color: white;
  border: 1px solid #1d4ed8;
}

.btn.checkout {
  background: #2563eb;
  color: #fff;
  border: 1px solid #1d4ed8;
}

.btn.checkout:hover {
  background: #1d4ed8;
}

.hint {
  margin: 10px 0 0;
  font-size: 0.78rem;
  color: #64748b;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .summary {
    position: static;
  }

  .line {
    grid-template-columns: 72px 1fr;
  }

  .line-total {
    grid-column: 2;
    justify-self: end;
  }
}
</style>

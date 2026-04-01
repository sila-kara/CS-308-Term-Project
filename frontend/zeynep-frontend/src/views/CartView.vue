<template>
  <div class="cart-page">
    <div class="page-head">
      <h1>Shopping cart</h1>
      <p v-if="items.length">{{ cartCount }} items</p>
    </div>

    <div v-if="items.length === 0" class="empty">
      <p>Your cart is empty.</p>
      <router-link class="btn primary" to="/">Continue shopping</router-link>
    </div>

    <div v-else class="layout">
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
              <button type="button" class="link" @click="removeFromCart(item.id)">
                Remove
              </button>
            </div>
          </div>
          <div class="line-total">
            {{ (item.price * item.quantity).toFixed(2) }} TL
          </div>
        </li>
      </ul>

      <aside class="summary">
        <h3>Order summary</h3>
        <div class="row">
          <span>Subtotal</span>
          <span>{{ subtotal.toFixed(2) }} TL</span>
        </div>
        <div class="row">
          <span>Estimated tax</span>
          <span>{{ tax.toFixed(2) }} TL</span>
        </div>
        <div class="row strong">
          <span>Total</span>
          <span>{{ total.toFixed(2) }} TL</span>
        </div>
        <router-link class="btn checkout" to="/checkout">Proceed to checkout</router-link>
        <p class="hint">Sign in required at checkout.</p>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useCartStore } from "../stores/cart";
import { computeCartTotal } from "../utils/cartMath";

const { state, cartCount, removeFromCart, updateItemQuantity } = useCartStore();

const items = computed(() => state.items);
const subtotal = computed(() => computeCartTotal(items.value));
const tax = computed(() => Math.round(subtotal.value * 0.1 * 100) / 100);
const total = computed(() => subtotal.value + tax.value);

function onQty(id, raw) {
  updateItemQuantity(id, raw);
}
</script>

<style scoped>
.cart-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.page-head {
  display: flex;
  align-items: baseline;
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
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.empty {
  background: #fff;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;
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
  border-radius: 14px;
  padding: 12px;
}

.line img {
  width: 88px;
  height: 110px;
  object-fit: cover;
  border-radius: 10px;
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

.link {
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 0.85rem;
}

.line-total {
  font-weight: 800;
  align-self: center;
}

.summary {
  background: #f8fbff;
  border: 1px solid #dbe5f1;
  border-radius: 14px;
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
  border-radius: 12px;
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
  background: linear-gradient(145deg, #facc15, #f59e0b);
  color: #1f2937;
  border: 1px solid #f59e0b;
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

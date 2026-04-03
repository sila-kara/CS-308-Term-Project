<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="modelValue" class="drawer-root">
        <div class="drawer-backdrop" aria-hidden="true" @click="close" />
        <aside
          id="mini-cart-dialog"
          class="drawer-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mini-cart-heading"
          @click.stop
        >
          <header class="drawer-head">
            <h2 id="mini-cart-heading">
              <template v-if="items.length === 0">My Cart</template>
              <template v-else>
                My Cart ({{ lineCount }} {{ lineCount === 1 ? "item" : "items" }})
              </template>
            </h2>
            <button type="button" class="drawer-close" aria-label="Close cart" @click="close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div v-if="items.length === 0" class="drawer-empty">
            <p>Your cart is empty.</p>
            <button type="button" class="btn-continue" @click="browse">Continue shopping</button>
          </div>

          <template v-else>
            <div class="drawer-scroll">
              <article v-for="item in items" :key="item.id" class="cart-line">
                <div class="line-img-wrap">
                  <img :src="item.image" :alt="item.name" />
                </div>
                <div class="line-body">
                  <button
                    type="button"
                    class="line-remove"
                    aria-label="Remove from cart"
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
                  <h3 class="line-title">{{ item.name }}</h3>
                  <p class="line-qty">Quantity: {{ item.quantity }}</p>
                  <p class="line-price">{{ formatMoney(item.price * item.quantity) }} TL</p>
                </div>
              </article>
            </div>

            <p class="drawer-notice">
              Shipping and discount totals will be calculated at the payment step.
            </p>

            <div class="drawer-subtotal">
              <span class="subtotal-label">Subtotal</span>
              <span class="subtotal-value">{{ formatMoney(subtotal) }} TL</span>
            </div>

            <div class="drawer-actions">
              <button type="button" class="btn-cart" @click="goToCart">Go to cart</button>
            </div>
          </template>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";
import { computeCartTotal } from "../utils/cartMath";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const router = useRouter();
const { state, removeFromCart } = useCartStore();

const items = computed(() => state.items);
const lineCount = computed(() => items.value.length);
const subtotal = computed(() => computeCartTotal(items.value));

function formatMoney(n) {
  return Number(n).toFixed(2);
}

function close() {
  emit("update:modelValue", false);
}

function goToCart() {
  close();
  router.push("/cart");
}

function browse() {
  close();
  router.push("/");
}

function onKey(e) {
  if (e.key === "Escape" && props.modelValue) close();
}

watch(
  () => props.modelValue,
  (open) => {
    document.body.style.overflow = open ? "hidden" : "";
  },
  { immediate: true },
);

onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => {
  window.removeEventListener("keydown", onKey);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.drawer-root {
  position: fixed;
  inset: 0;
  z-index: 400;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
}

.drawer-root > * {
  pointer-events: auto;
}

.drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
}

.drawer-panel {
  position: relative;
  width: min(400px, 100vw);
  max-height: 100%;
  background: #ffffff;
  border-left: 1px solid #e2e8f0;
  box-shadow: -8px 0 32px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 14px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.drawer-head h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.drawer-close {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #0f172a;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.15s ease;
}

.drawer-close:hover {
  background: #f1f5f9;
}

.drawer-empty {
  padding: 36px 20px;
  text-align: center;
  color: #64748b;
}

.drawer-empty p {
  margin: 0 0 16px;
  font-size: 0.95rem;
}

.btn-continue {
  border-radius: 4px;
  padding: 10px 18px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  border: 1px solid #0f172a;
  background: #fff;
  color: #0f172a;
}

.btn-continue:hover {
  background: #f8fafc;
}

.drawer-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 18px;
}

.cart-line {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.cart-line:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.line-img-wrap {
  flex-shrink: 0;
  width: 72px;
  height: 92px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  background: #fff;
  overflow: hidden;
}

.line-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.line-body {
  flex: 1;
  min-width: 0;
  position: relative;
  padding-right: 36px;
}

.line-remove {
  position: absolute;
  top: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #0f172a;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.15s ease;
}

.line-remove:hover {
  background: #f1f5f9;
}

.line-title {
  margin: 0 0 8px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding-right: 4px;
}

.line-qty {
  margin: 0 0 6px;
  font-size: 0.82rem;
  color: #64748b;
}

.line-price {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
}

.drawer-notice {
  margin: 0 18px 16px;
  padding: 12px 14px;
  text-align: center;
  font-size: 0.78rem;
  line-height: 1.45;
  color: #475569;
  background: #f1f5f9;
  border-radius: 4px;
}

.drawer-subtotal {
  padding: 0 18px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.subtotal-label {
  font-size: 0.88rem;
  color: #64748b;
  font-weight: 600;
}

.subtotal-value {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
}

.drawer-actions {
  padding: 0 18px 22px;
  flex-shrink: 0;
}

.btn-cart {
  width: 100%;
  border: none;
  border-radius: 4px;
  padding: 14px 16px;
  font-size: 0.92rem;
  font-weight: 800;
  cursor: pointer;
  background: #0f172a;
  color: #ffffff;
  transition: background 0.15s ease;
}

.btn-cart:hover {
  background: #1e293b;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}

.drawer-enter-active .drawer-panel,
.drawer-leave-active .drawer-panel {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-panel,
.drawer-leave-to .drawer-panel {
  transform: translateX(100%);
}

@media (prefers-reduced-motion: reduce) {
  .drawer-enter-active,
  .drawer-leave-active,
  .drawer-enter-active .drawer-panel,
  .drawer-leave-active .drawer-panel {
    transition: none;
  }
}
</style>

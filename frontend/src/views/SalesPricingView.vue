<template>
  <div class="sales-page">
    <header class="page-head">
      <p class="eyebrow">Sales Manager</p>
      <h1>Pricing & Discounts</h1>
      <p>Update product list prices, costs, and persistent discount campaigns.</p>
    </header>

    <div v-if="productsState.loading" class="state">Loading products...</div>
    <div v-else-if="productsState.error" class="state error">{{ productsState.error }}</div>

    <div v-else class="pricing-list">
      <article v-for="product in productsState.products" :key="product.id" class="pricing-row">
        <img :src="product.image" :alt="product.name" class="cover" />

        <div class="product-main">
          <div>
            <p class="category">{{ product.category || "Uncategorized" }}</p>
            <h2>{{ product.name }}</h2>
            <p class="meta">{{ product.model }} · Stock {{ product.quantity }}</p>
          </div>
          <div class="current-price">
            <span v-if="isOnSale(product)" class="discounted">{{ product.discountedPrice.toFixed(2) }} TL</span>
            <span :class="{ crossed: isOnSale(product) }">{{ product.price.toFixed(2) }} TL</span>
            <small v-if="isOnSale(product)">%{{ Math.round(product.discountRate) }} off</small>
          </div>
        </div>

        <form v-if="forms[product.id]" class="pricing-form" @submit.prevent="save(product)">
          <label>
            Price
            <input v-model.number="forms[product.id].price" type="number" min="0" step="0.01" />
          </label>
          <label>
            Cost
            <input v-model.number="forms[product.id].cost" type="number" min="0" step="0.01" />
          </label>
          <label>
            Discount %
            <input v-model.number="forms[product.id].discountRate" type="number" min="0" max="100" step="1" />
          </label>
          <label>
            Start
            <input v-model="forms[product.id].discountStartDate" type="date" />
          </label>
          <label>
            End
            <input v-model="forms[product.id].discountEndDate" type="date" />
          </label>
          <div class="preview">
            <span>New price</span>
            <strong>{{ previewPrice(product.id).toFixed(2) }} TL</strong>
          </div>
          <button class="save-btn" type="submit" :disabled="saving[product.id]">
            {{ saving[product.id] ? "Saving..." : "Save" }}
          </button>
        </form>
      </article>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "SalesPricingView" });
import { onMounted, reactive, watch } from "vue";
import { useProductsStore } from "../stores/products";
import { isOnSale } from "../utils/productUtils";

const { state: productsState, fetchProducts, updatePricing } = useProductsStore();
const forms = reactive({});
const saving = reactive({});

function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function syncForms() {
  for (const product of productsState.products) {
    if (forms[product.id]) continue;
    forms[product.id] = {
      price: product.price ?? 0,
      cost: product.cost ?? 0,
      discountRate: product.discountRate ?? 0,
      discountStartDate: toDateInput(product.discountStartDate),
      discountEndDate: toDateInput(product.discountEndDate),
    };
  }
}

function previewPrice(productId) {
  const form = forms[productId];
  if (!form) return 0;
  const price = Number(form.price) || 0;
  const rate = Number(form.discountRate) || 0;
  return Math.round(price * (1 - rate / 100) * 100) / 100;
}

async function save(product) {
  const form = forms[product.id];
  saving[product.id] = true;
  try {
    const updated = await updatePricing(product.id, {
      price: form.price,
      cost: form.cost,
      discountRate: form.discountRate,
      discountStartDate: form.discountStartDate || null,
      discountEndDate: form.discountEndDate || null,
    });
    forms[product.id] = {
      price: updated.price ?? 0,
      cost: updated.cost ?? 0,
      discountRate: updated.discountRate ?? 0,
      discountStartDate: toDateInput(updated.discountStartDate),
      discountEndDate: toDateInput(updated.discountEndDate),
    };
  } catch (e) {
    alert(e.response?.data?.message || "Failed to update pricing.");
  } finally {
    saving[product.id] = false;
  }
}

onMounted(async () => {
  await fetchProducts();
  syncForms();
});

watch(() => productsState.products.length, syncForms);
</script>

<style scoped>
.sales-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 20px 64px;
  color: #111827;
}
.page-head { margin-bottom: 24px; }
.eyebrow {
  margin: 0 0 6px;
  color: #047857;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
h1 { margin: 0 0 8px; font-size: 1.85rem; }
.page-head p:last-child {
  margin: 0;
  color: #4b5563;
  line-height: 1.5;
}
.state {
  text-align: center;
  padding: 56px 20px;
  color: #6b7280;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.state.error {
  color: #991b1b;
  background: #fef2f2;
  border-color: #fecaca;
}
.pricing-list {
  display: grid;
  gap: 12px;
}
.pricing-row {
  display: grid;
  grid-template-columns: 58px minmax(220px, 1fr);
  gap: 14px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 14px;
}
.cover {
  width: 58px;
  height: 76px;
  object-fit: cover;
  border-radius: 6px;
  background: #f3f4f6;
}
.product-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.category {
  margin: 0 0 4px;
  color: #047857;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}
h2 {
  margin: 0 0 5px;
  font-size: 1rem;
}
.meta {
  margin: 0;
  color: #6b7280;
  font-size: 0.84rem;
}
.current-price {
  display: grid;
  justify-items: end;
  gap: 2px;
  color: #111827;
  font-weight: 800;
  white-space: nowrap;
}
.current-price small { color: #047857; }
.discounted { color: #059669; }
.crossed {
  color: #6b7280;
  text-decoration: line-through;
}
.pricing-form {
  grid-column: 2;
  display: grid;
  grid-template-columns: repeat(5, minmax(105px, 1fr)) minmax(100px, auto) auto;
  gap: 8px;
  align-items: end;
}
label {
  display: grid;
  gap: 4px;
  color: #4b5563;
  font-size: 0.78rem;
  font-weight: 700;
}
input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  padding: 8px 9px;
  color: #111827;
}
.preview {
  display: grid;
  gap: 4px;
  color: #6b7280;
  font-size: 0.78rem;
}
.preview strong {
  color: #047857;
  font-size: 0.92rem;
}
.save-btn {
  border: none;
  border-radius: 8px;
  padding: 9px 16px;
  background: #059669;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}
.save-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
@media (max-width: 980px) {
  .pricing-form {
    grid-template-columns: repeat(2, minmax(130px, 1fr));
  }
}
@media (max-width: 640px) {
  .pricing-row {
    grid-template-columns: 1fr;
  }
  .pricing-form {
    grid-column: 1;
    grid-template-columns: 1fr;
  }
  .product-main {
    display: grid;
  }
  .current-price {
    justify-items: start;
  }
}
</style>

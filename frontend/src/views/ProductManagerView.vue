<template>
  <div class="pm-page">
    <h1>Product Manager Panel</h1>

    <div class="tabs">
      <button
        type="button"
        class="tab"
        :class="{ active: activeTab === 'delivery' }"
        @click="activeTab = 'delivery'"
      >
        Delivery List
      </button>
      <button
        type="button"
        class="tab"
        :class="{ active: activeTab === 'stock' }"
        @click="activeTab = 'stock'"
      >
        Stock Management
      </button>
    </div>

    <!-- ── DELIVERY LIST ── -->
    <section v-if="activeTab === 'delivery'">
      <p v-if="ordersLoading" class="muted">Loading orders…</p>
      <p v-else-if="ordersError" class="error">{{ ordersError }}</p>
      <div v-else-if="orders.length === 0" class="empty">No orders yet.</div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Delivery ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Address</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order._id">
            <td class="mono">{{ order._id }}</td>
            <td>
              <span v-if="order.userId">
                {{ order.userId.name || "—" }}<br />
                <span class="muted small">{{ order.userId.email }}</span>
              </span>
              <span v-else class="muted">—</span>
            </td>
            <td>
              <ul class="item-list">
                <li v-for="item in order.items" :key="item.productId">
                  {{ item.name }} ×{{ item.quantity }}
                </li>
              </ul>
            </td>
            <td>{{ order.total.toFixed(2) }} TL</td>
            <td>{{ order.deliveryAddress || "—" }}</td>
            <td>
              <span class="pill" :class="order.status">{{ order.status }}</span>
            </td>
            <td>
              <button
                v-if="order.status !== 'delivered'"
                type="button"
                class="btn-advance"
                @click="advanceOrder(order)"
              >
                Advance
              </button>
              <span v-else class="done-label">Completed</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- ── STOCK MANAGEMENT ── -->
    <section v-if="activeTab === 'stock'">
      <p v-if="productsLoading" class="muted">Loading products…</p>
      <p v-else-if="productsError" class="error">{{ productsError }}</p>
      <div v-else-if="products.length === 0" class="empty">No products found.</div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Serial</th>
            <th>Price</th>
            <th>Current Stock</th>
            <th>Set Stock</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product._id">
            <td>{{ product.name }}</td>
            <td class="mono small">{{ product.serialNumber }}</td>
            <td>{{ product.price.toFixed(2) }} TL</td>
            <td>
              <span :class="product.quantity === 0 ? 'out-of-stock' : 'in-stock'">
                {{ product.quantity }}
              </span>
            </td>
            <td class="stock-edit">
              <input
                type="number"
                min="0"
                v-model.number="stockEdits[product._id]"
                class="stock-input"
              />
              <button
                type="button"
                class="btn-save"
                @click="saveStock(product)"
              >
                Save
              </button>
              <span v-if="saveStatus[product._id]" class="save-msg">
                {{ saveStatus[product._id] }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const activeTab = ref("delivery");

// ── Delivery list state ──
const orders = ref([]);
const ordersLoading = ref(false);
const ordersError = ref("");

// ── Stock management state ──
const products = ref([]);
const productsLoading = ref(false);
const productsError = ref("");
const stockEdits = ref({});
const saveStatus = ref({});

async function loadOrders() {
  ordersLoading.value = true;
  ordersError.value = "";
  try {
    const res = await axios.get("http://localhost:5050/api/orders/all");
    orders.value = res.data;
  } catch (err) {
    ordersError.value = err.response?.data?.message || "Could not load orders.";
  } finally {
    ordersLoading.value = false;
  }
}

async function loadProducts() {
  productsLoading.value = true;
  productsError.value = "";
  try {
    const res = await axios.get("http://localhost:5050/api/products");
    products.value = res.data;
    res.data.forEach((p) => {
      stockEdits.value[p._id] = p.quantity;
    });
  } catch (err) {
    productsError.value = err.response?.data?.message || "Could not load products.";
  } finally {
    productsLoading.value = false;
  }
}

async function advanceOrder(order) {
  try {
    const res = await axios.patch(
      `http://localhost:5050/api/orders/${order._id}/status`
    );
    order.status = res.data.status;
  } catch (err) {
    alert(err.response?.data?.message || "Could not advance status.");
  }
}

async function saveStock(product) {
  const newQty = stockEdits.value[product._id];
  if (newQty == null || newQty < 0) return;
  try {
    await axios.patch(
      `http://localhost:5050/api/products/${product._id}/stock`,
      { quantity: newQty }
    );
    product.quantity = newQty;
    saveStatus.value[product._id] = "Saved ✓";
    setTimeout(() => { saveStatus.value[product._id] = ""; }, 2000);
  } catch (err) {
    saveStatus.value[product._id] = "Error";
  }
}

onMounted(() => {
  loadOrders();
  loadProducts();
});
</script>

<style scoped>
.pm-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 20px 48px;
}

h1 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0;
}

.tab {
  padding: 10px 22px;
  border: none;
  background: none;
  font-weight: 600;
  font-size: 0.95rem;
  color: #64748b;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: color 0.15s, border-color 0.15s;
}

.tab.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.data-table th {
  text-align: left;
  padding: 10px 12px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}

.data-table tr:hover td {
  background: #f8fafc;
}

.mono { font-family: monospace; font-size: 0.78rem; color: #64748b; }
.small { font-size: 0.78rem; }
.muted { color: #94a3b8; font-size: 0.82rem; }

.item-list {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.82rem;
}

.pill {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}

.pill.processing { background: #fef9c3; color: #854d0e; }
.pill.in-transit  { background: #dbeafe; color: #1d4ed8; }
.pill.delivered   { background: #dcfce7; color: #166534; }

.btn-advance {
  padding: 5px 12px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-advance:hover { background: #1d4ed8; }

.done-label { color: #16a34a; font-size: 0.82rem; font-weight: 600; }

.in-stock  { color: #16a34a; font-weight: 700; }
.out-of-stock { color: #dc2626; font-weight: 700; }

.stock-edit { display: flex; align-items: center; gap: 8px; }

.stock-input {
  width: 72px;
  padding: 5px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.88rem;
}

.btn-save {
  padding: 5px 12px;
  background: #0f172a;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-save:hover { background: #1e293b; }

.save-msg { font-size: 0.8rem; color: #16a34a; font-weight: 600; }

.error { color: #dc2626; }
.empty { color: #94a3b8; padding: 20px 0; }
</style>

<template>
  <div class="orders">
    <div class="head">
      <h1>Your orders</h1>
      <router-link to="/">Back to shop</router-link>
    </div>

    <p v-if="loading" class="empty">Loading orders...</p>
    <p v-else-if="error" class="empty">{{ error }}</p>
    <p v-else-if="rows.length === 0" class="empty">You have no orders yet.</p>

    <ul v-else class="list">
      <li v-for="order in rows" :key="order.id">
        <div>
          <p class="id">{{ order.id }}</p>
          <p class="meta">{{ formatDate(order.createdAt) }}</p>
        </div>
        <div class="status" :data-status="order.status">
          {{ label(order.status) }}
        </div>
        <div class="total">{{ order.total.toFixed(2) }} TL</div>
        <router-link class="link" :to="`/orders/${order.id}`">Details</router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { statusLabel } from "../utils/orderStatus";

const rows = ref([]);
const loading = ref(true);
const error = ref("");

async function fetchOrders() {
  loading.value = true;
  error.value = "";

  try {
    const res = await axios.get("http://localhost:5050/api/orders");

    rows.value = (res.data || []).map((order) => ({
      ...order,
      id: order._id || order.id,
    }));
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || "Orders could not be loaded.";
  } finally {
    loading.value = false;
  }
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function label(s) {
  return statusLabel(s);
}

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.orders {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.head h1 {
  margin: 0;
  font-size: 1.6rem;
}

.head a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.list li {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 12px;
  align-items: center;
  background: #fff;
  border: 1px solid #dbe5f1;
  border-radius: 8px;
  padding: 12px 14px;
}

.id {
  margin: 0;
  font-weight: 800;
}

.meta {
  margin: 2px 0 0;
  font-size: 0.82rem;
  color: #64748b;
}

.status {
  font-weight: 700;
  font-size: 0.85rem;
  padding: 6px 10px;
  border-radius: 8px;
  background: #f1f5f9;
  justify-self: end;
}

.status[data-status="processing"] {
  background: #e0f2fe;
  color: #075985;
}

.status[data-status="in-transit"] {
  background: #fef9c3;
  color: #854d0e;
}

.status[data-status="delivered"] {
  background: #dcfce7;
  color: #166534;
}

.total {
  font-weight: 800;
  justify-self: end;
}

.link {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
}

.empty {
  color: #64748b;
}

@media (max-width: 720px) {
  .list li {
    grid-template-columns: 1fr 1fr;
  }

  .total,
  .link {
    justify-self: start;
  }
}
</style>

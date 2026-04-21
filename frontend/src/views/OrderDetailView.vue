<template>
  <div v-if="loading" class="missing">
    <h2>Loading...</h2>
  </div>

  <div v-else-if="error" class="missing">
    <h2>{{ error }}</h2>
    <router-link to="/orders">Back to orders</router-link>
  </div>

  <div v-else-if="order" class="detail">
    <div class="head">
      <button type="button" class="back" @click="router.push('/orders')">
        ← All orders
      </button>
      <h1>{{ order.id }}</h1>
      <p class="muted">Placed {{ formatDate(order.createdAt) }}</p>
    </div>

    <div class="timeline">
      <div
        v-for="step in steps"
        :key="step.key"
        class="step"
        :class="{ done: step.done, current: step.current }"
      >
        <div class="dot" />
        <div>
          <p class="title">{{ step.label }}</p>
          <p class="sub">{{ step.sub }}</p>
        </div>
      </div>
    </div>

    <section class="panel">
      <h2>Current Shipment Status</h2>
      <p class="status-pill">{{ label(order.status) }}</p>
      <button
        v-if="order.status !== 'delivered' && authState.user?.role === 'product_manager'"
        type="button"
        class="btn"
        @click="advance"
      >
        Simulate next status
      </button>
    </section>

    <section class="panel">
      <h2>Items</h2>
      <ul>
        <li
          v-for="row in order.items"
          :key="row.productId || row.id || row.name"
          class="item-row"
        >
          <router-link
            class="name"
            :to="`/product/${row.productId}`"
          >
            {{ row.name }}
          </router-link>

          <span class="qty">×{{ row.quantity }}</span>

          <span class="price">
            {{ (row.price * row.quantity).toFixed(2) }} TL
          </span>
        </li>
      </ul>
      <div class="totals-box">
        <div class="total-row">
          <span>Subtotal</span>
          <span>{{ order.subtotal.toFixed(2) }} TL</span>
        </div>
        <div class="total-row">
          <span>Tax</span>
          <span>{{ order.tax.toFixed(2) }} TL</span>
        </div>
        <div class="total-row strong">
          <span>Total</span>
          <span>{{ order.total.toFixed(2) }} TL</span>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="missing">
    <h2>Order not found</h2>
    <router-link to="/orders">Back to orders</router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import {
  ORDER_STATUS_SEQUENCE,
  statusLabel,
} from "../utils/orderStatus";

const route = useRoute();
const router = useRouter();

const { state: authState } = useAuthStore();

const order = ref(null);
const loading = ref(true);
const error = ref("");

async function fetchOrder() {
  loading.value = true;
  error.value = "";

  try {
    const res = await axios.get(
      `http://localhost:5050/api/orders/${route.params.id}`
    );

    order.value = {
      ...res.data,
      id: res.data._id || res.data.id,
    };
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || "Order not found";
    order.value = null;
  } finally {
    loading.value = false;
  }
}

const steps = computed(() => {
  const current = order.value?.status;
  const idx = ORDER_STATUS_SEQUENCE.indexOf(current);

  return [
    {
      key: "processing",
      label: "Processing",
      sub: "Payment confirmed, preparing your parcel.",
      done: idx >= 0,
      current: current === "processing",
    },
    {
      key: "in-transit",
      label: "In transit",
      sub: "Handed to courier, on the way to you.",
      done: idx >= 1,
      current: current === "in-transit",
    },
    {
      key: "delivered",
      label: "Delivered",
      sub: "Package delivered. Enjoy reading!",
      done: idx >= 2,
      current: current === "delivered",
    },
  ];
});

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

async function advance() {
  if (!order.value) return;

  try {
    const res = await axios.patch(
      `http://localhost:5050/api/orders/${order.value.id}/status`
    );

    order.value = res.data;
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  fetchOrder();
});
</script>

<style scoped>
.detail {
  max-width: 820px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.head h1 {
  margin: 8px 0 4px;
}

.muted {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.back {
  border: none;
  background: none;
  color: #2563eb;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.timeline {
  margin: 20px 0;
  border: 1px solid #dbe5f1;
  border-radius: 8px;
  padding: 14px;
  background: #fff;
  display: grid;
  gap: 12px;
}

.step {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  align-items: start;
  opacity: 0.45;
}

.step.done {
  opacity: 1;
}

.step.current .title {
  font-weight: 800;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e2e8f0;
  margin-top: 4px;
  justify-self: center;
}

.step.done .dot {
  background: #22c55e;
}

.step.current .dot {
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.25);
  background: #2563eb;
}

.title {
  margin: 0;
  font-size: 0.95rem;
}

.sub {
  margin: 4px 0 0;
  font-size: 0.82rem;
  color: #64748b;
}

.panel {
  background: #fff;
  border: 1px solid #dbe5f1;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.panel h2 {
  margin: 0 0 10px;
  font-size: 1.05rem;
}

.status-pill {
  display: inline-block;
  margin: 0 0 10px;
  padding: 6px 10px;
  border-radius: 8px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  font-weight: 700;
  font-size: 0.85rem;
}

.btn {
  border-radius: 8px;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  font-weight: 700;
  cursor: pointer;
}

.panel ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.panel li {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  font-size: 0.9rem;
}

.missing {
  text-align: center;
  padding: 48px 16px;
}

.item-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 6px 0;
}

.name {
  font-weight: 600;
  text-decoration: none;
  color: #1e293b;
}

.name:hover {
  color: #2563eb;
}

.qty {
  font-weight: 600;
}

.price {
  font-weight: 700;
}

.totals-box {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  color: #475569;
}

.total-row.strong {
  font-weight: 800;
  color: #0f172a;
}
</style>

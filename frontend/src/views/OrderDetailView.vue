<template>
  <div class="detail" v-if="order">
    <div class="head">
      <button type="button" class="back" @click="router.push('/orders')">
        ← All orders
      </button>
      <h1>{{ order.invoiceNumber ?? order._id }}</h1>
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
      <h2>Shipment status</h2>
      <p class="status-pill">{{ label(order.status) }}</p>
      <template v-if="isAdmin">
        <button
          v-if="order.status !== 'delivered'"
          type="button"
          class="btn"
          @click="advance"
        >
          Simulate next status
        </button>
      </template>
    </section>

    <section class="panel">
      <h2>Items</h2>
      <ul>
        <li v-for="(row, i) in order.items" :key="i">
          <span>{{ row.name }}</span>
          <span>×{{ row.quantity }}</span>
          <span>{{ (row.price * row.quantity).toFixed(2) }} TL</span>
        </li>
      </ul>
    </section>
  </div>

  <div v-else-if="loading" class="missing">
    <p>Loading order...</p>
  </div>

  <div v-else class="missing">
    <h2>Order not found</h2>
    <router-link to="/orders">Back to orders</router-link>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOrdersStore } from "../stores/orders";
import { useAuthStore } from "../stores/auth";
import {
  ORDER_STATUS_SEQUENCE,
  statusLabel,
  nextDeliveryStatus,
} from "../utils/orderStatus";
import api from "../utils/api.js";

const route = useRoute();
const router = useRouter();
const { getOrderById } = useOrdersStore();
const { state: authState } = useAuthStore();
const isAdmin = computed(() => authState.user?.role === "product_manager" || authState.user?.role === "admin");

const order = ref(null);
const loading = ref(true);

onMounted(async () => {
  order.value = await getOrderById(route.params.id);
  loading.value = false;
});

const steps = computed(() => {
  const current = order.value?.status ?? "processing";
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
    // Tries backend (works for product_manager role)
    const { data } = await api.patch(`/orders/${order.value._id}/status`);
    order.value = data;
  } catch {
    // Demo fallback: advance locally so status timeline updates
    order.value = { ...order.value, status: nextDeliveryStatus(order.value.status) };
  }
}
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

.demo-note {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0 0 10px;
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
</style>

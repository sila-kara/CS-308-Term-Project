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
      <p class="status-pill" :class="order.status">{{ label(order.status) }}</p>
      <template v-if="order.status === 'processing'">
        <button class="btn cancel-btn" :disabled="cancelling" @click="cancelOrder">
          {{ cancelling ? "Cancelling…" : "Cancel order" }}
        </button>
        <p v-if="cancelError" class="err">{{ cancelError }}</p>
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

    <!-- Return section (delivered only) -->
    <section v-if="order.status === 'delivered'" class="panel">
      <h2>Returns</h2>

      <!-- Already requested -->
      <div v-if="order.returnStatus === 'requested'" class="return-done">
        <p class="return-badge pending">⏳ Return request pending review</p>
        <p class="hint">Our team will review your request and email you shortly.</p>
      </div>
      <div v-else-if="order.returnStatus === 'approved'" class="return-done">
        <p class="return-badge approved">✅ Return approved!</p>
        <p><strong>Cargo company:</strong> {{ order.returnCargoCompany }}</p>
        <p><strong>Tracking code:</strong> <code>{{ order.returnCargoCode }}</code></p>
        <p class="hint">Please drop off your parcel at any <strong>{{ order.returnCargoCompany }}</strong> branch within <strong>7 days</strong> using this code.</p>
      </div>
      <div v-else-if="order.returnStatus === 'rejected'" class="return-done">
        <p class="return-badge rejected">❌ Return request declined</p>
        <p v-if="order.returnRejectionReason" class="hint">Reason: {{ order.returnRejectionReason }}</p>
      </div>

      <!-- Return form -->
      <div v-else>
        <p class="return-hint">Changed your mind? Request a return within 30 days of delivery.</p>

        <div class="return-form">
          <label class="field-label">Items to return</label>
          <div v-for="(item, i) in order.items" :key="i" class="item-check">
            <label>
              <input type="checkbox" :value="returnItemValue(item)" v-model="returnItems" />
              {{ item.name }} ×{{ item.quantity }}
            </label>
          </div>

          <label class="field-label">Reason <span class="req">*</span></label>
          <textarea v-model="returnReason" rows="3" placeholder="e.g. Wrong item received, damaged in transit…" class="reason-input" />

          <label class="field-label">Photo <span class="opt">(optional)</span></label>
          <input type="file" accept="image/*" @change="onPhoto" class="file-input" />
          <img v-if="photoPreview" :src="photoPreview" class="photo-preview" />

          <p v-if="returnError" class="err">{{ returnError }}</p>
          <button class="btn primary" :disabled="returnSubmitting || !returnReason.trim() || returnItems.length === 0" @click="submitReturn">
            {{ returnSubmitting ? "Submitting…" : "Request Return" }}
          </button>
        </div>
      </div>
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

const cancelling = ref(false);
const cancelError = ref("");

async function cancelOrder() {
  if (!confirm("Are you sure you want to cancel this order?")) return;
  cancelling.value = true;
  cancelError.value = "";
  try {
    const { data } = await api.patch(`/orders/${order.value._id}/cancel`);
    order.value = data;
  } catch (e) {
    cancelError.value = e.response?.data?.message || "Failed to cancel order.";
  } finally {
    cancelling.value = false;
  }
}

const returnItems = ref([]);
const returnReason = ref("");
const photoPreview = ref(null);
const returnSubmitting = ref(false);
const returnError = ref("");

function onPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { photoPreview.value = ev.target.result; };
  reader.readAsDataURL(file);
}

function returnItemValue(item) {
  return String(item.productId || item.id || item._id || item.name);
}

async function submitReturn() {
  returnError.value = "";
  if (!returnReason.value.trim()) {
    returnError.value = "Please enter a reason.";
    return;
  }
  if (returnItems.value.length === 0) {
    returnError.value = "Please select at least one item.";
    return;
  }
  returnSubmitting.value = true;
  try {
    const { data } = await api.post(`/orders/${order.value._id}/return`, {
      returnItems: returnItems.value,
      returnReason: returnReason.value.trim(),
      returnPhoto: photoPreview.value || null,
    });
    order.value = data;
  } catch (e) {
    returnError.value = e.response?.data?.message || "Something went wrong.";
  } finally {
    returnSubmitting.value = false;
  }
}

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

.status-pill.cancelled { background: #fee2e2; border-color: #fca5a5; color: #991b1b; }
.cancel-btn { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; margin-top: 10px; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.88rem; }
.cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.err { color: #b91c1c; font-size: 0.85rem; margin: 4px 0 0; }
.return-done { display: grid; gap: 6px; font-size: 0.9rem; }
.return-badge { font-weight: 700; margin: 0; }
.return-badge.pending  { color: #92400e; }
.return-badge.approved { color: #166534; }
.return-badge.rejected { color: #991b1b; }
code { background: #e2e8f0; border-radius: 4px; padding: 2px 6px; font-size: 0.85rem; }
.hint { color: #64748b; font-size: 0.82rem; margin: 4px 0 0; }

.return-hint { color: #64748b; font-size: 0.88rem; margin: 0 0 14px; }
.return-form { display: grid; gap: 10px; }
.field-label { font-size: 0.85rem; font-weight: 600; color: #334155; }
.req { color: #b91c1c; }
.opt { color: #94a3b8; font-weight: 400; }
.item-check label { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer; }
.reason-input {
  width: 100%; border: 1px solid #cfdbea; border-radius: 8px;
  padding: 10px; font-size: 0.9rem; resize: vertical;
}
.file-input { font-size: 0.85rem; }
.photo-preview { max-width: 200px; border-radius: 8px; border: 1px solid #e2e8f0; }
.btn.primary { background: #2563eb; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.err { color: #b91c1c; font-size: 0.85rem; margin: 0; }
</style>

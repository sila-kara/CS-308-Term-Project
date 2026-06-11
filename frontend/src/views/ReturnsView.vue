<template>
  <div class="info-page">
    <h1>Returns &amp; Refunds</h1>
    <p class="lead">Request a return for delivered orders within 30 days of delivery.</p>

    <!-- Logged-in: delivered orders -->
    <template v-if="isLoggedIn">
      <div v-if="loading" class="card" style="text-align:center;padding:40px">Loading your orders…</div>

      <template v-else-if="deliveredOrders.length">
        <section v-if="returnHistoryOrders.length" class="history-section">
          <h2>Return history</h2>
          <div v-for="order in returnHistoryOrders" :key="`history-${order._id}`" class="card order-card">
            <div class="order-header">
              <span class="inv">{{ order.invoiceNumber }}</span>
              <span class="date">Delivered {{ formatDate(deliveryDate(order)) }}</span>
            </div>
            <div v-if="order.returnStatus === 'requested'" class="return-info pending">
              <p class="return-badge">🕐 Return request pending</p>
              <p><strong>Requested items:</strong> {{ returnedItemNames(order) }}</p>
              <p v-if="order.returnReason"><strong>Reason:</strong> {{ order.returnReason }}</p>
              <p class="hint">Your return request is being reviewed. You will be notified by email once it is approved or rejected.</p>
            </div>

            <div v-else-if="order.returnStatus === 'approved'" class="return-info approved">
              <p class="return-badge">✅ Return approved</p>
              <p><strong>Requested items:</strong> {{ returnedItemNames(order) }}</p>
              <p><strong>Refund amount:</strong> {{ money(order.returnRefundAmount) }}</p>
              <p><strong>Cargo company:</strong> {{ order.returnCargoCompany }}</p>
              <p><strong>Tracking code:</strong> <code>{{ order.returnCargoCode }}</code></p>
              <p class="hint">Drop the parcel off at any {{ order.returnCargoCompany }} branch within 7 days using this code.</p>
            </div>

            <div v-else-if="order.returnStatus === 'rejected'" class="return-info rejected">
              <p class="return-badge">❌ Return rejected</p>
              <p><strong>Requested items:</strong> {{ returnedItemNames(order) }}</p>
              <p v-if="order.returnReason"><strong>Reason:</strong> {{ order.returnReason }}</p>
              <p v-if="order.returnRejectionReason" class="hint">Rejected: {{ order.returnRejectionReason }}</p>
            </div>

            <div v-else-if="order.returnStatus === 'refunded'" class="return-info refunded">
              <p class="return-badge">💳 Refund completed</p>
              <p><strong>Returned items:</strong> {{ returnedItemNames(order) }}</p>
              <p><strong>Refund amount:</strong> {{ money(order.returnRefundAmount) }}</p>
              <p v-if="order.returnRefundedAt" class="hint">Refunded on {{ formatDate(order.returnRefundedAt) }}.</p>
            </div>
          </div>
        </section>

        <section v-if="returnableOrders.length" class="history-section">
          <h2>Available return requests</h2>
          <div v-for="order in returnableOrders" :key="order._id" class="card order-card">
            <div class="order-header">
              <span class="inv">{{ order.invoiceNumber }}</span>
              <span class="date">Delivered {{ formatDate(deliveryDate(order)) }}</span>
            </div>

            <!-- Window expired -->
            <div v-if="!isWithinWindow(order)" class="expired-info">
              ⏳ Return window has expired (30 days)
            </div>

            <!-- Initiate return -->
            <template v-else>
              <p class="select-label">Select items to return:</p>
              <div v-for="(item, i) in order.items" :key="i" class="item-row">
                <label>
                  <input type="checkbox" :value="returnItemValue(item)" v-model="selected[order._id]" />
                  {{ item.name }} × {{ item.quantity }}
                </label>
              </div>
              <button
                class="btn primary"
                :disabled="!selected[order._id]?.length || submitting[order._id]"
                @click="submitReturn(order)"
              >
                {{ submitting[order._id] ? "Submitting…" : "Request Return" }}
              </button>
              <p v-if="errors[order._id]" class="err">{{ errors[order._id] }}</p>
            </template>
          </div>
        </section>
      </template>

      <div v-else class="card empty-state">
        <div class="icon">📦</div>
        <h2>No delivered orders</h2>
        <p>You have no delivered orders yet.</p>
      </div>
    </template>

    <!-- Not logged in -->
    <div v-else class="card empty-state">
      <div class="icon">🔒</div>
      <h2>Sign in to manage returns</h2>
      <p><router-link to="/login">Sign in</router-link> to see your orders and request a return.</p>
    </div>

    <!-- Policy -->
    <section class="card">
      <h2>Return Policy</h2>
      <ul>
        <li><strong>30-day window:</strong> You may request a return within 30 days of delivery.</li>
        <li><strong>Eligible items:</strong> Books must be in their original, unread condition with no visible damage.</li>
        <li><strong>Damaged or incorrect items:</strong> We will cover the return shipping cost and issue a full refund.</li>
        <li><strong>Change of mind:</strong> Return shipping is the buyer's responsibility. A 10% restocking fee may apply.</li>
        <li><strong>Refund timeline:</strong> Refunds are processed within 5–7 business days after we receive the return.</li>
      </ul>
    </section>

    <p class="contact">Need help? Email us at <a href="mailto:bookworld.store.cs308@gmail.com">bookworld.store.cs308@gmail.com</a></p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useAuthStore } from "../stores/auth";
import api from "../utils/api.js";

const { isLoggedIn } = useAuthStore();
const orders = ref([]);
const loading = ref(false);
const selected = reactive({});
const submitting = reactive({});
const errors = reactive({});

const deliveredOrders = computed(() =>
  orders.value.filter(o => o.status === "delivered")
);

const returnHistoryOrders = computed(() =>
  deliveredOrders.value.filter(o => o.returnStatus)
);

const returnableOrders = computed(() =>
  deliveredOrders.value.filter(o => !o.returnStatus)
);

function deliveryDate(order) {
  return order.deliveredAt || order.updatedAt;
}

function isWithinWindow(order) {
  const days = (Date.now() - new Date(deliveryDate(order))) / (1000 * 60 * 60 * 24);
  return days <= 30;
}

async function loadOrders() {
  if (!isLoggedIn.value) return;
  loading.value = true;
  try {
    const { data } = await api.get("/orders");
    orders.value = data;
    data.forEach(o => { selected[o._id] = []; });
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function submitReturn(order) {
  submitting[order._id] = true;
  errors[order._id] = "";
  try {
    const { data } = await api.post(`/orders/${order._id}/return`, { returnItems: selected[order._id] });
    // update locally
    const idx = orders.value.findIndex(o => o._id === order._id);
    if (idx !== -1) orders.value[idx] = data;
  } catch (e) {
    errors[order._id] = e.response?.data?.message || "Something went wrong.";
  } finally {
    submitting[order._id] = false;
  }
}

function returnItemValue(item) {
  return String(item.productId || item.id || item._id || item.name);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function money(value) {
  return `${Number(value || 0).toFixed(2)} TL`;
}

function returnedItemNames(order) {
  const selectedItems = new Set((order.returnItems || []).map(item => String(item)));
  const names = order.items
    .filter(item => {
      const productId = String(item.productId || item.id || item._id || "");
      return selectedItems.has(productId) || selectedItems.has(item.name);
    })
    .map(item => `${item.name} × ${item.quantity}`);

  return names.length ? names.join(", ") : "Not available";
}

onMounted(loadOrders);
</script>

<style scoped>
.info-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px 64px;
  color: #0f172a;
}
h1 { font-size: 1.9rem; margin: 0 0 8px; }
.lead { color: #475569; margin: 0 0 32px; font-size: 1rem; }

.card {
  background: #fff;
  border: 1px solid #dbe5f1;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}
.card h2 { margin: 0 0 14px; font-size: 1.1rem; }

.history-section { margin-bottom: 28px; }
.history-section h2 {
  margin: 0 0 12px;
  font-size: 1.15rem;
  color: #0f172a;
}

.order-card { display: grid; gap: 12px; }
.order-header { display: flex; justify-content: space-between; align-items: center; }
.inv { font-weight: 700; font-size: 0.95rem; }
.date { font-size: 0.82rem; color: #64748b; }

.select-label { margin: 0; font-size: 0.88rem; font-weight: 600; color: #334155; }
.item-row label { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer; }

.return-info { border-radius: 8px; padding: 14px; }
.return-info.pending  { background: #fefce8; border: 1px solid #fde68a; }
.return-info.approved { background: #f0fdf4; border: 1px solid #bbf7d0; }
.return-info.rejected { background: #fff1f2; border: 1px solid #fecdd3; }
.return-info.refunded { background: #eff6ff; border: 1px solid #bfdbfe; }
.return-badge { margin: 0 0 8px; font-weight: 700; }
.return-info.pending  .return-badge { color: #92400e; }
.return-info.approved .return-badge { color: #166534; }
.return-info.rejected .return-badge { color: #9f1239; }
.return-info.refunded .return-badge { color: #1d4ed8; }
.return-info p { margin: 4px 0; font-size: 0.9rem; }
code { background: #e2e8f0; border-radius: 4px; padding: 2px 6px; font-size: 0.88rem; }
.hint { color: #475569; font-size: 0.82rem; margin-top: 6px !important; }

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
}
.btn.primary { background: #2563eb; color: #fff; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.err { color: #b91c1c; font-size: 0.85rem; margin: 0; }

.expired-info {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.85rem;
  color: #94a3b8;
}

.empty-state { text-align: center; padding: 40px 24px; }
.icon { font-size: 2.5rem; margin-bottom: 12px; }
.empty-state h2 { margin-bottom: 8px; }
.empty-state p { color: #64748b; font-size: 0.92rem; margin: 0; }

ul, ol {
  margin: 0; padding-left: 20px;
  display: grid; gap: 10px;
  font-size: 0.9rem; color: #334155;
}
a { color: #2563eb; }
.contact { margin-top: 24px; font-size: 0.9rem; color: #475569; }
</style>

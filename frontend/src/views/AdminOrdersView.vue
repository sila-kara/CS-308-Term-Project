<template>
  <div class="admin-page">
    <h1>Delivery Management</h1>
    <p class="lead">Track paid orders, delivery addresses, and shipment status. Refund decisions are handled in the Sales Manager panel.</p>

    <div v-if="loading" class="skeleton-list">
      <div v-for="n in 5" :key="n" class="skeleton-card">
        <div class="sk-line wide"></div>
        <div class="sk-line medium"></div>
        <div class="sk-line short"></div>
      </div>
    </div>
    <div v-else-if="error" style="text-align:center;padding:60px;color:#b91c1c">{{ error }}</div>

    <template v-else>
      <!-- View toggle -->
      <div class="view-toggle">
        <button :class="['toggle-btn', { active: viewMode === 'cards' }]" @click="viewMode = 'cards'">Order Cards</button>
        <button :class="['toggle-btn', { active: viewMode === 'delivery' }]" @click="viewMode = 'delivery'">Delivery List</button>
      </div>

      <!-- Filter tabs (cards view only) -->
      <div v-if="viewMode === 'cards'" class="tabs">
        <button
          v-for="tab in tabs" :key="tab.value"
          :class="['tab', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >{{ tab.label }} <span class="badge">{{ countFor(tab.value) }}</span></button>
      </div>

      <!-- ── CARD VIEW ── -->
      <template v-if="viewMode === 'cards'">
        <div v-if="filteredOrders.length === 0" class="empty">No orders in this category.</div>

        <div v-for="order in filteredOrders" :key="order._id" class="order-card">
          <div class="order-top">
            <div>
              <span class="inv">{{ order.invoiceNumber }}</span>
              <span :class="['status-badge', order.status]">{{ order.status }}</span>
            </div>
            <div class="meta">
              <span>{{ order.userId?.name || "—" }}</span>
              <span>{{ order.userId?.email || "—" }}</span>
              <span>{{ formatDate(order.createdAt) }}</span>
              <strong>{{ order.total?.toFixed(2) }} TL</strong>
            </div>
          </div>
          <div class="items">
            <span v-for="(item, i) in order.items" :key="i" class="item-chip">
              {{ item.name }} ×{{ item.quantity }}
            </span>
          </div>
          <div class="actions">
            <button
              v-if="order.status !== 'delivered' && order.status !== 'cancelled'"
              class="btn advance"
              :disabled="advancing[order._id]"
              @click="advance(order)"
            >
              {{ advancing[order._id] ? "Updating…" : `→ ${nextStatus(order.status)}` }}
            </button>
            <span v-else-if="order.status === 'delivered'" class="delivered-tag">✅ Delivered</span>
            <span v-else-if="order.status === 'cancelled'" class="cancelled-tag">🚫 Cancelled</span>
            <button type="button" class="invoice-btn" @click="openInvoice(order._id)">
              View Invoice
            </button>
          </div>
        </div>
      </template>

      <!-- ── DELIVERY LIST VIEW ── -->
      <template v-else>
        <div v-if="orders.length === 0" class="empty">No deliveries found.</div>
        <div v-else class="dl-wrapper">
          <table class="dl-table">
            <thead>
              <tr>
                <th>Delivery ID</th>
                <th>Customer ID</th>
                <th>Product ID</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Total Price</th>
                <th>Delivery Address</th>
                <th>Completed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="order in orders" :key="order._id">
                <tr v-for="(item, i) in order.items" :key="item.productId + i">
                  <td class="mono small" :rowspan="i === 0 ? order.items.length : undefined" v-if="i === 0">
                    {{ order._id }}
                  </td>
                  <td class="mono small" :rowspan="i === 0 ? order.items.length : undefined" v-if="i === 0">
                    {{ order.userId?._id || order.userId || "—" }}
                  </td>
                  <td class="mono small">{{ item.productId }}</td>
                  <td>{{ item.name }}</td>
                  <td class="center">{{ item.quantity }}</td>
                  <td :rowspan="i === 0 ? order.items.length : undefined" v-if="i === 0">
                    {{ order.total?.toFixed(2) }} TL
                  </td>
                  <td :rowspan="i === 0 ? order.items.length : undefined" v-if="i === 0" class="addr">
                    {{ order.deliveryAddress || "—" }}
                  </td>
                  <td :rowspan="i === 0 ? order.items.length : undefined" v-if="i === 0" class="center">
                    <span v-if="order.status === 'delivered'" class="completed-yes">Yes</span>
                    <span v-else-if="order.status === 'cancelled'" class="completed-cancelled">Cancelled</span>
                    <span v-else class="completed-no">No</span>
                  </td>
                  <td :rowspan="i === 0 ? order.items.length : undefined" v-if="i === 0">
                    <div class="action-col">
                      <button
                        v-if="order.status !== 'delivered' && order.status !== 'cancelled'"
                        class="btn advance small-btn"
                        :disabled="advancing[order._id]"
                        @click="advance(order)"
                      >
                        {{ advancing[order._id] ? "…" : `→ ${nextStatus(order.status)}` }}
                      </button>
                      <span v-else-if="order.status === 'delivered'" class="delivered-tag">✅</span>
                      <span v-else class="cancelled-tag">🚫</span>
                      <button type="button" class="invoice-btn" @click="openInvoice(order._id)">Invoice</button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
defineOptions({ name: "AdminOrdersView" });
import { ref, computed, reactive, onMounted } from "vue";
import api from "../utils/api.js";

const orders = ref([]);
const loading = ref(false);
const error = ref("");
const advancing = reactive({});
const activeTab = ref("all");
const viewMode = ref("cards");

const STATUS_NEXT = { processing: "in-transit", "in-transit": "delivered" };
function nextStatus(s) { return STATUS_NEXT[s] || ""; }

const tabs = [
  { label: "All", value: "all" },
  { label: "Processing", value: "processing" },
  { label: "In Transit", value: "in-transit" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const filteredOrders = computed(() => {
  if (activeTab.value === "all") return orders.value;
  return orders.value.filter(o => o.status === activeTab.value);
});

function countFor(tab) {
  if (tab === "all") return orders.value.length;
  return orders.value.filter(o => o.status === tab).length;
}

async function loadOrders() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/orders/admin/all");
    orders.value = data;
  } catch (e) {
    error.value = e.response?.data?.message || "Failed to load orders.";
  } finally {
    loading.value = false;
  }
}

async function advance(order) {
  advancing[order._id] = true;
  try {
    const { data } = await api.patch(`/orders/${order._id}/status`);
    const idx = orders.value.findIndex(o => o._id === order._id);
    if (idx !== -1) orders.value[idx] = { ...orders.value[idx], status: data.status };
  } catch (e) {
    alert(e.response?.data?.message || "Failed to update status.");
  } finally {
    advancing[order._id] = false;
  }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

async function openInvoice(orderId) {
  try {
    const response = await api.get(`/orders/admin/invoices/${orderId}/pdf`, { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (e) {
    alert("Failed to load invoice.");
  }
}

onMounted(loadOrders);
</script>

<style scoped>
@keyframes shimmer {
  0% { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
.skeleton-list { display: grid; gap: 12px; }
.skeleton-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px;
  display: grid;
  gap: 10px;
}
.sk-line {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 600px 100%;
  animation: shimmer 1.4s infinite;
}
.sk-line.wide { width: 100%; }
.sk-line.medium { width: 60%; }
.sk-line.short { width: 35%; }

.admin-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 20px 64px;
  color: #0f172a;
}
h1 { font-size: 1.8rem; margin: 0 0 24px; }
.lead { margin: -14px 0 22px; color: #64748b; font-size: 0.92rem; }

.tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
.tab {
  padding: 7px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  background: #f8fafc;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  display: flex; align-items: center; gap: 6px;
}
.tab.active { background: #1e3a8a; color: #fff; border-color: #1e3a8a; }
.badge {
  background: rgba(255,255,255,0.25);
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 0.78rem;
}
.tab:not(.active) .badge { background: #e2e8f0; color: #334155; }

.order-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 14px;
  display: grid;
  gap: 10px;
}
.order-top { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; }
.inv { font-weight: 700; font-size: 0.95rem; margin-right: 10px; }

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 700;
  margin-right: 6px;
}
.status-badge.processing { background: #fef9c3; color: #854d0e; }
.status-badge.in-transit { background: #dbeafe; color: #1e40af; }
.status-badge.delivered { background: #dcfce7; color: #166534; }
.status-badge.cancelled { background: #fee2e2; color: #991b1b; }

.return-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 700;
}
.return-badge.requested { background: #fce7f3; color: #9d174d; }
.return-badge.approved  { background: #ede9fe; color: #5b21b6; }
.return-badge.refunded  { background: #dcfce7; color: #166534; }

.meta { display: flex; gap: 14px; font-size: 0.82rem; color: #64748b; flex-wrap: wrap; align-items: center; }

.items { display: flex; flex-wrap: wrap; gap: 6px; }
.item-chip {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.82rem;
  color: #334155;
}

.return-info {
  background: #fdf4ff;
  border: 1px solid #e9d5ff;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 0.85rem;
  color: #6b21a8;
  display: grid;
  gap: 10px;
}
.return-top { display: grid; gap: 4px; }
.return-items, .return-reason { color: #475569; font-size: 0.82rem; }
.return-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.approve-btn { background: #22c55e; color: #fff; border: none; border-radius: 8px; padding: 7px 14px; font-weight: 700; cursor: pointer; font-size: 0.85rem; }
.reject-group { display: flex; gap: 6px; }
.reject-input { border: 1px solid #e9d5ff; border-radius: 8px; padding: 7px 10px; font-size: 0.85rem; width: 220px; }
.reject-btn { background: #fee2e2; color: #991b1b; border: none; border-radius: 8px; padding: 7px 14px; font-weight: 700; cursor: pointer; font-size: 0.85rem; }
.approve-btn:disabled, .reject-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.status-tag { font-size: 0.85rem; font-weight: 600; padding: 4px 10px; border-radius: 8px; display: inline-block; }
.status-tag.approved { background: #dcfce7; color: #166534; }
.status-tag.rejected { background: #fee2e2; color: #991b1b; }
code { background: #ede9fe; border-radius: 4px; padding: 1px 6px; font-size: 0.82rem; }

.actions { display: flex; align-items: center; gap: 12px; }
.btn {
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  font-size: 0.85rem;
}
.btn.advance { background: #2563eb; color: #fff; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.return-photo { display: block; max-width: 200px; max-height: 160px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 8px; object-fit: cover; }
.delivered-tag { font-size: 0.85rem; color: #166534; font-weight: 600; }
.cancelled-tag { font-size: 0.85rem; color: #991b1b; font-weight: 600; }
.empty { padding: 40px 0; text-align: center; color: #94a3b8; }

.view-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.toggle-btn {
  padding: 8px 20px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  font-weight: 600;
  font-size: 0.88rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
}
.toggle-btn.active {
  background: #1e3a8a;
  color: #fff;
  border-color: #1e3a8a;
}

.dl-wrapper {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}
.dl-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}
.dl-table th {
  background: #f1f5f9;
  padding: 10px 12px;
  text-align: left;
  font-weight: 700;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}
.dl-table td {
  padding: 9px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.dl-table tr:last-child td { border-bottom: none; }
.dl-table tr:hover td { background: #f8fafc; }
.mono { font-family: monospace; color: #64748b; }
.small { font-size: 0.75rem; }
.center { text-align: center; }
.addr { max-width: 180px; word-break: break-word; }
.small-btn { padding: 5px 10px; font-size: 0.78rem; }
.completed-yes { color: #16a34a; font-weight: 700; }
.completed-no { color: #dc2626; font-weight: 700; }
.completed-cancelled { color: #94a3b8; font-weight: 600; }
.action-col { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
.invoice-btn {
  padding: 4px 12px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #1e40af;
  text-decoration: none;
  white-space: nowrap;
}
.invoice-btn:hover { background: #dbeafe; }
.cancelled-tag { font-size: 0.85rem; color: #991b1b; font-weight: 600; }

.empty { text-align: center; padding: 60px; color: #94a3b8; font-size: 0.95rem; }
</style>

<template>
  <div class="admin-page">
    <h1>Order Management</h1>

    <div v-if="loading" style="text-align:center;padding:60px;color:#64748b">Loading orders…</div>
    <div v-else-if="error" style="text-align:center;padding:60px;color:#b91c1c">{{ error }}</div>

    <template v-else>
      <!-- Filter tabs -->
      <div class="tabs">
        <button
          v-for="tab in tabs" :key="tab.value"
          :class="['tab', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >{{ tab.label }} <span class="badge">{{ countFor(tab.value) }}</span></button>
      </div>

      <div v-if="filteredOrders.length === 0" class="empty">No orders in this category.</div>

      <div v-for="order in filteredOrders" :key="order._id" class="order-card">
        <div class="order-top">
          <div>
            <span class="inv">{{ order.invoiceNumber }}</span>
            <span :class="['status-badge', order.status]">{{ order.status }}</span>
            <span v-if="order.returnStatus" :class="['return-badge', order.returnStatus]">
              return: {{ order.returnStatus }}
            </span>
          </div>
          <div class="meta">
            <span>{{ order.userId?.name || "—" }}</span>
            <span>{{ order.userId?.email || "—" }}</span>
            <span>{{ formatDate(order.createdAt) }}</span>
            <strong>{{ order.total?.toFixed(2) }} TL</strong>
          </div>
        </div>

        <!-- Items -->
        <div class="items">
          <span v-for="(item, i) in order.items" :key="i" class="item-chip">
            {{ item.name }} ×{{ item.quantity }}
          </span>
        </div>

        <!-- Return info -->
        <div v-if="order.returnStatus" class="return-info">
          <div class="return-top">
            <span>📦 <strong>{{ order.returnCargoCompany }}</strong> — <code>{{ order.returnCargoCode }}</code></span>
            <span v-if="order.returnItems?.length" class="return-items">Items: {{ order.returnItems.join(", ") }}</span>
            <span v-if="order.returnReason" class="return-reason">Reason: {{ order.returnReason }}</span>
          </div>

          <!-- Pending: approve / reject -->
          <div v-if="order.returnStatus === 'requested'" class="return-actions">
            <button class="btn approve-btn" :disabled="returning[order._id]" @click="approveReturn(order)">
              ✅ Approve return
            </button>
            <div class="reject-group">
              <input v-model="rejectReasons[order._id]" placeholder="Rejection reason…" class="reject-input" />
              <button class="btn reject-btn" :disabled="returning[order._id] || !rejectReasons[order._id]?.trim()" @click="rejectReturn(order)">
                ❌ Reject
              </button>
            </div>
          </div>
          <div v-else-if="order.returnStatus === 'approved'" class="status-tag approved">✅ Return approved</div>
          <div v-else-if="order.returnStatus === 'rejected'" class="status-tag rejected">❌ Rejected — {{ order.returnRejectionReason }}</div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <button
            v-if="order.status !== 'delivered'"
            class="btn advance"
            :disabled="advancing[order._id]"
            @click="advance(order)"
          >
            {{ advancing[order._id] ? "Updating…" : `→ ${nextStatus(order.status)}` }}
          </button>
          <span v-else class="delivered-tag">✅ Delivered</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import api from "../utils/api.js";

const orders = ref([]);
const loading = ref(false);
const error = ref("");
const advancing = reactive({});
const returning = reactive({});
const rejectReasons = reactive({});
const activeTab = ref("all");

const STATUS_NEXT = { processing: "in-transit", "in-transit": "delivered" };
function nextStatus(s) { return STATUS_NEXT[s] || ""; }

const tabs = [
  { label: "All", value: "all" },
  { label: "Processing", value: "processing" },
  { label: "In Transit", value: "in-transit" },
  { label: "Delivered", value: "delivered" },
  { label: "Return Requests", value: "returns" },
];

const filteredOrders = computed(() => {
  if (activeTab.value === "all") return orders.value;
  if (activeTab.value === "returns") return orders.value.filter(o => o.returnStatus === "requested");
  return orders.value.filter(o => o.status === activeTab.value);
});

function countFor(tab) {
  if (tab === "all") return orders.value.length;
  if (tab === "returns") return orders.value.filter(o => o.returnStatus === "requested").length;
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

async function approveReturn(order) {
  returning[order._id] = true;
  try {
    const { data } = await api.patch(`/orders/${order._id}/return/approve`);
    const idx = orders.value.findIndex(o => o._id === order._id);
    if (idx !== -1) orders.value[idx] = data;
  } catch (e) {
    alert(e.response?.data?.message || "Failed to approve return.");
  } finally {
    returning[order._id] = false;
  }
}

async function rejectReturn(order) {
  returning[order._id] = true;
  try {
    const { data } = await api.patch(`/orders/${order._id}/return/reject`, {
      rejectionReason: rejectReasons[order._id] || "",
    });
    const idx = orders.value.findIndex(o => o._id === order._id);
    if (idx !== -1) orders.value[idx] = data;
  } catch (e) {
    alert(e.response?.data?.message || "Failed to reject return.");
  } finally {
    returning[order._id] = false;
  }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

onMounted(loadOrders);
</script>

<style scoped>
.admin-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 20px 64px;
  color: #0f172a;
}
h1 { font-size: 1.8rem; margin: 0 0 24px; }

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
.delivered-tag { font-size: 0.85rem; color: #166534; font-weight: 600; }

.empty { text-align: center; padding: 60px; color: #94a3b8; font-size: 0.95rem; }
</style>

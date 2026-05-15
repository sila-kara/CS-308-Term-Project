<template>
  <div class="sales-page">
    <header class="page-head">
      <p class="eyebrow">Sales Manager</p>
      <h1>Refund Requests</h1>
      <p>Evaluate customer return requests. Product Manager delivery controls stay in the Product Manager panel.</p>
    </header>

    <div v-if="loading" class="state">Loading refund requests...</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else-if="refunds.length === 0" class="state">No refund requests yet.</div>

    <div v-else class="refund-list">
      <article v-for="order in refunds" :key="order._id" class="refund-card">
        <div class="refund-top">
          <div>
            <span class="invoice">{{ order.invoiceNumber }}</span>
            <span :class="['return-badge', order.returnStatus]">{{ order.returnStatus }}</span>
          </div>
          <div class="meta">
            <span>{{ order.userId?.name || "Customer" }}</span>
            <span>{{ order.userId?.email || "" }}</span>
            <span>{{ formatDate(order.returnRequestedAt || order.createdAt) }}</span>
          </div>
        </div>

        <div class="items">
          <span v-for="item in selectedItems(order)" :key="item.productId || item.name" class="item-chip">
            {{ item.name }} x{{ item.quantity }} - {{ (item.price * item.quantity).toFixed(2) }} TL
          </span>
        </div>

        <div class="return-info">
          <p v-if="order.returnItems?.length"><strong>Requested items:</strong> {{ order.returnItems.join(", ") }}</p>
          <p v-if="order.returnReason"><strong>Reason:</strong> {{ order.returnReason }}</p>
          <p><strong>Refund basis:</strong> original purchase price stored on the order.</p>
          <img v-if="order.returnPhoto" :src="order.returnPhoto" class="return-photo" alt="Return request photo" />
        </div>

        <div v-if="order.returnStatus === 'requested'" class="actions">
          <button class="btn approve" :disabled="busy[order._id]" @click="approveReturn(order)">
            Approve refund
          </button>
          <div class="reject-group">
            <input v-model="rejectReasons[order._id]" placeholder="Rejection reason" class="reject-input" />
            <button
              class="btn reject"
              :disabled="busy[order._id] || !rejectReasons[order._id]?.trim()"
              @click="rejectReturn(order)"
            >
              Reject
            </button>
          </div>
        </div>
        <p v-else-if="order.returnStatus === 'approved'" class="status-note approved">
          Refund request approved. Final refunded status will be handled in the next increment.
        </p>
        <p v-else-if="order.returnStatus === 'rejected'" class="status-note rejected">
          Rejected{{ order.returnRejectionReason ? `: ${order.returnRejectionReason}` : "" }}
        </p>
      </article>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "SalesRefundsView" });
import { onMounted, reactive, ref } from "vue";
import api from "../utils/api.js";

const refunds = ref([]);
const loading = ref(false);
const error = ref("");
const busy = reactive({});
const rejectReasons = reactive({});

function selectedItems(order) {
  if (!order.returnItems?.length) return order.items || [];
  const requested = new Set(order.returnItems);
  return (order.items || []).filter((item) => requested.has(item.name));
}

async function loadRefunds() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/orders/sales/refunds");
    refunds.value = data;
  } catch (e) {
    error.value = e.response?.data?.message || "Failed to load refund requests.";
  } finally {
    loading.value = false;
  }
}

async function approveReturn(order) {
  busy[order._id] = true;
  try {
    const { data } = await api.patch(`/orders/${order._id}/return/approve`);
    replaceOrder(data);
  } catch (e) {
    alert(e.response?.data?.message || "Failed to approve refund.");
  } finally {
    busy[order._id] = false;
  }
}

async function rejectReturn(order) {
  busy[order._id] = true;
  try {
    const { data } = await api.patch(`/orders/${order._id}/return/reject`, {
      rejectionReason: rejectReasons[order._id] || "",
    });
    replaceOrder(data);
  } catch (e) {
    alert(e.response?.data?.message || "Failed to reject refund.");
  } finally {
    busy[order._id] = false;
  }
}

function replaceOrder(updated) {
  const idx = refunds.value.findIndex((order) => order._id === updated._id);
  if (idx !== -1) refunds.value[idx] = updated;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

onMounted(loadRefunds);
</script>

<style scoped>
.sales-page {
  max-width: 1040px;
  margin: 0 auto;
  padding: 32px 20px 64px;
  color: #111827;
}
.page-head {
  margin-bottom: 24px;
}
.eyebrow {
  margin: 0 0 6px;
  color: #047857;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
h1 {
  margin: 0 0 8px;
  font-size: 1.85rem;
}
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
.refund-list {
  display: grid;
  gap: 14px;
}
.refund-card {
  display: grid;
  gap: 12px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 18px;
}
.refund-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.invoice {
  font-weight: 800;
  margin-right: 8px;
}
.return-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 800;
}
.return-badge.requested { background: #fef3c7; color: #92400e; }
.return-badge.approved { background: #d1fae5; color: #065f46; }
.return-badge.rejected { background: #fee2e2; color: #991b1b; }
.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: 0.84rem;
  flex-wrap: wrap;
}
.items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.item-chip {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.84rem;
}
.return-info {
  display: grid;
  gap: 5px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  color: #374151;
  font-size: 0.9rem;
}
.return-info p {
  margin: 0;
}
.return-photo {
  display: block;
  max-width: 220px;
  max-height: 160px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  object-fit: cover;
}
.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.btn {
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-weight: 800;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.approve {
  background: #059669;
  color: #fff;
}
.reject {
  background: #fee2e2;
  color: #991b1b;
}
.reject-group {
  display: flex;
  gap: 6px;
}
.reject-input {
  min-width: 220px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px 10px;
}
.status-note {
  margin: 0;
  padding: 9px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
}
.status-note.approved {
  background: #ecfdf5;
  color: #065f46;
}
.status-note.rejected {
  background: #fef2f2;
  color: #991b1b;
}
</style>

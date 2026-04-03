import { reactive } from "vue";
import { nextDeliveryStatus } from "../utils/orderStatus.js";

const STORAGE_ORDERS = "bookworld_orders";

const state = reactive({
  orders: [],
});

function load() {
  try {
    state.orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS) || "[]");
  } catch {
    state.orders = [];
  }
}

function save() {
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(state.orders));
}

load();

function createOrder(payload) {
  const {
    userId,
    items,
    subtotal,
    tax,
    total,
    paymentMethod,
    cardLast4,
  } = payload;
  if (!userId || !Array.isArray(items)) return null;

  let itemsSnapshot;
  try {
    itemsSnapshot =
      typeof structuredClone === "function"
        ? structuredClone(items)
        : JSON.parse(JSON.stringify(items));
  } catch {
    itemsSnapshot = JSON.parse(JSON.stringify(items));
  }

  const order = {
    id: `ORD-${Date.now()}`,
    userId,
    items: itemsSnapshot,
    subtotal,
    tax,
    total,
    paymentMethod: paymentMethod || "mock_card",
    cardLast4: cardLast4 || "****",
    status: "processing",
    createdAt: new Date().toISOString(),
    invoiceNumber: `INV-${Date.now()}`,
  };
  state.orders.unshift(order);
  save();
  return order;
}

function listByUserId(userId) {
  if (!userId) return [];
  return state.orders.filter((o) => o.userId === userId);
}

function getOrderById(orderId) {
  return state.orders.find((o) => o.id === orderId) || null;
}

function advanceDemoStatus(orderId) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return null;
  order.status = nextDeliveryStatus(order.status);
  save();
  return order.status;
}

export function useOrdersStore() {
  return {
    state,
    createOrder,
    listByUserId,
    getOrderById,
    advanceDemoStatus,
  };
}

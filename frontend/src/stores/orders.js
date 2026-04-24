import { reactive } from "vue";
import api from "../utils/api.js";
import { getToken } from "../utils/api.js";

const state = reactive({
  orders: [],
});

async function fetchOrders() {
  if (!getToken()) return;
  try {
    const { data } = await api.get("/orders");
    state.orders.splice(0, state.orders.length, ...data);
  } catch {
    state.orders = [];
  }
}

async function createOrder(payload) {
  const { items, subtotal, tax, total, paymentMethod, cardLast4, deliveryAddress } = payload;

  // Map cart items → backend format (productId = MongoDB _id)
  const backendItems = items.map((item) => ({
    productId: item.id ?? item._id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  const { data } = await api.post("/orders", {
    items: backendItems,
    subtotal,
    tax,
    total,
    paymentMethod: paymentMethod || "Mock Visa",
    cardLast4: cardLast4 || "****",
    deliveryAddress: deliveryAddress || "",
  });

  state.orders.unshift(data);
  return data;
}

async function getOrderById(orderId) {
  const cached = state.orders.find((o) => o._id === orderId || o.id === orderId);
  if (cached) return cached;
  try {
    const { data } = await api.get(`/orders/${orderId}`);
    return data;
  } catch {
    return null;
  }
}

export function useOrdersStore() {
  return {
    state,
    fetchOrders,
    createOrder,
    getOrderById,
  };
}

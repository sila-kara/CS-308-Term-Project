import { reactive } from "vue";
import axios from "axios";

const API = "http://localhost:5050/api/orders";

const state = reactive({
  orders: [],
});

async function createOrder(payload) {
  const { items, subtotal, tax, total, paymentMethod, cardLast4, deliveryAddress } = payload;
  if (!Array.isArray(items) || items.length === 0) return null;

  const body = {
    items: items.map((i) => ({
      productId: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
    subtotal,
    tax,
    total,
    paymentMethod: paymentMethod || "Mock Visa",
    cardLast4: cardLast4 || "****",
    deliveryAddress: deliveryAddress || "",
  };

  const res = await axios.post(API, body);
  const order = { ...res.data, id: res.data._id || res.data.id };
  state.orders.unshift(order);
  return order;
}

async function fetchOrders() {
  const res = await axios.get(API);
  state.orders = (res.data || []).map((o) => ({ ...o, id: o._id || o.id }));
}

async function fetchOrderById(orderId) {
  const res = await axios.get(`${API}/${orderId}`);
  return { ...res.data, id: res.data._id || res.data.id };
}

function getOrderById(orderId) {
  return state.orders.find((o) => o.id === orderId || o._id === orderId) || null;
}

export function useOrdersStore() {
  return {
    state,
    createOrder,
    fetchOrders,
    fetchOrderById,
    getOrderById,
  };
}

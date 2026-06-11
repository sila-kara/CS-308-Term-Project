import { reactive } from "vue";
import api from "../utils/api.js";

const state = reactive({
  products: [],
  loading: false,
  error: null,
});

// Map backend document → frontend shape (flattens category, adds id alias)
function normalize(p) {
  return {
    ...p,
    id: p._id,
    categoryId: p.category?._id ?? p.category ?? "",
    category: p.category?.name ?? p.category ?? "",
  };
}

async function fetchProducts() {
  if (state.loading) return;
  state.loading = true;
  state.error = null;
  try {
    const { data } = await api.get("/products");
    state.products.splice(0, state.products.length, ...data.map(normalize));
  } catch (err) {
    state.error = err.message;
  } finally {
    state.loading = false;
  }
}

async function fetchProductById(id) {
  try {
    const { data } = await api.get(`/products/${id}`);
    return normalize(data);
  } catch {
    return null;
  }
}

async function updatePricing(id, payload) {
  const { data } = await api.patch(`/products/${id}/pricing`, payload);
  const normalized = normalize(data);
  const index = state.products.findIndex((product) => product.id === normalized.id);
  if (index !== -1) {
    state.products[index] = normalized;
  }
  return normalized;
}

async function createProduct(payload) {
  const { data } = await api.post("/products", payload);
  const normalized = normalize(data);
  state.products.unshift(normalized);
  return normalized;
}

async function updateStock(id, quantity) {
  const { data } = await api.patch(`/products/${id}/stock`, { quantity });
  const normalized = normalize(data);
  const index = state.products.findIndex((product) => product.id === normalized.id);
  if (index !== -1) {
    state.products[index] = normalized;
  }
  return normalized;
}

async function updateProduct(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload);
  const normalized = normalize(data);
  const index = state.products.findIndex((product) => product.id === normalized.id);
  if (index !== -1) {
    state.products[index] = normalized;
  }
  return normalized;
}

async function deleteProduct(id) {
  await api.delete(`/products/${id}`);
  const index = state.products.findIndex((product) => product.id === id);
  if (index !== -1) {
    state.products.splice(index, 1);
  }
}

export function useProductsStore() {
  return {
    state,
    fetchProducts,
    fetchProductById,
    updatePricing,
    createProduct,
    updateStock,
    updateProduct,
    deleteProduct,
  };
}

import { reactive } from "vue";
import api from "../utils/api.js";
import { getToken } from "../utils/api.js";

// Products populated from backend (full objects with _id)
const state = reactive({
  products: [],
});

function normalize(p) {
  return { ...p, id: p._id, category: p.category?.name ?? p.category ?? "" };
}

async function loadWishlist() {
  if (!getToken()) {
    state.products = [];
    return;
  }
  try {
    const { data } = await api.get("/wishlist");
    state.products = data.map(normalize);
  } catch {
    state.products = [];
  }
}

async function addToWishlist(productId) {
  if (!getToken() || !productId) return;
  try {
    await api.post(`/wishlist/${productId}`);
    await loadWishlist();
  } catch {
    // already in wishlist or error — reload to sync
    await loadWishlist();
  }
}

async function removeFromWishlist(productId) {
  if (!getToken() || !productId) return;
  // Optimistic: remove locally first for snappy UI
  state.products = state.products.filter(
    (p) => p._id !== productId && p.id !== productId
  );
  try {
    await api.delete(`/wishlist/${productId}`);
  } catch {
    await loadWishlist();
  }
}

function isInWishlist(productId) {
  const id = String(productId);
  return state.products.some((p) => String(p._id) === id || String(p.id) === id);
}

async function toggleWishlist(productId) {
  if (isInWishlist(productId)) {
    await removeFromWishlist(productId);
  } else {
    await addToWishlist(productId);
  }
}

export function useWishlistStore() {
  return {
    state,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
  };
}

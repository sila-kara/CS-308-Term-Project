import { reactive } from "vue";

const STORAGE_WISHLIST = "bookworld_wishlist_ids";

const state = reactive({
  ids: [],
});

function readWishlistIds() {
  try {
    const raw = localStorage.getItem(STORAGE_WISHLIST);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistWishlistIds() {
  try {
    localStorage.setItem(STORAGE_WISHLIST, JSON.stringify(state.ids));
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
}

function normalizeId(id) {
  const n = Number(id);
  return Number.isFinite(n) ? n : id;
}

function normalizeIdList(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const id = normalizeId(raw);
    if (id == null) continue;
    const key = `${typeof id}:${String(id)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(id);
  }
  return out;
}

function loadWishlist() {
  if (typeof window === "undefined") return;
  const next = normalizeIdList(readWishlistIds());
  state.ids.splice(0, state.ids.length, ...next);
}

loadWishlist();

function addToWishlist(productId) {
  const id = normalizeId(productId);
  if (id == null) return;
  if (state.ids.includes(id)) return;
  state.ids.push(id);
  persistWishlistIds();
}

function removeFromWishlist(productId) {
  const id = normalizeId(productId);
  const idx = state.ids.indexOf(id);
  if (idx === -1) return;
  state.ids.splice(idx, 1);
  persistWishlistIds();
}

function isInWishlist(productId) {
  const id = normalizeId(productId);
  return state.ids.includes(id);
}

function toggleWishlist(productId) {
  const id = normalizeId(productId);
  if (isInWishlist(id)) {
    removeFromWishlist(id);
  } else {
    addToWishlist(id);
  }
}

export function useWishlistStore() {
  return {
    state,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
  };
}


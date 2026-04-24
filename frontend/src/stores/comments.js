import { reactive } from "vue";

const STORAGE = "bookworld_reviews";

const state = reactive({
  reviews: [],
});

function load() {
  try {
    state.reviews = JSON.parse(localStorage.getItem(STORAGE) || "[]");
  } catch {
    state.reviews = [];
  }
}

function save() {
  localStorage.setItem(STORAGE, JSON.stringify(state.reviews));
}

load();

function listApprovedForProduct(productId) {
  const id = Number(productId);
  return state.reviews.filter(
    (r) => r.productId === id && r.status === "approved",
  );
}

function listPending() {
  return state.reviews.filter((r) => r.status === "pending");
}

function submitReview({ productId, authorName, rating, text }) {
  const review = {
    id: crypto.randomUUID(),
    productId: Number(productId),
    authorName: String(authorName || "Reader").trim(),
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    text: String(text || "").trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  state.reviews.push(review);
  save();
  return { ok: true, review };
}

function approveReview(reviewId) {
  const r = state.reviews.find((x) => x.id === reviewId);
  if (!r) return false;
  r.status = "approved";
  save();
  return true;
}

function rejectReview(reviewId) {
  const idx = state.reviews.findIndex((x) => x.id === reviewId);
  if (idx === -1) return false;
  state.reviews.splice(idx, 1);
  save();
  return true;
}

export function useCommentsStore() {
  return {
    state,
    listApprovedForProduct,
    listPending,
    submitReview,
    approveReview,
    rejectReview,
  };
}

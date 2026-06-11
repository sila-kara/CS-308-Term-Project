import { reactive } from "vue";
import api from "../utils/api.js";

const state = reactive({
  reviews: [],
  pending: [],
});

async function fetchApprovedForProduct(productId) {
  try {
    const { data } = await api.get(`/comments/${productId}`);
    state.reviews = data;
  } catch {
    state.reviews = [];
  }
}

async function fetchMyReviewForProduct(productId) {
  try {
    const { data } = await api.get(`/comments/mine/${productId}`);
    return data;
  } catch {
    return null;
  }
}

async function checkReviewEligibility(productId) {
  try {
    const { data } = await api.get(`/comments/eligibility/${productId}`);
    return data.eligible === true;
  } catch {
    return false;
  }
}

function listApprovedForProduct(productId) {
  return state.reviews.filter(r => String(r.productId) === String(productId));
}

async function fetchPending() {
  try {
    const { data } = await api.get("/comments/pending");
    state.pending = data;
  } catch {
    state.pending = [];
  }
}

function listPending() {
  return state.pending;
}

async function submitReview({ productId, rating, text }) {
  try {
    await api.post("/comments", {
      productId,
      rating,
      commentText: text || "",
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.response?.data?.message || "Failed to submit review." };
  }
}

async function approveReview(commentId) {
  try {
    await api.patch(`/comments/approve/${commentId}`);
    state.pending = state.pending.filter(r => r._id !== commentId);
    return true;
  } catch {
    return false;
  }
}

async function rejectReview(commentId) {
  try {
    await api.patch(`/comments/reject/${commentId}`);
    state.pending = state.pending.filter(r => r._id !== commentId);
    return true;
  } catch {
    return false;
  }
}

export function useCommentsStore() {
  return {
    state,
    fetchApprovedForProduct,
    fetchMyReviewForProduct,
    checkReviewEligibility,
    listApprovedForProduct,
    fetchPending,
    listPending,
    submitReview,
    approveReview,
    rejectReview,
  };
}

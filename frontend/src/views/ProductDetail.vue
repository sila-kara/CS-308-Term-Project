<template>
  <div class="detail-page" v-if="product">
    <button class="back-btn" @click="router.push('/')">Back to catalog</button>

    <div class="detail-container">
      <img :src="product.image" :alt="product.name" class="detail-image" />

      <div class="detail-info">
        <span class="category-badge">{{ product.category }}</span>
        <h1>{{ product.name }}</h1>
        <p class="model">{{ product.model }}</p>
        <p class="serial">Serial: {{ product.serialNumber }}</p>

        <div class="rating-section">
          <span class="stars">★ {{ averageRating ? averageRating.toFixed(1) : "0.0" }}</span>
          <span class="count">({{ totalComments }} reviews)</span>
        </div>

        <p class="description">{{ product.description }}</p>

        <div class="info-table">
          <div class="info-row">
            <span class="label">Author:</span>
            <span>{{ product.distributor }}</span>
          </div>

          <div class="info-row">
            <span class="label">Warranty:</span>
            <span>{{ product.warranty }}</span>
          </div>

          <div class="info-row">
            <span class="label">Stock:</span>
            <span :class="{ 'out-of-stock': product.quantity === 0 }">
              {{
                product.quantity > 0
                  ? `${product.quantity} available`
                  : "Out of stock"
              }}
            </span>
          </div>
        </div>

        <div class="price-section">
          <span class="price">{{ product.price.toFixed(2) }} TL</span>

          <button
            v-if="product.quantity > 0"
            type="button"
            class="add-to-cart-btn"
            aria-label="Add to cart"
            @click="addCurrentProductToCart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
              <path
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 6h15l-1.5 9h-12zM6 6L5 3H2M9 20a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z"
              />
            </svg>
          </button>
          <div v-else class="detail-unavailable" role="status">
            <span class="detail-unavailable-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none" />
                <path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M8.5 8.5l7 7m0-7l-7 7" />
              </svg>
            </span>
            <span>Currently unavailable</span>
          </div>
        </div>

        <p v-if="cartMessage" class="cart-toast">{{ cartMessage }}</p>
      </div>
    </div>

    <section class="reviews" v-if="product">
      <div class="reviews-head">
        <h2>Customer reviews</h2>
        <p>Only approved reviews are shown publicly.</p>
      </div>

      <p v-if="loadingComments" class="no-reviews">Loading reviews...</p>
      <ul v-else-if="approvedReviews.length" class="review-list">
        <li v-for="r in approvedReviews" :key="r.id">
          <div class="review-top">
            <strong>{{ r.authorName }}</strong>
            <span class="stars-mini">{{ "★".repeat(r.rating) }}</span>
          </div>
          <p>{{ r.text }}</p>
        </li>
      </ul>
      <p v-else class="no-reviews">No approved reviews yet. Be the first.</p>

      <div v-if="isLoggedIn" class="review-form">
        <h3>Write a review</h3>
        <label>
          Rating
          <select v-model.number="draftRating">
            <option v-for="n in 5" :key="n" :value="n">{{ n }} stars</option>
          </select>
        </label>
        <label>
          Comment
          <textarea v-model="draftText" rows="3" placeholder="Share your thoughts" />
        </label>
        <p v-if="reviewError" class="review-error">{{ reviewError }}</p>
        <p v-if="reviewSuccess" class="review-success">{{ reviewSuccess }}</p>
        <button type="button" class="submit-review" @click="submitReview">
          Submit for approval
        </button>
      </div>
      <p v-else class="login-hint">
        <router-link to="/login">Sign in</router-link>
        to submit a rating and comment.
      </p>
    </section>
  </div>

  <div v-else class="not-found">
    <h2>Book not found</h2>
    <button class="home-btn" @click="router.push('/')">Go to Home Page</button>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const router = useRouter();
const { addToCart } = useCartStore();
const { isLoggedIn, state: authState } = useAuthStore();

const product = ref(null);
const approvedReviews = ref([]);
const averageRating = ref(0);
const totalComments = ref(0);

const draftRating = ref(5);
const draftText = ref("");
const reviewError = ref("");
const reviewSuccess = ref("");
const cartMessage = ref("");

const loadingProduct = ref(false);
const loadingComments = ref(false);
const pageError = ref("");

const productId = computed(() => route.params.id);

async function fetchProduct() {
  loadingProduct.value = true;
  pageError.value = "";

  try {
    const res = await axios.get("http://localhost:5050/api/products");
    const found = (res.data || []).find(
      (p) => String(p._id || p.id) === String(productId.value),
    );

    if (!found) {
      product.value = null;
      return;
    }

    product.value = {
      ...found,
      id: found._id || found.id,
      image: found.image || "https://via.placeholder.com/300x420?text=Book",
      category: found.category || "Uncategorized",
      model: found.model || "",
      serialNumber: found.serialNumber || "",
      description: found.description || "",
      distributor: found.distributor || "Unknown",
      warranty: found.warrantyStatus || found.warranty || "N/A",
      quantity: found.quantity ?? 0,
      price: Number(found.price ?? 0),
      rating: Number(found.rating ?? 0),
      ratingCount: Number(found.ratingCount ?? 0),
    };
  } catch (err) {
    console.error(err);
    pageError.value = "Product could not be loaded.";
  } finally {
    loadingProduct.value = false;
  }
}

async function fetchApprovedReviews() {
  if (!productId.value) return;

  loadingComments.value = true;

  try {
    const res = await axios.get(
      `http://localhost:5050/api/comments/${productId.value}`,
    );

    approvedReviews.value = (res.data || []).map((comment) => ({
      id: comment._id,
      authorName: comment.maskedUserName || "Anonymous",
      rating: Number(comment.rating ?? 0),
      text: comment.commentText || "",
      createdAt: comment.createdAt,
    }));
  } catch (err) {
    console.error(err);
    approvedReviews.value = [];
  } finally {
    loadingComments.value = false;
  }
}

async function fetchAverageRating() {
  if (!productId.value) return;

  try {
    const res = await axios.get(
      `http://localhost:5050/api/comments/average/${productId.value}`,
    );

    averageRating.value = Number(res.data?.averageRating ?? 0);
    totalComments.value = Number(res.data?.totalComments ?? 0);

    if (product.value) {
      product.value.rating = averageRating.value;
      product.value.ratingCount = totalComments.value;
    }
  } catch (err) {
    console.error(err);
    averageRating.value = 0;
    totalComments.value = 0;
  }
}

async function loadPageData() {
  await fetchProduct();
  await fetchApprovedReviews();
  await fetchAverageRating();
}

watch(
  () => productId.value,
  async () => {
    reviewError.value = "";
    reviewSuccess.value = "";
    draftText.value = "";
    draftRating.value = 5;
    await loadPageData();
  },
  { immediate: true },
);

onMounted(async () => {
  await loadPageData();
});

function addCurrentProductToCart() {
  if (!product.value) return;
  addToCart(product.value);
  cartMessage.value = "Added to cart.";
  window.setTimeout(() => {
    cartMessage.value = "";
  }, 2400);
}

async function submitReview() {
  reviewError.value = "";
  reviewSuccess.value = "";

  if (!product.value) return;

  if (!isLoggedIn) {
    reviewError.value = "You need to sign in first.";
    return;
  }

  if (!draftRating.value || draftRating.value < 1 || draftRating.value > 5) {
    reviewError.value = "Rating must be between 1 and 5.";
    return;
  }

  try {
    await axios.post("http://localhost:5050/api/comments", {
      userId: authState.user?._id || authState.user?.id,
      productId: product.value.id,
      rating: draftRating.value,
      commentText: draftText.value,
    });

    reviewSuccess.value =
      "Thanks! Your review was submitted and is waiting for approval.";
    draftText.value = "";
    draftRating.value = 5;
    await fetchApprovedReviews();
    await fetchAverageRating();
  } catch (err) {
    console.error(err);
    reviewError.value =
      err.response?.data?.message || "Review could not be submitted.";
  }
}
</script>

<style scoped>
.detail-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 22px;
}

.back-btn {
  background: #ffffff;
  border: 1px solid #d1dbe8;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.92rem;
  font-weight: 600;
  margin-bottom: 20px;
  transition: 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.back-btn:hover {
  background: #f8fbff;
  border-color: #afc4dd;
}

.detail-container {
  display: flex;
  gap: 32px;
  background: var(--card-bg);
  border-radius: 8px;
  padding: 26px;
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow-md);
}

.detail-image {
  width: 330px;
  height: 450px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #d8e0ec;
}

.detail-info {
  flex: 1;
}

.category-badge {
  display: inline-block;
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.detail-info h1 {
  margin: 8px 0;
  font-size: 2rem;
  color: #1a1a2e;
}

.model {
  color: #666;
  margin: 0 0 4px 0;
}

.serial {
  color: #999;
  font-size: 0.85rem;
  margin: 0 0 12px 0;
}

.rating-section {
  margin: 12px 0;
  font-size: 0.98rem;
  display: flex;
  align-items: center;
  gap: 7px;
}

.stars {
  color: #f59e0b;
  font-weight: bold;
}

.count {
  color: #999;
  margin-left: 6px;
}

.description {
  color: #334155;
  line-height: 1.6;
  margin: 16px 0;
}

.info-table {
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
  margin: 16px 0;
  display: grid;
  gap: 4px;
}

.info-row {
  display: flex;
  padding: 6px 0;
}

.label {
  font-weight: bold;
  color: #555;
  width: 120px;
}

.out-of-stock {
  color: #e74c3c;
  font-weight: bold;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.price {
  font-size: 2.1rem;
  font-weight: bold;
  color: #16a34a;
}

.add-to-cart-btn {
  width: 52px;
  height: 52px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #1e40af, #2563eb);
  color: white;
  border: 1px solid #1e40af;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.add-to-cart-btn:hover {
  background: linear-gradient(145deg, #1e3a8a, #1d4ed8);
}

.add-to-cart-btn:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.35);
  outline-offset: 2px;
}

.detail-unavailable {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
  color: #94a3b8;
  font-size: 0.92rem;
  font-weight: 600;
}

.detail-unavailable-icon {
  color: #cbd5e1;
  display: grid;
  place-items: center;
}

.cart-toast {
  margin: 12px 0 0;
  font-size: 0.88rem;
  color: #047857;
  font-weight: 600;
}

.reviews {
  max-width: 1180px;
  margin: 20px auto 0;
  padding: 0 22px 40px;
}

.reviews-head h2 {
  margin: 0 0 4px;
  font-size: 1.25rem;
}

.reviews-head p {
  margin: 0 0 14px;
  color: #64748b;
  font-size: 0.88rem;
}

.review-list {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  display: grid;
  gap: 10px;
}

.review-list li {
  background: #fff;
  border: 1px solid #dbe5f1;
  border-radius: 8px;
  padding: 12px;
}

.review-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.stars-mini {
  color: #f59e0b;
  letter-spacing: 1px;
}

.no-reviews {
  color: #64748b;
  margin: 0 0 14px;
}

.review-form {
  background: #f8fbff;
  border: 1px solid #dbe5f1;
  border-radius: 8px;
  padding: 14px;
  display: grid;
  gap: 10px;
  max-width: 520px;
}

.review-form h3 {
  margin: 0;
  font-size: 1rem;
}

.review-form label {
  display: grid;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
}

.review-form select,
.review-form textarea {
  border-radius: 8px;
  border: 1px solid #cfdbea;
  padding: 8px 10px;
  font: inherit;
}

.review-error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.85rem;
}

.review-success {
  margin: 0;
  color: #047857;
  font-size: 0.85rem;
}

.submit-review {
  justify-self: start;
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  background: #2563eb;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.login-hint {
  font-size: 0.9rem;
  color: #475569;
}

.login-hint a {
  color: #2563eb;
  font-weight: 700;
}

.not-found {
  text-align: center;
  padding: 60px 20px;
}

.home-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background: #131921;
  color: white;
  cursor: pointer;
}

@media (max-width: 900px) {
  .detail-container {
    flex-direction: column;
    align-items: center;
  }

  .detail-image {
    width: 100%;
    max-width: 300px;
    height: auto;
  }

  .price-section {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

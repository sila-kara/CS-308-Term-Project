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
          <span class="stars">★ {{ product.rating }}</span>
          <span class="count">({{ product.ratingCount }} reviews)</span>
        </div>

        <p class="description">{{ product.description }}</p>

        <div class="info-table">
          <div class="info-row">
            <span class="label">Author:</span>
            <span>{{ product.author }}</span>
          </div>

          <div class="info-row">
            <span class="label">Distributor:</span>
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
          <div class="detail-price-block">
            <span class="price">{{ displayPrice.toFixed(2) }} TL</span>
            <span v-if="hasDiscount" class="list-price">{{ product.price.toFixed(2) }} TL</span>
            <span v-if="hasDiscount" class="discount-rate">%{{ Math.round(product.discountRate) }} off</span>
          </div>

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

          <button
            type="button"
            class="wishlist-detail-btn"
            :class="{ active: isWishlisted }"
            :aria-label="isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'"
            @click="toggleWishlist(product._id || product.id)"
          >
            <svg v-if="isWishlisted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
              <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>
        </div>

        <p v-if="cartMessage" class="cart-toast">{{ cartMessage }}</p>
      </div>
    </div>

    <section class="reviews" v-if="product">
      <div class="reviews-head">
        <h2>Customer reviews</h2>
        <p>Ratings are shown immediately. Review text appears after approval.</p>
      </div>

      <ul v-if="approvedReviews.length" class="review-list">
        <li v-for="r in approvedReviews" :key="r._id">
          <div class="review-top">
            <strong>{{ r.maskedUserName }}</strong>
            <span class="stars-mini">{{ "★".repeat(r.rating) }}</span>
          </div>

          <p v-if="r.commentStatus === 'approved' && r.commentText">
            {{ r.commentText }}
          </p>
        </li>
      </ul>
      <p v-else class="no-reviews">No reviews yet. Be the first.</p>

      <div v-if="isLoggedIn && canReview" class="review-form">
        <h3>{{ myReview ? "Edit your review" : "Write a review" }}</h3>
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
          {{ myReview ? "Update review" : "Submit review" }}
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
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductsStore } from "../stores/products.js";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";
import { useCommentsStore } from "../stores/comments";
import { useWishlistStore } from "../stores/wishlist";
import { effectivePrice, isOnSale } from "../utils/productUtils";

const route = useRoute();
const router = useRouter();
const { addToCart } = useCartStore();
const { isLoggedIn } = useAuthStore();
const {
  fetchApprovedForProduct,
  fetchMyReviewForProduct,
  checkReviewEligibility,
  listApprovedForProduct,
  submitReview: postReview
} =
  useCommentsStore();
const { fetchProductById } = useProductsStore();
const { isInWishlist, toggleWishlist } = useWishlistStore();
const isWishlisted = computed(() => product.value ? isInWishlist(product.value._id || product.value.id) : false);

const product = ref(null);
const myReview = ref(null);
const canReview = ref(false);
const hasDiscount = computed(() => isOnSale(product.value));
const displayPrice = computed(() => effectivePrice(product.value));

const approvedReviews = computed(() =>
  product.value ? listApprovedForProduct(product.value._id || product.value.id) : [],
);

const draftRating = ref(5);
const draftText = ref("");
const reviewError = ref("");
const reviewSuccess = ref("");
const cartMessage = ref("");

async function loadMyReview(productId) {
  myReview.value = null;
  draftText.value = "";
  draftRating.value = 5;

  if (!isLoggedIn.value) return;

  const my = await fetchMyReviewForProduct(productId);
  if (my) {
    myReview.value = my;
    draftRating.value = my.rating;
    draftText.value = my.commentText || "";
  }
}

async function loadReviewEligibility(productId) {
  canReview.value = false;
  if (!isLoggedIn.value) return;
  canReview.value = await checkReviewEligibility(productId);
}

async function loadProductDetail(id) {
  product.value = await fetchProductById(id);
  if (!product.value) return;

  const productId = product.value._id || product.value.id;
  await fetchApprovedForProduct(productId);
  await Promise.all([loadMyReview(productId), loadReviewEligibility(productId)]);
}

onMounted(async () => {
  await loadProductDetail(route.params.id);
});

watch(
  () => route.params.id,
  async (id) => {
    reviewError.value = "";
    reviewSuccess.value = "";
    await loadProductDetail(id);
  },
);

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
  const res = await postReview({
    productId: product.value._id || product.value.id,
    rating: draftRating.value,
    text: draftText.value,
  });
  if (!res.ok) {
    reviewError.value = res.error;
    return;
  }
  const hasText = draftText.value.trim().length > 0;
  reviewSuccess.value = hasText
    ? "Thanks! Your review will appear after a product manager approves it."
    : "Thanks! Your rating has been submitted.";

  // Refetch product to get updated rating/ratingCount
  const updated = await fetchProductById(product.value._id || product.value.id);
  if (updated) product.value = updated;
  await fetchApprovedForProduct(product.value._id || product.value.id);
  await loadMyReview(product.value._id || product.value.id);
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

.detail-price-block {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.price {
  font-size: 2.1rem;
  font-weight: bold;
  color: #16a34a;
}

.list-price {
  color: #64748b;
  text-decoration: line-through;
  font-weight: 700;
}

.discount-rate {
  background: #dcfce7;
  color: #166534;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 0.78rem;
  font-weight: 800;
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

.wishlist-detail-btn {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.18s ease;
  flex-shrink: 0;
}
.wishlist-detail-btn:hover {
  border-color: #fda4af;
  background: #fff1f2;
  color: #e11d48;
}
.wishlist-detail-btn.active {
  border-color: #fda4af;
  background: #fff1f2;
  color: #e11d48;
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

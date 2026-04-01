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
            class="add-to-cart-btn"
            :disabled="product.quantity === 0"
            @click="addCurrentProductToCart"
          >
            {{ product.quantity > 0 ? "Add to Cart" : "Out of Stock" }}
          </button>
        </div>

        <p v-if="cartMessage" class="cart-toast">{{ cartMessage }}</p>
      </div>
    </div>

    <section class="reviews" v-if="product">
      <div class="reviews-head">
        <h2>Customer reviews</h2>
        <p>Only approved reviews are shown publicly.</p>
      </div>

      <ul v-if="approvedReviews.length" class="review-list">
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
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { products } from "../data/products.js";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";
import { useCommentsStore } from "../stores/comments";

const route = useRoute();
const router = useRouter();
const { addToCart } = useCartStore();
const { isLoggedIn, state: authState } = useAuthStore();
const { listApprovedForProduct, submitReview: postReview } =
  useCommentsStore();

const product = computed(() => {
  const id = Number(route.params.id);
  return products.find((p) => p.id === id);
});

const approvedReviews = computed(() =>
  product.value ? listApprovedForProduct(product.value.id) : [],
);

const draftRating = ref(5);
const draftText = ref("");
const reviewError = ref("");
const reviewSuccess = ref("");
const cartMessage = ref("");

watch(
  () => product.value?.id,
  () => {
    reviewError.value = "";
    reviewSuccess.value = "";
    draftText.value = "";
    draftRating.value = 5;
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

function submitReview() {
  reviewError.value = "";
  reviewSuccess.value = "";
  if (!product.value) return;
  const res = postReview({
    productId: product.value.id,
    authorName: authState.user?.name || "Reader",
    rating: draftRating.value,
    text: draftText.value,
  });
  if (!res.ok) {
    reviewError.value = res.error;
    return;
  }
  reviewSuccess.value =
    "Thanks! Your review will appear after a product manager approves it.";
  draftText.value = "";
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
  border-radius: 12px;
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
  border-radius: 22px;
  padding: 26px;
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow-md);
}

.detail-image {
  width: 330px;
  height: 450px;
  object-fit: cover;
  border-radius: 16px;
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
  border-radius: 999px;
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
  padding: 14px 28px;
  background: linear-gradient(145deg, #1e40af, #2563eb);
  color: white;
  border: 1px solid #1e40af;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.add-to-cart-btn:hover {
  background: linear-gradient(145deg, #1e3a8a, #1d4ed8);
}

.add-to-cart-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
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
  border-radius: 14px;
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
  border-radius: 14px;
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
  border-radius: 10px;
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
  border-radius: 10px;
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

<template>
  <div class="wishlist-page">
    <h1>Wishlist</h1>
    <p class="lead">Books you've saved for later.</p>

    <section class="email-preferences" aria-label="Wishlist email preferences">
      <div>
        <h2>Email alerts</h2>
        <p>Choose which wishlist updates should be sent to your email.</p>
      </div>
      <label class="preference-toggle">
        <input
          type="checkbox"
          :checked="notificationsState.preferences.wishlistDiscounts"
          @change="togglePreference('wishlistDiscounts', $event.target.checked)"
        />
        <span>
          Discount alerts
          <small>Email me when a wishlist item goes on sale or gets a deeper discount.</small>
        </span>
      </label>
      <label class="preference-toggle">
        <input
          type="checkbox"
          :checked="notificationsState.preferences.wishlistRestock"
          @change="togglePreference('wishlistRestock', $event.target.checked)"
        />
        <span>
          Back-in-stock alerts
          <small>Email me when an out-of-stock wishlist item becomes available.</small>
        </span>
      </label>
      <p v-if="preferenceMessage" class="preference-message">{{ preferenceMessage }}</p>
    </section>

    <section class="wishlist-section" aria-label="Wishlisted products">
      <div class="product-grid" v-if="state.products.length > 0">
        <ProductCard
          v-for="product in state.products"
          :key="product.id"
          :product="product"
        />
      </div>

      <div v-else class="empty-state" role="status">
        <p class="empty-title">Your wishlist is empty.</p>
        <p class="empty-sub">Tap the heart on any product to save it here.</p>
      </div>
    </section>

    <router-link class="back-link" to="/">Continue shopping</router-link>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import ProductCard from "../components/ProductCard.vue";
import { useNotificationsStore } from "../stores/notifications";
import { useWishlistStore } from "../stores/wishlist";

const { state, loadWishlist } = useWishlistStore();
const {
  state: notificationsState,
  loadEmailPreferences,
  updateEmailPreferences,
} = useNotificationsStore();
const preferenceMessage = ref("");

async function togglePreference(key, value) {
  preferenceMessage.value = "";
  try {
    await updateEmailPreferences({ [key]: value });
    preferenceMessage.value = "Email preferences saved.";
  } catch {
    preferenceMessage.value = "Could not save email preferences.";
  }
}

onMounted(() => {
  loadWishlist();
  loadEmailPreferences();
});
</script>

<style scoped>
.wishlist-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 40px 24px 56px;
  color: #0f172a;
}

h1 {
  margin: 0 0 10px;
  font-size: 1.5rem;
}

.lead {
  margin: 0 0 20px;
  color: #64748b;
  line-height: 1.5;
}

.wishlist-section {
  margin: 18px 0 18px;
}

.email-preferences {
  display: grid;
  gap: 12px;
  margin: 20px 0;
  padding: 16px;
  border: 1px solid #dbe5f1;
  border-radius: 10px;
  background: #ffffff;
}

.email-preferences h2 {
  margin: 0 0 4px;
  font-size: 1rem;
}

.email-preferences p {
  margin: 0;
  color: #64748b;
  line-height: 1.45;
}

.preference-toggle {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  cursor: pointer;
}

.preference-toggle input {
  margin-top: 3px;
  accent-color: #2563eb;
}

.preference-toggle span {
  display: grid;
  gap: 2px;
  color: #0f172a;
  font-weight: 800;
}

.preference-toggle small {
  color: #64748b;
  font-weight: 500;
  line-height: 1.35;
}

.preference-message {
  color: #047857;
  font-weight: 700;
  font-size: 0.86rem;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 18px;
}

.empty-state {
  border: 1px dashed rgba(148, 163, 184, 0.55);
  border-radius: 10px;
  background: rgba(248, 251, 255, 0.6);
  padding: 18px 16px;
}

.empty-title {
  margin: 0 0 4px;
  font-weight: 800;
  color: #0f172a;
}

.empty-sub {
  margin: 0;
  color: #64748b;
  line-height: 1.5;
}

.back-link {
  display: inline-block;
  font-weight: 700;
  color: #2563eb;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
</style>

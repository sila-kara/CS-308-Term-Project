<template>
  <div class="app">
    <AdminNav v-if="isAdminRoute" />
    <SalesManagerNav v-else-if="isSalesRoute" />
    <template v-else>
      <Navbar />
    </template>
    <main class="main-content">
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="['AdminOrdersView', 'AdminProductsView', 'AdminReviewsView', 'SalesDashboardView', 'SalesPricingView', 'SalesRefundsView']">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </router-view>
    </main>
    <Footer v-if="!isAdminRoute && !isSalesRoute" />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import Navbar from "./components/Navbar.vue";
import AdminNav from "./components/AdminNav.vue";
import SalesManagerNav from "./components/SalesManagerNav.vue";
import Footer from "./components/Footer.vue";
import { useWishlistStore } from "./stores/wishlist";
import { useAuthStore } from "./stores/auth";
import { useProductsStore } from "./stores/products";
import { useNotificationsStore } from "./stores/notifications";

const route = useRoute();
const isAdminRoute = computed(() => route.path.startsWith("/admin"));
const isSalesRoute = computed(() => route.path.startsWith("/sales"));

const { loadWishlist } = useWishlistStore();
const { loadEmailPreferences, loadNotifications } = useNotificationsStore();
const { state: authState } = useAuthStore();
const { fetchProducts } = useProductsStore();

// Fetch products once at app startup so categories are always available
onMounted(() => {
  fetchProducts();
});

watch(() => authState.user, (user) => {
  if (user) {
    loadWishlist();
    loadNotifications();
    loadEmailPreferences();
  } else {
    loadWishlist();
    loadNotifications();
    loadEmailPreferences();
  }
}, { immediate: true });
</script>

<style>
* {
  box-sizing: border-box;
}

html,
body,
#app {
  margin: 0;
  padding: 0;
  min-height: 100%;
}

body {
  overflow-x: hidden;
  font-family:
    Inter,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif;
  background:
    radial-gradient(circle at top, #f8fbff 0%, #eef3f9 34%, #f5f7fb 100%);
  color: #0f172a;
}

a {
  color: inherit;
}

button,
input,
select {
  font: inherit;
}

.main-content {
  min-height: calc(100vh - 240px);
  padding-bottom: 28px;
}

:root {
  --card-bg: #ffffff;
  --card-border: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --brand: #2563eb;
  --brand-dark: #1d4ed8;
  --success: #059669;
  --warning: #d97706;
  --danger: #dc2626;
  --shadow-sm: 0 8px 20px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 14px 36px rgba(15, 23, 42, 0.1);
}
</style>

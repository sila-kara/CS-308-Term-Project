<template>
  <nav class="navbar">
    <div class="utility-strip">
      <div class="navbar-container utility-inner">
        <p>Free shipping on orders over 250 TL</p>
        <p>Support 24/7</p>
      </div>
    </div>

    <div class="main-nav">
      <div class="navbar-container">
        <router-link to="/" class="logo">
          <span class="logo-icon">BW</span>
          <span class="logo-text">BookWorld</span>
        </router-link>

        <div class="search-shell">
          <select v-model="searchCategory" class="search-category">
            <option value="all">All categories</option>
            <option
              v-for="category in categoriesWithoutAll"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search titles, authors, ISBN"
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">Search</button>
        </div>

        <div class="nav-actions">
          <button
            v-if="!isLoggedIn"
            type="button"
            class="nav-action"
            @click="router.push('/login')"
          >
            Sign in
          </button>
          <template v-else>
            <button
              type="button"
              class="nav-action"
              @click="router.push('/orders')"
            >
              Orders
            </button>
            <button type="button" class="nav-action" @click="logout">Sign out</button>
          </template>
          <button
            type="button"
            class="nav-action cart"
            @click="router.push('/cart')"
          >
            Cart
            <span class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="category-nav">
      <div class="navbar-container nav-categories">
        <button
          class="cat-link"
          :class="{ active: isActiveCategory('All') }"
          @click="goToCategory('All')"
        >
          All books
        </button>
        <button
          v-for="category in categoriesWithoutAll"
          :key="category"
          class="cat-link"
          :class="{ active: isActiveCategory(category) }"
          @click="goToCategory(category)"
        >
          {{ category }}
        </button>
        <button class="cat-link deal" @click="goToDeals">Top deals</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { categories } from "../data/products.js";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const route = useRoute();
const { cartCount } = useCartStore();
const { isLoggedIn, logout } = useAuthStore();

const searchQuery = ref(route.query.search || "");
const searchCategory = ref(route.query.category || "all");

const categoriesWithoutAll = categories.filter((c) => c !== "All");

watch(
  () => route.query,
  (query) => {
    searchQuery.value = query.search || "";
    searchCategory.value = query.category || "all";
  },
  { immediate: true },
);

function handleSearch() {
  router.push({
    path: "/",
    query: {
      ...(searchQuery.value.trim() ? { search: searchQuery.value.trim() } : {}),
      ...(searchCategory.value !== "all"
        ? { category: searchCategory.value }
        : {}),
    },
  });
}

function goToCategory(category) {
  router.push({
    path: "/",
    query: category === "All" ? {} : { category },
  });
}

function goToDeals() {
  router.push({
    path: "/",
    query: { sort: "price-desc" },
  });
}

function isActiveCategory(category) {
  const currentCategory = route.query.category || "All";
  return currentCategory === category;
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 150;
}

.utility-strip {
  background: #0f172a;
  color: #cbd5e1;
  font-size: 0.74rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.utility-inner {
  justify-content: space-between;
  padding-top: 7px;
  padding-bottom: 7px;
}

.utility-inner p {
  margin: 0;
}

.main-nav {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #dbe5f1;
  backdrop-filter: blur(10px);
  padding: 12px 24px;
}

.navbar-container {
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  color: #0f172a;
  flex-shrink: 0;
  padding: 7px 10px;
  border: 1px solid #dbe5f1;
  border-radius: 999px;
  background: #ffffff;
  transition: 0.2s ease;
}

.logo:hover {
  border-color: #bfdbfe;
  background: #f8fbff;
}

.logo-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(145deg, #1d4ed8, #2563eb);
  color: #eff6ff;
  display: grid;
  place-items: center;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.logo-text {
  font-size: 1rem;
  font-weight: 750;
}

.search-shell {
  flex: 1;
  display: flex;
  min-width: 250px;
  height: 46px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #d6e1ee;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  background: #ffffff;
}

.search-category {
  background: #f1f5f9;
  border: none;
  padding: 0 12px;
  font-size: 0.8rem;
  color: #334155;
  cursor: pointer;
  outline: none;
}

.search-input {
  flex: 1;
  border: none;
  padding: 0 14px;
  font-size: 0.95rem;
  outline: none;
}

.search-btn {
  background: linear-gradient(145deg, #1d4ed8, #2563eb);
  border: 0;
  padding: 0 18px;
  cursor: pointer;
  color: white;
  font-size: 0.84rem;
  font-weight: 700;
  transition: background 0.2s;
}

.search-btn:hover {
  background: linear-gradient(145deg, #1e40af, #1d4ed8);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.nav-action {
  color: #1e293b;
  cursor: pointer;
  padding: 10px 12px;
  border: 1px solid #dbe5f1;
  border-radius: 11px;
  background: #ffffff;
  font-size: 0.82rem;
  font-weight: 650;
  transition: 0.2s ease;
}

.nav-action:hover {
  border-color: #bfdbfe;
  background: #f8fbff;
}

.cart-badge {
  margin-left: 6px;
  background: #f97316;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  min-width: 19px;
  height: 19px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.category-nav {
  background: #ffffff;
  padding: 10px 24px 12px;
  border-bottom: 1px solid #dbe5f1;
}

.nav-categories {
  display: flex;
  gap: 10px;
  overflow-x: auto;
}

.cat-link {
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #dbe5f1;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 7px 12px;
  border-radius: 999px;
  white-space: nowrap;
  transition: 0.2s ease;
  cursor: pointer;
}

.cat-link:hover {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.cat-link.active {
  color: #eff6ff;
  border-color: #1d4ed8;
  background: #2563eb;
}

.cat-link.deal {
  color: #854d0e;
  background: #fef3c7;
  border-color: #fcd34d;
}

@media (max-width: 980px) {
  .main-nav {
    padding: 10px 16px;
  }

  .category-nav {
    padding: 8px 16px 10px;
  }

  .navbar-container {
    flex-wrap: wrap;
  }

  .search-shell {
    order: 4;
    width: 100%;
  }

  .nav-actions {
    margin-left: auto;
  }

  .utility-inner {
    display: none;
  }
}
</style>

<template>
  <nav class="navbar">
    <div class="utility-strip">
      <div class="navbar-container utility-inner">
        <p>Free shipping on orders over 250 TL</p>
        <p>Support 24/7</p>
      </div>
    </div>

    <div class="main-nav">
      <div class="navbar-container main-row">
        <router-link to="/" class="logo">
          <span class="logo-icon">BW</span>
          <span class="logo-text">BookWorld</span>
        </router-link>

        <div class="search-wrap">
          <div class="search-shell">
            <input
              v-model="searchQuery"
              type="search"
              autocomplete="off"
              placeholder="Search for product, category, or brand."
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <button type="button" class="search-btn-round" aria-label="Search" @click="handleSearch">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                <path
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M11 19a8 8 0 100-16 8 8 0 000 16zm9 2l-4.35-4.35"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="nav-actions">
          <template v-if="!isLoggedIn">
            <router-link class="nav-icon-link" to="/login">
              <span class="nav-icon-wrap" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <path
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
                  />
                </svg>
              </span>
              <span class="nav-label">Login / Register</span>
            </router-link>
          </template>
          <template v-else>
            <div class="account-menu" @mouseenter="accountOpen = true" @mouseleave="accountOpen = false">
              <button type="button" class="nav-icon-link is-btn">
                <span class="nav-icon-wrap" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                    <path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
                      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </span>
                <span class="nav-label">My account</span>
              </button>
              <div class="account-dropdown">
                <div class="account-dropdown-inner">
                  <router-link to="/profile" class="drop-item">⚙️ Settings</router-link>
                  <router-link to="/orders" class="drop-item">📦 My Orders</router-link>
                  <router-link to="/wishlist" class="drop-item">❤️ Wishlist</router-link>
                  <router-link to="/returns" class="drop-item">↩️ Returns</router-link>
                  <div class="drop-divider" />
                  <button type="button" class="drop-item drop-signout" @click="handleLogout">🚪 Sign out</button>
                </div>
              </div>
            </div>
          </template>

          <router-link class="nav-icon-link" to="/wishlist">
            <span class="nav-icon-wrap" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                />
              </svg>
            </span>
            <span class="nav-label">Wishlist</span>
          </router-link>

          <button
            type="button"
            class="nav-icon-link is-btn"
            :aria-expanded="miniCartOpen"
            aria-haspopup="dialog"
            aria-controls="mini-cart-dialog"
            @click="miniCartOpen = !miniCartOpen"
          >
            <span class="nav-icon-wrap cart-wrap" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 6h15l-1.5 9h-12zM6 6L5 3H2M9 20a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z"
                />
              </svg>
              <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
            </span>
            <span class="nav-label">My cart</span>
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

  <MiniCartDrawer v-model="miniCartOpen" />
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductsStore } from "../stores/products.js";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";
import MiniCartDrawer from "./MiniCartDrawer.vue";

const router = useRouter();
const route = useRoute();
const { cartCount } = useCartStore();
const { isLoggedIn, logout } = useAuthStore();
const accountOpen = ref(false);
function handleLogout() { logout(); router.push("/login"); }
const { state: productsState } = useProductsStore();

const miniCartOpen = ref(false);

const searchQuery = ref(route.query.search || "");

const categoriesWithoutAll = computed(() =>
  [...new Set(productsState.products.map((p) => p.category))].filter(Boolean).sort()
);

watch(
  () => route.query.search,
  (s) => {
    searchQuery.value = s || "";
  },
  { immediate: true },
);

watch(
  () => route.fullPath,
  () => {
    miniCartOpen.value = false;
  },
);

function handleSearch() {
  const q = searchQuery.value.trim();
  router.push({
    path: "/",
    query: q ? { search: q } : {},
  });
}

function goToCategory(category) {
  router.push({
    path: "/",
    query: category === "All" ? {} : { category },
  });
}

function goToDeals() {
  router.push("/deals");
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
  background: #f1f5f9;
  color: #475569;
  font-size: 0.72rem;
  border-bottom: 1px solid #e2e8f0;
}

.utility-inner {
  justify-content: space-between;
  padding-top: 6px;
  padding-bottom: 6px;
}

.utility-inner p {
  margin: 0;
}

.main-nav {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 14px 24px;
}

.navbar-container {
  max-width: 1320px;
  width: 100%;
  min-width: 0;
  margin: 0 auto;
  box-sizing: border-box;
}

.main-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: clamp(12px, 2vw, 28px);
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
  border-radius: 10px;
  background: #ffffff;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;
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

.search-wrap {
  display: flex;
  justify-content: center;
  min-width: 0;
}

.search-shell {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  max-width: 340px;
  height: 44px;
  padding: 0 6px 0 14px;
  border-radius: 22px;
  border: 1px solid #e2e8f0;
  background: #f1f5f9;
  box-sizing: border-box;
}

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-size: 0.88rem;
  outline: none;
  color: #0f172a;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-btn-round {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #1e3a8a;
  color: #ffffff;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.15s ease;
}

.search-btn-round:hover {
  background: #172554;
}

.search-btn-round:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.nav-actions {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: clamp(10px, 1.8vw, 22px);
  flex-shrink: 0;
}

.nav-icon-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  text-decoration: none;
  color: #0f172a;
  font: inherit;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 2px;
  max-width: 88px;
  text-align: center;
  transition: color 0.15s ease;
}

.nav-icon-link:hover {
  color: #2563eb;
}

.nav-icon-link:focus-visible {
  outline: 2px solid rgba(37, 99, 235, 0.45);
  outline-offset: 3px;
  border-radius: 4px;
}

.nav-icon-link.is-btn {
  padding-top: 4px;
}

.account-menu {
  position: relative;
}

.account-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  padding-top: 8px;
  background: transparent;
  z-index: 200;
  min-width: 180px;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.account-menu:hover .account-dropdown,
.account-dropdown:hover {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
.account-dropdown-inner {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(15,23,42,0.12);
  padding: 6px;
  display: grid;
  gap: 2px;
}

.drop-item {
  display: block;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 500;
  color: #334155;
  text-decoration: none;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
}
.drop-item:hover { background: #f1f5f9; }
.drop-divider { height: 1px; background: #e2e8f0; margin: 4px 0; }
.drop-signout { color: #dc2626; font-weight: 600; }

.nav-icon-wrap {
  display: grid;
  place-items: center;
  color: #0f172a;
}

.nav-icon-link:hover .nav-icon-wrap {
  color: #2563eb;
}

.nav-label {
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.2;
  color: inherit;
}

.cart-wrap {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #64748b;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.category-nav {
  background: #ffffff;
  padding: 10px 24px 12px;
  border-bottom: 1px solid #dbe5f1;
}

.nav-categories {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: clamp(14px, 2.2vw, 28px);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.cat-link {
  color: #0f172a;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 10px 0 8px;
  margin: 0;
  white-space: nowrap;
  transition: color 0.15s ease, border-color 0.15s ease;
  cursor: pointer;
  font-family: inherit;
}

.cat-link:hover {
  color: #2563eb;
}

.cat-link:focus-visible {
  outline: 2px solid rgba(37, 99, 235, 0.45);
  outline-offset: 3px;
  border-radius: 2px;
}

.cat-link.active {
  color: #1d4ed8;
  border-bottom-color: #2563eb;
}

.cat-link.deal {
  color: #9a3412;
}

.cat-link.deal:hover {
  color: #c2410c;
}

@media (max-width: 980px) {
  .main-nav {
    padding: 12px 16px;
  }

  .main-row {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
  }

  .search-wrap {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-content: stretch;
  }

  .search-shell {
    max-width: none;
  }

  .nav-actions {
    grid-column: 2;
    grid-row: 1;
    flex-wrap: wrap;
    justify-content: flex-end;
    max-width: min(100%, 280px);
  }

  .logo {
    grid-column: 1;
    grid-row: 1;
  }

  .utility-inner {
    display: none;
  }

  .category-nav {
    padding: 8px 16px 10px;
  }

  .nav-label {
    display: none;
  }

  .nav-icon-link {
    max-width: none;
    padding: 6px;
  }
}

@media (max-width: 520px) {
  .logo {
    padding: 6px 8px;
    gap: 7px;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
    font-size: 0.65rem;
  }

  .logo-text {
    font-size: 0.92rem;
  }
}
</style>

<template>
  <div class="home">
    <section class="hero-panel">
      <div class="hero-main">
        <p class="hero-kicker">ONLINE BOOKSTORE</p>
        <h1>Books you'll actually want to read, delivered fast.</h1>
        <p>
          Explore bestsellers, hidden gems, and timeless classics from one clean
          marketplace.
        </p>
        <div class="hero-cta-row">
          <button class="hero-btn primary" @click="goToFeatured">
            Explore bestsellers
          </button>
          <button class="hero-btn secondary" @click="setCategory('Technology')">
            Browse technology
          </button>
        </div>
      </div>
      <div class="hero-side">
        <div class="hero-stat">
          <strong>{{ products.length }}+</strong>
          <span>Curated titles</span>
        </div>
        <div class="hero-stat">
          <strong>4.8/5</strong>
          <span>Average customer rating</span>
        </div>
        <div class="hero-stat">
          <strong>Same-day</strong>
          <span>Dispatch on top sellers</span>
        </div>
      </div>
    </section>

    <section ref="bestsellersRef" class="shelf-row" v-if="showBestsellers">
      <div class="section-head">
        <h2>Bestsellers this week</h2>
        <p>Most purchased books across all categories.</p>
      </div>
      <div class="shelf-items">
        <article
          v-for="book in featuredBooks"
          :key="book.id"
          class="shelf-card"
          @click="router.push(`/product/${book.id}`)"
        >
          <img :src="book.image" :alt="book.name" />
          <div class="shelf-meta">
            <p class="shelf-category">{{ book.category }}</p>
            <h3>{{ book.name }}</h3>
            <p>{{ book.distributor }}</p>
            <strong>{{ book.price.toFixed(2) }} TL</strong>
          </div>
        </article>
      </div>
    </section>

    <section class="discover">
      <div class="section-head">
        <h2>Discover books</h2>
        <p>Use marketplace filters to find your next read.</p>
      </div>

      <div class="discover-controls" role="search">
        <div class="control-left">
          <div class="control-field search-field">
            <input
              v-model="localSearch"
              type="text"
              placeholder="Search by title, author, ISBN..."
              class="search-input"
            />
          </div>
          <select v-model="selectedCategory" class="control-select">
            <option value="All">All categories</option>
            <option
              v-for="category in categoriesWithoutAll"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
          <select v-model="sortBy" class="control-select">
            <option value="default">Featured first</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
            <option value="rating">Top rated</option>
            <option value="newest">Newest arrivals</option>
          </select>
        </div>

        <div class="control-right">
          <label class="stock-toggle">
            <input type="checkbox" v-model="inStockOnly" />
            <span>In-stock only</span>
          </label>
          <button class="clear-btn" @click="clearFilters">Reset</button>
        </div>
      </div>

      <div class="category-chips">
        <button
          class="chip"
          :class="{ active: selectedCategory === 'All' }"
          @click="setCategory('All')"
        >
          All
        </button>
        <button
          v-for="category in categoriesWithoutAll"
          :key="category"
          class="chip"
          :class="{ active: selectedCategory === category }"
          @click="setCategory(category)"
        >
          {{ category }}
        </button>
      </div>

      <div class="results-head">
        <div class="results-summary">
          <p class="results-title">
            Showing <strong>{{ filteredProducts.length }}</strong> books
          </p>
          <p class="results-sub">
            <span v-if="activeSearch && activeCategoryLabel">
              Results for <strong>“{{ activeSearch }}”</strong> in
              <strong>{{ activeCategoryLabel }}</strong>.
            </span>
            <span v-else-if="activeSearch">
              Results for <strong>“{{ activeSearch }}”</strong>.
            </span>
            <span v-else-if="activeCategoryLabel">
              Browsing <strong>{{ activeCategoryLabel }}</strong>.
            </span>
            <span v-else>Browsing <strong>all categories</strong>.</span>
          </p>
        </div>

        <div class="active-filters" v-if="activeSearch || activeCategoryLabel">
          <span v-if="activeSearch" class="filter-pill">
            Search: <span class="filter-value">“{{ activeSearch }}”</span>
          </span>
          <span v-if="activeCategoryLabel" class="filter-pill">
            Category: <span class="filter-value">{{ activeCategoryLabel }}</span>
          </span>
        </div>
      </div>

      <div class="market-layout">
        <main class="products-column">
          <section class="products-section">
            <div class="product-grid" v-if="filteredProducts.length > 0">
              <ProductCard
                v-for="product in filteredProducts"
                :key="product.id"
                :product="product"
              />
            </div>

            <div v-else class="empty-state">
              <div class="empty-icon" aria-hidden="true"></div>
              <h3 class="empty-title">
                <span v-if="activeSearch">
                  No matches for <span class="empty-em">“{{ activeSearch }}”</span>
                </span>
                <span v-else>No results found</span>
              </h3>
              <p class="empty-sub">
                <span v-if="activeSearch && activeCategoryLabel">
                  Try broadening your search or changing categories—there are no results
                  for <strong>“{{ activeSearch }}”</strong> in
                  <strong>{{ activeCategoryLabel }}</strong>.
                </span>
                <span v-else-if="activeCategoryLabel">
                  We couldn't find any books in <strong>{{ activeCategoryLabel }}</strong>
                  with the current filters.
                </span>
                <span v-else>
                  We couldn't find any books with the current filters.
                </span>
              </p>

              <ul class="empty-suggestions">
                <li v-if="activeSearch">Check spelling or try a broader keyword.</li>
                <li v-if="activeCategoryLabel">Switch to <strong>All categories</strong>.</li>
                <li v-if="inStockOnly">Turn off <strong>In-stock only</strong>.</li>
                <li v-if="sortBy !== 'default'">Set sorting back to <strong>Featured first</strong>.</li>
                <li>Remove filters one by one to see what’s narrowing results.</li>
                <li>Or reset everything and start fresh.</li>
              </ul>

              <div class="empty-actions">
                <button class="clear-btn" @click="clearFilters">Reset filters</button>
              </div>
            </div>
          </section>
        </main>

        <aside class="info-column">
          <div class="info-card">
            <h3>Shop with confidence</h3>
            <ul>
              <li>Trusted ratings from verified buyers</li>
              <li>Fast and trackable shipping options</li>
              <li>Secure checkout and easy returns</li>
            </ul>
          </div>
          <div class="info-card">
            <h3>Reading recommendations</h3>
            <p>
              Start with top-rated titles if you are unsure where to begin.
            </p>
            <button class="hero-btn primary small" @click="sortBy = 'rating'">
              Show top rated
            </button>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { products, categories } from "../data/products.js";
import ProductCard from "../components/ProductCard.vue";

const route = useRoute();
const router = useRouter();

const localSearch = ref("");
const selectedCategory = ref("All");
const sortBy = ref("default");
const inStockOnly = ref(false);
const bestsellersRef = ref(null);

watch(
  () => route.query,
  (query) => {
    localSearch.value = query.search || "";
    selectedCategory.value = query.category || "All";
    sortBy.value = query.sort || "default";
    inStockOnly.value = query.stock === "1";
  },
  { immediate: true },
);

watch(
  [localSearch, selectedCategory, sortBy, inStockOnly],
  ([search, category, sort, stock]) => {
    router.replace({
      path: "/",
      query: {
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(category !== "All" ? { category } : {}),
        ...(sort !== "default" ? { sort } : {}),
        ...(stock ? { stock: "1" } : {}),
      },
    });
  },
);

const categoriesWithoutAll = computed(() =>
  categories.filter((c) => c !== "All"),
);

const showBestsellers = computed(() => {
  const hasSearch = Boolean(localSearch.value.trim());
  const hasCategoryFilter = selectedCategory.value !== "All";
  const hasSort = sortBy.value !== "default";
  const hasStockFilter = inStockOnly.value;

  return !hasSearch && !hasCategoryFilter && !hasSort && !hasStockFilter;
});

const activeSearch = computed(() => localSearch.value.trim());
const activeCategoryLabel = computed(() => {
  return selectedCategory.value !== "All" ? selectedCategory.value : "";
});

function setCategory(category) {
  selectedCategory.value = category;
}

function clearFilters() {
  router.push({ path: "/" });
}

function goToFeatured() {
  if (!showBestsellers.value) {
    localSearch.value = "";
    selectedCategory.value = "All";
    sortBy.value = "default";
    inStockOnly.value = false;
  }

  nextTick(() => {
    bestsellersRef.value?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

const filteredProducts = computed(() => {
  let result = [...products];

  if (selectedCategory.value !== "All") {
    result = result.filter((p) => p.category === selectedCategory.value);
  }

  if (localSearch.value.trim()) {
    const query = localSearch.value.trim().toLowerCase();
    result = result.filter((p) => {
      const name = (p?.name ?? "").toString().toLowerCase();
      const description = (p?.description ?? "").toString().toLowerCase();
      const distributor = (p?.distributor ?? "").toString().toLowerCase();
      const author = (p?.author ?? "").toString().toLowerCase();
      const serialNumber = (p?.serialNumber ?? "").toString().toLowerCase();

      return (
        name.includes(query) ||
        description.includes(query) ||
        distributor.includes(query) ||
        author.includes(query) ||
        serialNumber.includes(query)
      );
    });
  }

  if (inStockOnly.value) {
    result = result.filter((p) => p.quantity > 0);
  }

  if (sortBy.value === "price-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (sortBy.value === "price-desc") {
    result.sort((a, b) => b.price - a.price);
  } else if (sortBy.value === "rating") {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sortBy.value === "newest") {
    result.sort((a, b) => b.id - a.id);
  }

  return result;
});

const featuredBooks = computed(() => {
  return [...products].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 5);
});
</script>

<style scoped>
.home {
  max-width: 1360px;
  margin: 0 auto;
  padding: 34px 24px 44px;
  display: grid;
  gap: 26px;
  color: #0f172a;
}

.home :deep(button),
.home :deep(input),
.home :deep(select) {
  font: inherit;
}

.home :deep(button) {
  -webkit-tap-highlight-color: transparent;
}

.hero-panel {
  background:
    radial-gradient(circle at 82% 10%, rgba(148, 197, 255, 0.3), transparent 35%),
    linear-gradient(120deg, #0f172a 0%, #1e3a8a 52%, #1d4ed8 100%);
  color: white;
  border-radius: 26px;
  padding: 34px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.hero-panel::after {
  content: "";
  position: absolute;
  inset: -80px -120px auto auto;
  width: 260px;
  height: 260px;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(250, 204, 21, 0.35),
    rgba(250, 204, 21, 0) 60%
  );
  transform: rotate(12deg);
  pointer-events: none;
}

.hero-main h1 {
  margin: 0 0 12px;
  font-size: clamp(2rem, 2.5vw, 2.6rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.hero-main p {
  margin: 0;
  color: #e2e8f0;
  max-width: 600px;
  font-size: 1rem;
  line-height: 1.55;
}

.hero-kicker {
  margin: 0 0 12px;
  font-size: 0.74rem;
  letter-spacing: 0.18em;
  color: #bfdbfe;
}

.hero-cta-row {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-btn {
  border-radius: 12px;
  padding: 11px 14px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease,
    border-color 160ms ease, color 160ms ease;
}

.hero-btn.primary {
  background: #facc15;
  color: #1f2937;
  border: 1px solid #fbbf24;
}

.hero-btn.secondary {
  background: transparent;
  color: #eff6ff;
  border: 1px solid rgba(191, 219, 254, 0.8);
}

.hero-btn:hover {
  transform: translateY(-1px);
}

.hero-btn.primary:hover {
  box-shadow: 0 10px 22px rgba(250, 204, 21, 0.22);
}

.hero-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(219, 234, 254, 0.9);
}

.hero-btn:focus-visible {
  outline: 3px solid rgba(250, 204, 21, 0.35);
  outline-offset: 2px;
}

.hero-btn.small {
  padding: 10px 12px;
  font-size: 0.78rem;
}

.hero-side {
  display: grid;
  gap: 12px;
}

.hero-stat {
  border: 1px solid rgba(191, 219, 254, 0.55);
  background: rgba(255, 255, 255, 0.09);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  backdrop-filter: blur(10px);
}

.hero-stat strong {
  font-size: 1.25rem;
}

.hero-stat span {
  font-size: 0.8rem;
  color: #e2e8f0;
}

.section-head {
  display: grid;
  gap: 6px;
}

.section-head h2 {
  margin: 0;
  font-size: 1.4rem;
  letter-spacing: -0.01em;
}

.section-head p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

.shelf-row {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 22px;
  padding: 22px;
  box-shadow: var(--shadow-sm);
}

.shelf-items {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}

.shelf-card {
  border: 1px solid #dbe5f1;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  background: #ffffff;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.shelf-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: rgba(59, 130, 246, 0.32);
}

.shelf-card img {
  width: 100%;
  height: 176px;
  object-fit: cover;
}

.shelf-meta {
  padding: 12px 12px 14px;
}

.shelf-meta h3 {
  margin: 6px 0 4px;
  font-size: 0.95rem;
  line-height: 1.3;
}

.shelf-meta p {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
}

.shelf-meta strong {
  display: inline-block;
  margin-top: 10px;
  color: #0f172a;
}

.shelf-category {
  color: #1e40af !important;
  font-weight: 700;
  font-size: 0.72rem !important;
  text-transform: uppercase;
}

.discover {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 22px;
  padding: 22px;
  box-shadow: var(--shadow-sm);
}

.discover-controls {
  margin-top: 16px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  padding: 14px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.06);
}

.control-left {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr;
  gap: 12px;
  flex: 1;
}

.control-field {
  min-width: 0;
}

.search-field {
  position: relative;
}

.search-field::before {
  content: "";
  position: absolute;
  left: 12px;
  top: 50%;
  width: 18px;
  height: 18px;
  transform: translateY(-50%);
  opacity: 0.55;
  background: currentColor;
  color: #475569;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M10 4a6 6 0 1 0 0 12a6 6 0 0 0 0-12m-8 6a8 8 0 1 1 14.32 4.906l4.387 4.387a1 1 0 0 1-1.414 1.414l-4.387-4.387A8 8 0 0 1 2 10'/%3E%3C/svg%3E")
    center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M10 4a6 6 0 1 0 0 12a6 6 0 0 0 0-12m-8 6a8 8 0 1 1 14.32 4.906l4.387 4.387a1 1 0 0 1-1.414 1.414l-4.387-4.387A8 8 0 0 1 2 10'/%3E%3C/svg%3E")
    center / contain no-repeat;
  pointer-events: none;
}

.search-input,
.control-select {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.55);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  padding: 11px 12px;
  height: 44px;
  transition: box-shadow 160ms ease, border-color 160ms ease,
    background 160ms ease;
}

.search-input {
  padding-left: 40px;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus,
.control-select:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.55);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
  background: #ffffff;
}

.control-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stock-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #334155;
  font-size: 0.84rem;
  padding: 0 6px;
}

.clear-btn {
  border: 1px solid #cfdbea;
  border-radius: 14px;
  background: #ffffff;
  padding: 10px 12px;
  cursor: pointer;
  font-weight: 600;
  height: 44px;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.clear-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
  border-color: rgba(59, 130, 246, 0.32);
}

.clear-btn:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.25);
  outline-offset: 2px;
}

.category-chips {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  border: 1px solid #dbe5f1;
  border-radius: 999px;
  background: #ffffff;
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease,
    background 160ms ease, color 160ms ease;
}

.chip:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
  border-color: rgba(59, 130, 246, 0.25);
}

.chip.active {
  background: #2563eb;
  color: #ffffff;
  border-color: #1d4ed8;
}

.results-head {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.results-summary {
  display: grid;
  gap: 2px;
}

.results-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 650;
}

.results-title strong {
  font-weight: 850;
}

.results-sub {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.32);
  background: rgba(248, 251, 255, 0.8);
  color: #334155;
  font-size: 0.8rem;
  font-weight: 650;
}

.filter-value {
  color: #0f172a;
  font-weight: 800;
}

.market-layout {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 18px;
}

.products-column {
  min-width: 0;
}

.products-section {
  background: rgba(248, 251, 255, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 18px;
  padding: 16px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 18px;
}

.info-column {
  display: grid;
  gap: 14px;
  align-content: start;
}

.info-card {
  border: 1px solid rgba(148, 163, 184, 0.26);
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  padding: 16px;
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.06);
}

.info-card h3 {
  margin: 0 0 8px;
  font-size: 1.02rem;
}

.info-card p {
  margin: 0;
  color: #475569;
  font-size: 0.85rem;
  line-height: 1.55;
}

.info-card ul {
  margin: 0;
  padding-left: 18px;
  color: #334155;
  display: grid;
  gap: 8px;
  font-size: 0.83rem;
}

.empty-state {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px dashed rgba(148, 163, 184, 0.55);
  border-radius: 18px;
  text-align: center;
  padding: 44px 20px;
  display: grid;
  justify-items: center;
  gap: 10px;
}

.empty-icon {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(248, 251, 255, 0.9);
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.06);
  display: grid;
  place-items: center;
}

.empty-icon::before {
  content: "";
  width: 26px;
  height: 26px;
  opacity: 0.55;
  background: currentColor;
  color: #475569;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M10 4a6 6 0 1 0 0 12a6 6 0 0 0 0-12m-8 6a8 8 0 1 1 14.32 4.906l4.387 4.387a1 1 0 0 1-1.414 1.414l-4.387-4.387A8 8 0 0 1 2 10'/%3E%3C/svg%3E")
    center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M10 4a6 6 0 1 0 0 12a6 6 0 0 0 0-12m-8 6a8 8 0 1 1 14.32 4.906l4.387 4.387a1 1 0 0 1-1.414 1.414l-4.387-4.387A8 8 0 0 1 2 10'/%3E%3C/svg%3E")
    center / contain no-repeat;
}

.empty-title {
  margin: 6px 0 0;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  color: #0f172a;
}

.empty-em {
  font-weight: 850;
}

.empty-sub {
  margin: 0;
  max-width: 56ch;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.55;
}

.empty-suggestions {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
  color: #475569;
  font-size: 0.86rem;
}

.empty-suggestions li::before {
  content: "•";
  color: rgba(37, 99, 235, 0.7);
  margin-right: 8px;
}

.empty-actions {
  margin-top: 8px;
  display: flex;
  justify-content: center;
}

@media (max-width: 1200px) {
  .shelf-items {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .market-layout {
    grid-template-columns: 1fr;
  }

  .info-column {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 880px) {
  .hero-panel {
    grid-template-columns: 1fr;
  }

  .control-left {
    grid-template-columns: 1fr;
  }

  .discover-controls {
    flex-direction: column;
  }

  .shelf-items {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .info-column {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .home {
    padding: 22px 14px 34px;
  }

  .shelf-items {
    grid-template-columns: 1fr;
  }

  .products-section {
    padding: 12px;
  }
}
</style>

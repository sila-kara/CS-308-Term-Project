<template>
  <div class="home">
    <section
      class="hero-carousel"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      @mouseenter="pauseHeroAutoplay"
      @mouseleave="resumeHeroAutoplay"
    >
      <div class="carousel-shell">
        <button
          type="button"
          class="carousel-arrow carousel-arrow--prev"
          aria-label="Previous slide"
          @click="prevHeroSlide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
            <path stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <div class="carousel-window">
          <div
            class="carousel-track"
            :style="{ transform: `translate3d(-${heroSlideIndex * heroSlidePct}%, 0, 0)` }"
          >
            <article
              v-for="(slide, slideIdx) in heroSlides"
              :key="slide.key"
              class="carousel-slide"
              :class="`carousel-slide--${slide.theme}`"
              aria-roledescription="slide"
              :aria-hidden="heroSlideIndex !== slideIdx"
            >
              <div class="slide-backdrop" aria-hidden="true" />
              <div class="slide-inner">
                <div class="slide-copy">
                  <p class="slide-kicker">{{ slide.kicker }}</p>
                  <h2 class="slide-title">{{ slide.title }}</h2>
                  <p class="slide-sub">{{ slide.subtitle }}</p>
                  <button type="button" class="slide-cta" @click="slide.onCta">
                    {{ slide.ctaLabel }}
                  </button>
                </div>
                <div class="slide-covers">
                  <button
                    v-for="book in slide.books"
                    :key="book.id"
                    type="button"
                    class="cover-hit"
                    @click="router.push(`/product/${book.id}`)"
                  >
                    <img :src="book.image" :alt="book.name" />
                    <span class="cover-price">{{ book.price.toFixed(0) }} TL</span>
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
        <button
          type="button"
          class="carousel-arrow carousel-arrow--next"
          aria-label="Next slide"
          @click="nextHeroSlide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
            <path stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      <div class="carousel-dots" role="tablist" aria-label="Choose slide">
        <button
          v-for="(slide, i) in heroSlides"
          :key="slide.key + '-dot'"
          type="button"
          role="tab"
          class="carousel-dot"
          :class="{ active: heroSlideIndex === i }"
          :aria-selected="heroSlideIndex === i"
          :aria-label="`${slide.title} slide`"
          @click="heroSlideIndex = i"
        />
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

    <section ref="discoverRef" class="discover">
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
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
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
const discoverRef = ref(null);

const heroSlideIndex = ref(0);
const heroSlideCount = 3;
const heroSlidePct = 100 / heroSlideCount;

let heroAutoplayId = null;
let heroAutoplayPaused = false;

const carouselBestsellerBooks = computed(() =>
  [...products].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 3),
);
const carouselNewBooks = computed(() =>
  [...products].sort((a, b) => b.id - a.id).slice(0, 3),
);
const carouselDealBooks = computed(() =>
  [...products].sort((a, b) => a.price - b.price).slice(0, 3),
);

function prevHeroSlide() {
  heroSlideIndex.value =
    (heroSlideIndex.value - 1 + heroSlideCount) % heroSlideCount;
}

function nextHeroSlide() {
  heroSlideIndex.value = (heroSlideIndex.value + 1) % heroSlideCount;
}

function clearHeroAutoplay() {
  if (heroAutoplayId != null) {
    clearInterval(heroAutoplayId);
    heroAutoplayId = null;
  }
}

function tickHeroAutoplay() {
  if (heroAutoplayPaused) return;
  nextHeroSlide();
}

function startHeroAutoplay() {
  clearHeroAutoplay();
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  heroAutoplayId = window.setInterval(tickHeroAutoplay, 6000);
}

function pauseHeroAutoplay() {
  heroAutoplayPaused = true;
}

function resumeHeroAutoplay() {
  heroAutoplayPaused = false;
}

onMounted(() => {
  startHeroAutoplay();
});

onUnmounted(() => {
  clearHeroAutoplay();
});

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

function scrollToDiscover() {
  nextTick(() => {
    discoverRef.value?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

function goToNewArrivals() {
  localSearch.value = "";
  selectedCategory.value = "All";
  sortBy.value = "newest";
  inStockOnly.value = false;
  scrollToDiscover();
}

function goToBargains() {
  localSearch.value = "";
  selectedCategory.value = "All";
  sortBy.value = "price-asc";
  inStockOnly.value = false;
  scrollToDiscover();
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

const heroSlides = computed(() => [
  {
    key: "bestsellers",
    kicker: "BookWorld",
    title: "Bestsellers",
    subtitle: "This week’s most-loved books—curated in one place for you.",
    ctaLabel: "View list",
    theme: "bestsellers",
    books: carouselBestsellerBooks.value,
    onCta: goToFeatured,
  },
  {
    key: "new",
    kicker: "New in",
    title: "New arrivals",
    subtitle: "Fresh titles and new editions recently added to the catalog.",
    ctaLabel: "Browse new titles",
    theme: "new",
    books: carouselNewBooks.value,
    onCta: goToNewArrivals,
  },
  {
    key: "deals",
    kicker: "Deals",
    title: "On sale",
    subtitle: "Lowest prices in the store—great reads without overspending.",
    ctaLabel: "Shop deals",
    theme: "deals",
    books: carouselDealBooks.value,
    onCta: goToBargains,
  },
]);

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
  width: 100%;
  margin: 0 auto;
  padding: 34px 24px 44px;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 26px;
  color: #0f172a;
  box-sizing: border-box;
  overflow-x: clip;
}

.home :deep(button),
.home :deep(input),
.home :deep(select) {
  font: inherit;
}

.home :deep(button) {
  -webkit-tap-highlight-color: transparent;
}

.hero-carousel {
  display: grid;
  gap: 14px;
  min-width: 0;
  max-width: 100%;
}

.carousel-shell {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.carousel-window {
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.carousel-track {
  display: flex;
  width: 300%;
  max-width: none;
  transition: transform 0.48s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.carousel-slide {
  position: relative;
  width: 33.333333%;
  flex-shrink: 0;
  box-sizing: border-box;
  min-width: 0;
  min-height: min(320px, 52vw);
  overflow: hidden;
}

.slide-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.carousel-slide--bestsellers .slide-backdrop {
  background:
    radial-gradient(ellipse 90% 70% at 88% 40%, rgba(37, 99, 235, 0.12), transparent 55%),
    radial-gradient(ellipse 60% 50% at 12% 88%, rgba(250, 204, 21, 0.14), transparent 50%),
    linear-gradient(105deg, #ffffff 0%, #f1f5f9 48%, #eef2ff 100%);
}

.carousel-slide--new .slide-backdrop {
  background:
    radial-gradient(ellipse 85% 65% at 80% 30%, rgba(13, 148, 136, 0.12), transparent 55%),
    radial-gradient(ellipse 55% 45% at 10% 80%, rgba(45, 212, 191, 0.1), transparent 48%),
    linear-gradient(105deg, #ffffff 0%, #f0fdfa 45%, #ecfeff 100%);
}

.carousel-slide--deals .slide-backdrop {
  background:
    radial-gradient(ellipse 90% 70% at 85% 45%, rgba(234, 88, 12, 0.1), transparent 52%),
    radial-gradient(ellipse 50% 45% at 15% 75%, rgba(251, 191, 36, 0.16), transparent 50%),
    linear-gradient(105deg, #ffffff 0%, #fffbeb 42%, #fef3c7 100%);
}

.slide-inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr);
  gap: clamp(16px, 3vw, 36px);
  align-items: center;
  padding: clamp(22px, 4vw, 40px) clamp(20px, 5vw, 52px) clamp(22px, 4vw, 40px)
    clamp(20px, 4vw, 44px);
  max-width: 100%;
}

.slide-copy {
  min-width: 0;
}

.slide-kicker {
  margin: 0 0 8px;
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #64748b;
}

.carousel-slide--bestsellers .slide-kicker {
  color: #1d4ed8;
}

.carousel-slide--new .slide-kicker {
  color: #0f766e;
}

.carousel-slide--deals .slide-kicker {
  color: #c2410c;
}

.slide-title {
  margin: 0 0 10px;
  font-size: clamp(1.45rem, 2.8vw, 2.15rem);
  line-height: 1.12;
  letter-spacing: -0.025em;
  color: #0f172a;
  font-weight: 850;
}

.slide-sub {
  margin: 0;
  font-size: 0.94rem;
  line-height: 1.55;
  color: #475569;
  max-width: 34ch;
}

.slide-cta {
  margin-top: 18px;
  border-radius: 8px;
  padding: 11px 18px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.slide-cta:hover {
  transform: translateY(-1px);
}

.carousel-slide--bestsellers .slide-cta {
  background: #2563eb;
  color: #ffffff;
  border-color: #1d4ed8;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
}

.carousel-slide--new .slide-cta {
  background: #0d9488;
  color: #ffffff;
  border-color: #0f766e;
  box-shadow: 0 8px 20px rgba(13, 148, 136, 0.22);
}

.carousel-slide--deals .slide-cta {
  background: linear-gradient(145deg, #facc15, #f59e0b);
  color: #1f2937;
  border-color: #f59e0b;
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.28);
}

.slide-cta:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.35);
  outline-offset: 2px;
}

.slide-covers {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: clamp(8px, 2vw, 14px);
  flex-wrap: wrap;
  min-width: 0;
  max-width: 100%;
}

.cover-hit {
  position: relative;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  flex: 0 1 auto;
  width: clamp(64px, 20vw, 108px);
  max-width: 100%;
}

.cover-hit:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16);
}

.cover-hit:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.45);
  outline-offset: 3px;
}

.cover-hit img {
  display: block;
  width: 100%;
  aspect-ratio: 2 / 2.55;
  object-fit: cover;
}

.cover-price {
  display: block;
  padding: 6px 8px 8px;
  font-size: 0.72rem;
  font-weight: 800;
  color: #0f172a;
  background: linear-gradient(to top, #ffffff, #f8fafc);
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  translate: 0 -50%;
  z-index: 2;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.96);
  color: #334155;
  cursor: pointer;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.1);
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.carousel-arrow:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

.carousel-arrow:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.35);
  outline-offset: 2px;
}

.carousel-arrow--prev {
  left: 10px;
}

.carousel-arrow--next {
  right: 10px;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.carousel-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: none;
  padding: 0;
  background: #cbd5e1;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
}

.carousel-dot:hover {
  background: #94a3b8;
}

.carousel-dot.active {
  background: #2563eb;
  transform: scale(1.2);
}

.carousel-dot:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .carousel-track {
    transition: none;
  }

  .cover-hit:hover {
    transform: none;
  }
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
  border-radius: 12px;
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
  border-radius: 10px;
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
  border-radius: 12px;
  padding: 22px;
  box-shadow: var(--shadow-sm);
}

.discover-controls {
  margin-top: 16px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 10px;
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
  border-radius: 8px;
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
  border-radius: 8px;
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
  border-radius: 8px;
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
  border-radius: 8px;
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
  width: 100%;
  min-width: 0;
}

.products-column {
  min-width: 0;
  width: 100%;
}

.products-section {
  background: rgba(248, 251, 255, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 10px;
  padding: 16px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 18px;
}

.empty-state {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px dashed rgba(148, 163, 184, 0.55);
  border-radius: 10px;
  text-align: center;
  padding: 44px 20px;
  display: grid;
  justify-items: center;
  gap: 10px;
}

.empty-icon {
  width: 54px;
  height: 54px;
  border-radius: 8px;
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
}

@media (max-width: 880px) {
  .slide-inner {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .slide-sub {
    max-width: none;
    margin: 0 auto;
  }

  .slide-covers {
    justify-content: center;
  }

  .carousel-arrow {
    width: 38px;
    height: 38px;
  }

  .carousel-arrow--prev {
    left: 6px;
  }

  .carousel-arrow--next {
    right: 6px;
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

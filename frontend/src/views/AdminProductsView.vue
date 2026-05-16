<template>
  <div class="admin-page">
    <header class="page-head">
      <h1>Products & Stock</h1>
      <p>Add and remove products, manage categories, and update stock quantities. Prices and discounts are handled by Sales Manager.</p>
    </header>

    <section class="panel">
      <div class="section-head">
        <h2>Add product</h2>
        <span>Initial price is set by Sales Manager after creation.</span>
      </div>

      <form class="product-form" @submit.prevent="submitProduct">
        <label>
          Name
          <input v-model.trim="productForm.name" required />
        </label>
        <label>
          Model
          <input v-model.trim="productForm.model" required />
        </label>
        <label>
          Serial number
          <input v-model.trim="productForm.serialNumber" required />
        </label>
        <label>
          Category
          <select v-model="productForm.category" required>
            <option value="" disabled>Select category</option>
            <option v-for="category in categoriesState.categories" :key="category._id" :value="category._id">
              {{ category.name }}
            </option>
          </select>
        </label>
        <label>
          Stock
          <input v-model.number="productForm.quantity" type="number" min="0" required />
        </label>
        <label>
          Author
          <input v-model.trim="productForm.author" />
        </label>
        <label>
          Distributor
          <input v-model.trim="productForm.distributor" />
        </label>
        <label>
          Warranty
          <input v-model.trim="productForm.warranty" />
        </label>
        <label class="wide">
          Image URL
          <input v-model.trim="productForm.image" />
        </label>
        <label class="wide">
          Description
          <textarea v-model.trim="productForm.description" rows="3" required />
        </label>
        <p v-if="productError" class="error">{{ productError }}</p>
        <button class="primary-btn" type="submit" :disabled="savingProduct">
          {{ savingProduct ? "Saving..." : "Add product" }}
        </button>
      </form>
    </section>

    <section class="panel">
      <div class="section-head">
        <h2>Categories</h2>
        <span>Categories with products cannot be deleted.</span>
      </div>

      <form class="category-form" @submit.prevent="submitCategory">
        <input v-model.trim="categoryName" placeholder="New category name" />
        <button class="primary-btn" type="submit" :disabled="savingCategory || !categoryName">Add category</button>
      </form>
      <p v-if="categoryError" class="error">{{ categoryError }}</p>

      <div class="category-list">
        <span v-for="category in categoriesState.categories" :key="category._id" class="category-chip">
          {{ category.name }}
          <button type="button" title="Delete category" @click="removeCategory(category)">x</button>
        </span>
      </div>
    </section>

    <section class="panel">
      <div class="section-head">
        <h2>Inventory</h2>
        <span>{{ productsState.products.length }} products</span>
      </div>

      <div v-if="productsState.loading" class="state">Loading products...</div>
      <div v-else-if="productsState.error" class="state error">{{ productsState.error }}</div>
      <div v-else class="product-list">
        <article v-for="product in productsState.products" :key="product.id" class="product-row">
          <img :src="product.image || placeholderImage" :alt="product.name" class="cover" />
          <div class="product-main">
            <p class="category">{{ product.category || "Uncategorized" }}</p>
            <h3>{{ product.name }}</h3>
            <p class="meta">{{ product.model }} · {{ product.serialNumber }}</p>
            <p class="meta">Distributor: {{ product.distributor || "-" }}</p>
          </div>

          <div class="stock-controls">
            <label>
              Stock
              <input v-model.number="stockDrafts[product.id]" type="number" min="0" />
            </label>
            <button class="secondary-btn" type="button" :disabled="savingStock[product.id]" @click="saveStock(product)">
              Save stock
            </button>
            <button class="danger-btn" type="button" @click="removeProduct(product)">
              Delete
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
defineOptions({ name: "AdminProductsView" });
import { onMounted, reactive, ref, watch } from "vue";
import { useCategoriesStore } from "../stores/categories";
import { useProductsStore } from "../stores/products";

const {
  state: productsState,
  fetchProducts,
  createProduct,
  updateStock,
  deleteProduct,
} = useProductsStore();
const {
  state: categoriesState,
  fetchCategories,
  createCategory,
  deleteCategory,
} = useCategoriesStore();

const placeholderImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Crect width='120' height='160' fill='%23f3f4f6'/%3E%3Ctext x='60' y='82' text-anchor='middle' font-family='Arial' font-size='12' fill='%236b7280'%3ENo image%3C/text%3E%3C/svg%3E";

const productForm = reactive({
  name: "",
  model: "",
  serialNumber: "",
  description: "",
  category: "",
  quantity: 0,
  warranty: "",
  distributor: "",
  author: "",
  image: "",
});

const categoryName = ref("");
const productError = ref("");
const categoryError = ref("");
const savingProduct = ref(false);
const savingCategory = ref(false);
const savingStock = reactive({});
const stockDrafts = reactive({});

function resetProductForm() {
  productForm.name = "";
  productForm.model = "";
  productForm.serialNumber = "";
  productForm.description = "";
  productForm.category = "";
  productForm.quantity = 0;
  productForm.warranty = "";
  productForm.distributor = "";
  productForm.author = "";
  productForm.image = "";
}

function syncStockDrafts() {
  for (const product of productsState.products) {
    if (stockDrafts[product.id] === undefined) {
      stockDrafts[product.id] = product.quantity ?? 0;
    }
  }
}

async function submitProduct() {
  savingProduct.value = true;
  productError.value = "";
  try {
    await createProduct({ ...productForm });
    resetProductForm();
    syncStockDrafts();
  } catch (e) {
    productError.value = e.response?.data?.message || "Failed to add product.";
  } finally {
    savingProduct.value = false;
  }
}

async function submitCategory() {
  savingCategory.value = true;
  categoryError.value = "";
  try {
    await createCategory(categoryName.value);
    categoryName.value = "";
  } catch (e) {
    categoryError.value = e.response?.data?.message || "Failed to add category.";
  } finally {
    savingCategory.value = false;
  }
}

async function saveStock(product) {
  savingStock[product.id] = true;
  try {
    await updateStock(product.id, Number(stockDrafts[product.id]));
  } catch (e) {
    alert(e.response?.data?.message || "Failed to update stock.");
  } finally {
    savingStock[product.id] = false;
  }
}

async function removeProduct(product) {
  if (!confirm(`Delete ${product.name}?`)) return;
  try {
    await deleteProduct(product.id);
  } catch (e) {
    alert(e.response?.data?.message || "Failed to delete product.");
  }
}

async function removeCategory(category) {
  if (!confirm(`Delete ${category.name}?`)) return;
  categoryError.value = "";
  try {
    await deleteCategory(category._id);
  } catch (e) {
    categoryError.value = e.response?.data?.message || "Failed to delete category.";
  }
}

onMounted(async () => {
  await Promise.all([fetchProducts(), fetchCategories()]);
  syncStockDrafts();
});

watch(() => productsState.products.length, syncStockDrafts);
</script>

<style scoped>
.admin-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 20px 64px;
  color: #0f172a;
}
.page-head { margin-bottom: 24px; }
h1 { margin: 0 0 8px; font-size: 1.85rem; }
.page-head p {
  margin: 0;
  color: #64748b;
  line-height: 1.5;
}
.panel {
  background: #fff;
  border: 1px solid #dbe5f1;
  border-radius: 8px;
  padding: 18px;
  margin-bottom: 16px;
}
.section-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
  margin-bottom: 14px;
}
h2 {
  margin: 0;
  font-size: 1.12rem;
}
.section-head span {
  color: #64748b;
  font-size: 0.86rem;
}
.product-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(150px, 1fr));
  gap: 10px;
}
label {
  display: grid;
  gap: 5px;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 800;
}
input, select, textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  padding: 9px 10px;
  color: #0f172a;
}
textarea { resize: vertical; }
.wide { grid-column: span 2; }
.primary-btn, .secondary-btn, .danger-btn {
  border: none;
  border-radius: 8px;
  padding: 9px 14px;
  font-weight: 800;
  cursor: pointer;
}
.primary-btn {
  background: #2563eb;
  color: #fff;
}
.secondary-btn {
  background: #e0ecff;
  color: #1d4ed8;
}
.danger-btn {
  background: #fee2e2;
  color: #991b1b;
}
button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.error {
  color: #991b1b;
  margin: 0;
  font-weight: 700;
}
.category-form {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) auto;
  gap: 8px;
  margin-bottom: 12px;
}
.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.category-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #f1f5f9;
  border: 1px solid #dbe5f1;
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 0.85rem;
  font-weight: 700;
}
.category-chip button {
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-weight: 900;
}
.state {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
}
.state.error { color: #991b1b; }
.product-list {
  display: grid;
  gap: 10px;
}
.product-row {
  display: grid;
  grid-template-columns: 58px minmax(220px, 1fr) auto;
  gap: 12px;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
}
.cover {
  width: 58px;
  height: 76px;
  object-fit: cover;
  border-radius: 6px;
  background: #f1f5f9;
}
.category {
  margin: 0 0 3px;
  color: #1d4ed8;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}
h3 { margin: 0 0 4px; font-size: 1rem; }
.meta {
  margin: 0;
  color: #64748b;
  font-size: 0.84rem;
}
.stock-controls {
  display: grid;
  grid-template-columns: 100px auto auto;
  gap: 8px;
  align-items: end;
}
@media (max-width: 900px) {
  .product-form { grid-template-columns: repeat(2, minmax(150px, 1fr)); }
  .product-row { grid-template-columns: 58px 1fr; }
  .stock-controls { grid-column: 1 / -1; }
}
@media (max-width: 560px) {
  .product-form, .category-form, .stock-controls { grid-template-columns: 1fr; }
  .wide { grid-column: span 1; }
}
</style>

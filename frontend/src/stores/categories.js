import { reactive } from "vue";
import api from "../utils/api.js";

const state = reactive({
  categories: [],
  loading: false,
  error: null,
});

async function fetchCategories() {
  state.loading = true;
  state.error = null;
  try {
    const { data } = await api.get("/categories");
    state.categories.splice(0, state.categories.length, ...data);
  } catch (err) {
    state.error = err.message;
  } finally {
    state.loading = false;
  }
}

async function createCategory(name) {
  const { data } = await api.post("/categories", { name });
  state.categories.push(data);
  state.categories.sort((a, b) => a.name.localeCompare(b.name));
  return data;
}

async function deleteCategory(id) {
  await api.delete(`/categories/${id}`);
  const index = state.categories.findIndex((category) => category._id === id);
  if (index !== -1) {
    state.categories.splice(index, 1);
  }
}

export function useCategoriesStore() {
  return {
    state,
    fetchCategories,
    createCategory,
    deleteCategory,
  };
}

import { reactive, computed } from "vue";
import api, { setToken, clearToken, getToken } from "../utils/api.js";

const STORAGE_SESSION = "bookworld_session";

const state = reactive({
  user: null,
});

function loadSession() {
  // Only restore session if there's also a JWT token (new system)
  if (!getToken()) {
    localStorage.removeItem(STORAGE_SESSION);
    return;
  }
  try {
    const raw = localStorage.getItem(STORAGE_SESSION);
    if (raw) state.user = JSON.parse(raw);
  } catch {
    state.user = null;
  }
}

function persistSession() {
  if (state.user) {
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(state.user));
  } else {
    localStorage.removeItem(STORAGE_SESSION);
  }
}

loadSession();

const isLoggedIn = computed(() => !!state.user);

async function register({ email, password, name }) {
  try {
    const { data } = await api.post("/auth/register", { name, email, password });
    setToken(data.token);
    state.user = data.user;
    persistSession();
    return { ok: true };
  } catch (err) {
    const msg = err.response?.data?.message || "Registration failed.";
    return { ok: false, error: msg };
  }
}

async function login({ email, password }) {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    state.user = data.user;
    persistSession();
    return { ok: true };
  } catch (err) {
    const msg = err.response?.data?.message || "Invalid email or password.";
    return { ok: false, error: msg };
  }
}

function logout() {
  clearToken();
  state.user = null;
  persistSession();
}

// Re-validate token on startup (silently ignore if expired)
async function rehydrate() {
  if (!getToken()) return;
  try {
    const { data } = await api.get("/auth/me");
    state.user = { id: data._id, name: data.name, email: data.email, role: data.role };
    persistSession();
  } catch {
    logout();
  }
}

rehydrate();

export function useAuthStore() {
  return {
    state,
    isLoggedIn,
    register,
    login,
    logout,
  };
}

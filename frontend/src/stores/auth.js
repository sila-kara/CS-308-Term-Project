import { reactive, computed } from "vue";
import axios from "axios";
import { isValidEmail } from "../utils/validation.js";

const STORAGE_SESSION = "bookworld_session";
const STORAGE_TOKEN = "bookworld_token";

const state = reactive({
  user: null,
  token: null,
});

function persistSession() {
  if (state.user) {
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(state.user));
  } else {
    localStorage.removeItem(STORAGE_SESSION);
  }

  if (state.token) {
    localStorage.setItem(STORAGE_TOKEN, state.token);
  } else {
    localStorage.removeItem(STORAGE_TOKEN);
  }
}

function loadSession() {
  try {
    const rawUser = localStorage.getItem(STORAGE_SESSION);
    const rawToken = localStorage.getItem(STORAGE_TOKEN);

    state.user = rawUser ? JSON.parse(rawUser) : null;
    state.token = rawToken || null;
  } catch {
    state.user = null;
    state.token = null;
  }
}

loadSession();

const isLoggedIn = computed(() => !!state.user && !!state.token);

async function register({ email, password, name }) {
  const e = String(email || "").trim().toLowerCase();
  const n = String(name || "").trim();

  if (!isValidEmail(e)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  if (!password || String(password).length < 4) {
    return { ok: false, error: "Password must be at least 4 characters." };
  }

  if (!n) {
    return { ok: false, error: "Name is required." };
  }

  try {
    const res = await axios.post("http://localhost:5050/api/auth/register", {
      name: n,
      email: e,
      password: String(password),
    });

    state.user = res.data.user;
    state.token = res.data.token;
    persistSession();

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err.response?.data?.message || "Registration failed.",
    };
  }
}

async function login({ email, password }) {
  const e = String(email || "").trim().toLowerCase();

  if (!isValidEmail(e)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  if (!password) {
    return { ok: false, error: "Password is required." };
  }

  try {
    const res = await axios.post("http://localhost:5050/api/auth/login", {
      email: e,
      password: String(password),
    });

    state.user = res.data.user;
    state.token = res.data.token;
    persistSession();

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err.response?.data?.message || "Invalid email or password.",
    };
  }
}

function logout() {
  state.user = null;
  state.token = null;
  persistSession();
}

export function useAuthStore() {
  return {
    state,
    isLoggedIn,
    register,
    login,
    logout,
  };
}
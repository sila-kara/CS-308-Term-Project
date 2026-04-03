import { reactive, computed } from "vue";
import { isValidEmail } from "../utils/validation.js";

const STORAGE_USERS = "bookworld_users";
const STORAGE_SESSION = "bookworld_session";

const state = reactive({
  user: null,
});

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function persistSession() {
  if (state.user) {
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(state.user));
  } else {
    localStorage.removeItem(STORAGE_SESSION);
  }
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION);
    if (raw) state.user = JSON.parse(raw);
  } catch {
    state.user = null;
  }
}

loadSession();

const isLoggedIn = computed(() => !!state.user);

function register({ email, password, name }) {
  const e = String(email || "").trim().toLowerCase();
  if (!isValidEmail(e)) return { ok: false, error: "Enter a valid email address." };
  if (!password || String(password).length < 4) {
    return { ok: false, error: "Password must be at least 4 characters." };
  }
  const users = readUsers();
  if (users.some((u) => u.email === e)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const user = {
    id: crypto.randomUUID(),
    email: e,
    name: String(name || "").trim() || e.split("@")[0],
    password: String(password),
  };
  users.push(user);
  writeUsers(users);
  state.user = { id: user.id, email: user.email, name: user.name };
  persistSession();
  return { ok: true };
}

function login({ email, password }) {
  const e = String(email || "").trim().toLowerCase();
  const users = readUsers();
  const match = users.find((u) => u.email === e && u.password === String(password));
  if (!match) {
    return { ok: false, error: "Invalid email or password." };
  }
  state.user = { id: match.id, email: match.email, name: match.name };
  persistSession();
  return { ok: true };
}

function logout() {
  state.user = null;
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

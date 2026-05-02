<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Set new password</h1>

      <div v-if="done" class="success-msg">
        Password updated! <router-link to="/login">Sign in</router-link>
      </div>

      <div v-else-if="!token" class="error-msg">
        Invalid reset link. Please request a new one.
      </div>

      <form v-else @submit.prevent="submit">
        <label>
          New password
          <input v-model="password" type="password" required placeholder="At least 6 characters" />
        </label>
        <label>
          Confirm password
          <input v-model="confirm" type="password" required placeholder="Repeat password" />
        </label>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="btn" :disabled="loading">
          {{ loading ? "Saving..." : "Update password" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import api from "../utils/api.js";

const route = useRoute();
const token = route.query.token || "";

const password = ref("");
const confirm = ref("");
const error = ref("");
const done = ref(false);
const loading = ref(false);

async function submit() {
  error.value = "";
  if (password.value !== confirm.value) {
    error.value = "Passwords do not match.";
    return;
  }
  loading.value = true;
  try {
    await api.post("/auth/reset-password", { token, password: password.value });
    done.value = true;
  } catch (err) {
    error.value = err.response?.data?.message || "Something went wrong. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border: 1px solid #dbe5f1;
  border-radius: 14px;
  padding: 36px 32px;
}

h1 {
  margin: 0 0 24px;
  font-size: 1.5rem;
}

form {
  display: grid;
  gap: 14px;
}

label {
  display: grid;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
}

input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cfdbea;
  font: inherit;
  font-size: 0.92rem;
}

.btn {
  padding: 11px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(145deg, #1d4ed8, #2563eb);
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
}

.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.error { color: #b91c1c; font-size: 0.85rem; margin: 0; }

.success-msg {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  padding: 14px;
  font-size: 0.9rem;
  color: #065f46;
}

.success-msg a { color: #065f46; font-weight: 700; }

.error-msg {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 14px;
  font-size: 0.9rem;
  color: #b91c1c;
}
</style>

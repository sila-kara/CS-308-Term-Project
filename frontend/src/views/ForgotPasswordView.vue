<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Forgot password</h1>
      <p class="sub">Enter your email and we'll send you a reset link.</p>

      <div v-if="sent" class="success-msg">
        Email sent! Check your inbox and follow the link to reset your password.
      </div>

      <form v-else @submit.prevent="submit">
        <label>
          Email address
          <input v-model="email" type="email" required placeholder="you@example.com" />
        </label>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="btn" :disabled="loading">
          {{ loading ? "Sending..." : "Send reset link" }}
        </button>
      </form>

      <p class="back"><router-link to="/login">← Back to sign in</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "../utils/api.js";

const email = ref("");
const error = ref("");
const sent = ref(false);
const loading = ref(false);

async function submit() {
  error.value = "";
  loading.value = true;
  try {
    await api.post("/auth/forgot-password", { email: email.value });
    sent.value = true;
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
  margin: 0 0 6px;
  font-size: 1.5rem;
}

.sub {
  margin: 0 0 24px;
  color: #64748b;
  font-size: 0.9rem;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #b91c1c;
  font-size: 0.85rem;
  margin: 0;
}

.success-msg {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  padding: 14px;
  font-size: 0.9rem;
  color: #065f46;
}

.back {
  margin-top: 20px;
  text-align: center;
  font-size: 0.85rem;
}

.back a {
  color: #2563eb;
  text-decoration: none;
}
</style>

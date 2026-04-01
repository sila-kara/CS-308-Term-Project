<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Sign in</h1>
      <p class="lead">Access your orders and checkout securely.</p>

      <form class="form" @submit.prevent="onSubmit">
        <label>
          <span>Email</span>
          <input v-model="email" type="email" autocomplete="username" required />
        </label>
        <label>
          <span>Password</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </label>
        <p v-if="error" class="error">{{ error }}</p>
        <button class="btn primary" type="submit">Sign in</button>
      </form>

      <p class="footer">
        New to BookWorld?
        <router-link to="/register">Create an account</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const route = useRoute();
const { login } = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");

function onSubmit() {
  error.value = "";
  const res = login({
    email: email.value,
    password: password.value,
  });
  if (!res.ok) {
    error.value = res.error;
    return;
  }
  const redirect = route.query.redirect;
  router.push(typeof redirect === "string" ? redirect : "/");
}
</script>

<style scoped>
.auth-page {
  max-width: 460px;
  margin: 0 auto;
  padding: 32px 20px 48px;
}

.auth-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #e2e8f0);
  border-radius: 18px;
  padding: 28px;
  box-shadow: var(--shadow-sm, 0 8px 20px rgba(15, 23, 42, 0.06));
}

h1 {
  margin: 0 0 8px;
  font-size: 1.6rem;
  color: #0f172a;
}

.lead {
  margin: 0 0 22px;
  color: #64748b;
  font-size: 0.95rem;
}

.form {
  display: grid;
  gap: 14px;
}

label {
  display: grid;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

input {
  border: 1px solid #cfdbea;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 1rem;
}

.error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.88rem;
}

.btn {
  margin-top: 4px;
  border-radius: 12px;
  padding: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn.primary {
  background: linear-gradient(145deg, #1d4ed8, #2563eb);
  color: white;
}

.footer {
  margin: 18px 0 0;
  font-size: 0.9rem;
  color: #64748b;
}

.footer a {
  color: #2563eb;
  font-weight: 600;
}
</style>

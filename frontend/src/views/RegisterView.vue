<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Create account</h1>
      <p class="lead">Save carts securely and track deliveries.</p>

      <form class="form" @submit.prevent="onSubmit">
        <label>
          <span>Full name</span>
          <input v-model="form.name" type="text" autocomplete="name" required />
        </label>
        <label>
          <span>Email</span>
          <input v-model="form.email" type="email" autocomplete="email" required />
        </label>
        <label>
          <span>Password</span>
          <input
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            required
          />
        </label>
        <p v-if="error" class="error">{{ error }}</p>
        <button class="btn primary" type="submit" :disabled="loading">
          {{ loading ? "Registering..." : "Register" }}
        </button>
      </form>

      <p class="footer">
        Already have an account?
        <router-link to="/login">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const form = ref({
  name: "",
  email: "",
  password: "",
});
const error = ref("");
const loading = ref(false);

async function onSubmit() {
  error.value = "";
  const name = form.value.name.trim();
  const email = form.value.email.trim();
  const password = form.value.password.trim();

  if (!name || !email || !password) {
    error.value = "Please fill in name, email, and password.";
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    error.value = "Please enter a valid email address.";
    return;
  }

  if (password.length < 6) {
    error.value = "Password must be at least 6 characters.";
    return;
  }

  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 700));
    router.push("/login");
  } finally {
    loading.value = false;
  }
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
  border-radius: 10px;
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
  border-radius: 8px;
  padding: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn.primary {
  background: linear-gradient(145deg, #1d4ed8, #2563eb);
  color: white;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
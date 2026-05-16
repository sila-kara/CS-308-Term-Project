<template>
  <nav class="admin-nav">
    <div class="nav-inner">
      <router-link to="/admin/orders" class="brand">
        <span class="bw">BW</span> Product Manager Panel
      </router-link>
      <div class="links">
        <router-link to="/admin/orders" class="nav-link">Delivery</router-link>
        <router-link to="/admin/products" class="nav-link">Products & Stock</router-link>
        <router-link to="/admin/reviews" class="nav-link">Review Moderation</router-link>
      </div>
      <div class="right">
        <span class="role-badge">Product Manager</span>
        <button class="logout-btn" @click="handleLogout">Sign out</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const { logout } = useAuthStore();

function handleLogout() {
  logout();
  router.push("/login");
}
</script>

<style scoped>
.admin-nav {
  background: #0f172a;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}
.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 32px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  color: #fff;
}
.bw {
  background: #2563eb;
  border-radius: 6px;
  padding: 2px 7px;
  font-size: 0.85rem;
}
.links {
  display: flex;
  gap: 4px;
  flex: 1;
}
.nav-link {
  color: #94a3b8;
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.15s;
}
.nav-link:hover { background: #1e293b; color: #fff; }
.nav-link.router-link-active { background: #1e293b; color: #fff; }
.right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}
.role-badge {
  background: #1e3a8a;
  color: #93c5fd;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
}
.logout-btn {
  background: none;
  border: 1px solid #334155;
  color: #94a3b8;
  padding: 5px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
.logout-btn:hover { border-color: #64748b; color: #fff; }
</style>

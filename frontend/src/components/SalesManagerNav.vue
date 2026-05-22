<template>
  <nav class="admin-nav">
    <div class="nav-inner">
      <router-link to="/sales" class="brand">
        <span class="bw">BW</span> Sales Manager Panel
      </router-link>
      <div class="links">
        <router-link to="/sales" class="nav-link">Dashboard</router-link>
        <router-link to="/sales/pricing" class="nav-link">Pricing</router-link>
        <router-link to="/sales/invoices" class="nav-link">Invoices</router-link>
        <router-link to="/sales/refunds" class="nav-link">Refund Requests</router-link>
      </div>
      <div class="right">
        <span class="role-badge">Sales Manager</span>
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
  background: #111827;
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
  background: #059669;
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
  color: #9ca3af;
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.15s;
}
.nav-link:hover { background: #1f2937; color: #fff; }
.nav-link.router-link-active { background: #1f2937; color: #fff; }
.right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}
.role-badge {
  background: #064e3b;
  color: #a7f3d0;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
}
.logout-btn {
  background: none;
  border: 1px solid #374151;
  color: #9ca3af;
  padding: 5px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
.logout-btn:hover { border-color: #6b7280; color: #fff; }
</style>

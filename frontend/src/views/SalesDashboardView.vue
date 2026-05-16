<template>
  <div class="sales-page">
    <header class="page-head">
      <p class="eyebrow">Sales Manager</p>
      <h1>Sales Manager Panel</h1>
      <p>Manage refund decisions now. Pricing, discounts, invoices, and revenue reports will be added as separate increments.</p>
    </header>

    <section class="action-grid">
      <router-link class="action-card" to="/sales/refunds">
        <span class="label">Refund Requests</span>
        <strong>Review customer return requests</strong>
        <span class="hint">Approve or reject refund requests submitted within the return window.</span>
      </router-link>
      <router-link class="action-card" to="/sales/pricing">
        <span class="label">Pricing & Discounts</span>
        <strong>Set product prices and discounts</strong>
        <span class="hint">Update list price, cost, discount rate, and campaign dates.</span>
      </router-link>
      <div class="action-card muted">
        <span class="label">Invoices & Reports</span>
        <strong>Coming later</strong>
        <span class="hint">List invoices by date and view revenue/profit charts.</span>
      </div>
    </section>
  </div>
</template>

<script setup>
defineOptions({ name: "SalesDashboardView" });
</script>

<style scoped>
.sales-page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 32px 20px 64px;
  color: #111827;
}
.page-head {
  margin-bottom: 24px;
}
.eyebrow {
  margin: 0 0 6px;
  color: #047857;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
h1 {
  margin: 0 0 8px;
  font-size: 1.85rem;
}
.page-head p:last-child {
  margin: 0;
  color: #4b5563;
  max-width: 680px;
  line-height: 1.55;
}
.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}
.action-card {
  display: grid;
  gap: 8px;
  min-height: 150px;
  padding: 18px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  text-decoration: none;
  color: inherit;
}
.action-card:not(.muted):hover {
  border-color: #10b981;
  box-shadow: 0 12px 28px rgba(17, 24, 39, 0.08);
}
.label {
  color: #047857;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}
strong {
  font-size: 1rem;
}
.hint {
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.45;
}
.muted {
  background: #f9fafb;
}
</style>

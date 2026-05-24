<template>
  <div class="sales-page">
    <header class="page-head">
      <p class="eyebrow">Sales Manager</p>
      <h1>Revenue Analytics</h1>
      <p>Calculate revenue and profit/loss for a selected date range.</p>
    </header>

    <section class="toolbar">
      <label>
        Start
        <input v-model="filters.startDate" type="date" />
      </label>
      <label>
        End
        <input v-model="filters.endDate" type="date" />
      </label>
      <button class="primary-btn" type="button" :disabled="loading" @click="loadAnalytics">
        {{ loading ? "Loading..." : "Apply" }}
      </button>
      <button class="secondary-btn" type="button" @click="clearFilters">Clear</button>
    </section>

    <p v-if="error" class="error">{{ error }}</p>

    <section class="summary-grid">
      <article class="metric-card">
        <span>Revenue</span>
        <strong>{{ money(summary.revenue) }}</strong>
      </article>
      <article class="metric-card">
        <span>Cost</span>
        <strong>{{ money(summary.cost) }}</strong>
      </article>
      <article class="metric-card" :class="{ loss: summary.profit < 0 }">
        <span>{{ summary.profit < 0 ? "Loss" : "Profit" }}</span>
        <strong>{{ money(Math.abs(summary.profit)) }}</strong>
      </article>
      <article class="metric-card">
        <span>Orders / Units</span>
        <strong>{{ summary.orderCount }} / {{ summary.unitsSold }}</strong>
      </article>
    </section>

    <section class="chart-panel">
      <div class="chart-head">
        <div>
          <h2>Revenue vs Profit/Loss</h2>
          <p>{{ rangeLabel }}</p>
        </div>
        <span>{{ summary.points.length }} data points</span>
      </div>

      <div v-if="!summary.points.length && !loading" class="empty-state">
        No sales data found for this range.
      </div>
      <div v-show="summary.points.length" class="chart-wrap">
        <canvas ref="chartCanvas" aria-label="Revenue and profit/loss chart"></canvas>
      </div>
    </section>
  </div>
</template>

<script setup>
defineOptions({ name: "SalesAnalyticsView" });
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  LineController,
  Tooltip,
  Legend,
} from "chart.js";
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import api from "../utils/api";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  LineController,
  Tooltip,
  Legend
);

const loading = ref(false);
const error = ref("");
const chartCanvas = ref(null);
let chart = null;

const summary = reactive({
  revenue: 0,
  cost: 0,
  profit: 0,
  orderCount: 0,
  unitsSold: 0,
  points: [],
});

const filters = reactive(defaultFilters());

const rangeLabel = computed(() => {
  if (filters.startDate && filters.endDate) return `${filters.startDate} to ${filters.endDate}`;
  if (filters.startDate) return `From ${filters.startDate}`;
  if (filters.endDate) return `Until ${filters.endDate}`;
  return "All dates";
});

function defaultFilters() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    startDate: toInputDate(start),
    endDate: toInputDate(now),
  };
}

function toInputDate(date) {
  return date.toISOString().slice(0, 10);
}

function money(value) {
  return `${Number(value || 0).toFixed(2)} TL`;
}

function queryParams() {
  const params = {};
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  return params;
}

function setSummary(data) {
  summary.revenue = Number(data.revenue || 0);
  summary.cost = Number(data.cost || 0);
  summary.profit = Number(data.profit || 0);
  summary.orderCount = Number(data.orderCount || 0);
  summary.unitsSold = Number(data.unitsSold || 0);
  summary.points = Array.isArray(data.points) ? data.points : [];
}

function renderChart() {
  if (!chartCanvas.value || !summary.points.length) {
    chart?.destroy();
    chart = null;
    return;
  }

  const labels = summary.points.map((point) => point.date);
  const revenue = summary.points.map((point) => Number(point.revenue || 0));
  const profit = summary.points.map((point) => Number(point.profit || 0));

  chart?.destroy();
  chart = new Chart(chartCanvas.value, {
    data: {
      labels,
      datasets: [
        {
          type: "bar",
          label: "Revenue",
          data: revenue,
          backgroundColor: "rgba(5, 150, 105, 0.28)",
          borderColor: "#059669",
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          type: "line",
          label: "Profit/Loss",
          data: profit,
          borderColor: "#2563eb",
          backgroundColor: "#2563eb",
          pointRadius: 4,
          pointHoverRadius: 5,
          tension: 0.28,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.dataset.label}: ${money(context.parsed.y)}`;
            },
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback(value) {
              return `${value} TL`;
            },
          },
        },
      },
    },
  });
}

async function loadAnalytics() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/orders/sales/analytics", { params: queryParams() });
    setSummary(data);
    await nextTick();
    renderChart();
  } catch (e) {
    error.value = e.response?.data?.message || "Failed to load sales analytics.";
  } finally {
    loading.value = false;
  }
}

function clearFilters() {
  filters.startDate = "";
  filters.endDate = "";
  loadAnalytics();
}

onMounted(loadAnalytics);
onBeforeUnmount(() => chart?.destroy());
</script>

<style scoped>
.sales-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 20px 64px;
  color: #111827;
}
.page-head { margin-bottom: 24px; }
.eyebrow {
  margin: 0 0 6px;
  color: #047857;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
h1 { margin: 0 0 8px; font-size: 1.85rem; }
.page-head p:last-child {
  margin: 0;
  color: #4b5563;
  line-height: 1.5;
}
.toolbar {
  display: grid;
  grid-template-columns: repeat(2, minmax(160px, 1fr)) auto auto;
  gap: 10px;
  align-items: end;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 14px;
}
label {
  display: grid;
  gap: 5px;
  color: #4b5563;
  font-size: 0.78rem;
  font-weight: 800;
}
input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  padding: 9px 10px;
  color: #111827;
}
.primary-btn, .secondary-btn {
  border: none;
  border-radius: 8px;
  padding: 9px 14px;
  font-weight: 800;
  cursor: pointer;
}
.primary-btn { background: #059669; color: #fff; }
.secondary-btn { background: #e5f4ef; color: #047857; }
button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.error {
  margin: 0 0 12px;
  color: #991b1b;
  font-weight: 800;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
.metric-card {
  display: grid;
  gap: 8px;
  padding: 16px;
  border: 1px solid #d1fae5;
  border-radius: 8px;
  background: #ecfdf5;
}
.metric-card span {
  color: #047857;
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
}
.metric-card strong {
  font-size: 1.22rem;
}
.metric-card.loss {
  border-color: #fecaca;
  background: #fef2f2;
}
.metric-card.loss span {
  color: #b91c1c;
}
.chart-panel {
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 16px;
}
.chart-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}
.chart-head h2 {
  margin: 0 0 4px;
  font-size: 1.05rem;
}
.chart-head p,
.chart-head span {
  margin: 0;
  color: #6b7280;
  font-size: 0.86rem;
}
.chart-wrap {
  position: relative;
  height: 360px;
}
.empty-state {
  display: grid;
  place-items: center;
  min-height: 260px;
  color: #6b7280;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
}
@media (max-width: 820px) {
  .toolbar,
  .summary-grid {
    grid-template-columns: 1fr;
  }
  .chart-head {
    display: grid;
  }
  .chart-wrap {
    height: 300px;
  }
}
</style>

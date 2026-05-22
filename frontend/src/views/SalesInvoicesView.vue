<template>
  <div class="sales-page">
    <header class="page-head">
      <p class="eyebrow">Sales Manager</p>
      <h1>Invoices</h1>
      <p>Filter invoices by date, inspect order details, and view or save invoice PDFs.</p>
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
      <button class="primary-btn" type="button" :disabled="loading" @click="loadInvoices">
        {{ loading ? "Loading..." : "Apply" }}
      </button>
      <button class="secondary-btn" type="button" @click="clearFilters">Clear</button>
    </section>

    <p v-if="error" class="error">{{ error }}</p>

    <section class="summary">
      <span>{{ invoices.length }} invoices</span>
      <strong>{{ totalAmount.toFixed(2) }} TL</strong>
    </section>

    <section class="invoice-list">
      <article v-for="invoice in invoices" :key="invoice._id" class="invoice-card">
        <div class="invoice-main">
          <span class="invoice-no">{{ invoice.invoiceNumber }}</span>
          <strong>{{ invoice.userId?.name || "Customer" }}</strong>
          <small>{{ invoice.userId?.email || "" }}</small>
          <small>{{ formatDate(invoice.createdAt) }} · {{ invoice.status }}</small>
        </div>

        <div class="invoice-items">
          <span v-for="item in invoice.items" :key="item.productId || item.name">
            {{ item.name }} x{{ item.quantity }} - {{ item.price.toFixed(2) }} TL
          </span>
        </div>

        <div class="invoice-total">
          <span>{{ invoice.total.toFixed(2) }} TL</span>
          <button class="secondary-btn" type="button" @click="viewPdf(invoice)">View PDF</button>
          <button class="secondary-btn" type="button" @click="downloadPdf(invoice)">Download</button>
        </div>
      </article>
    </section>

    <div v-if="selectedInvoice" class="pdf-modal" role="dialog" aria-modal="true">
      <div class="pdf-panel">
        <header>
          <div>
            <strong>{{ selectedInvoice.invoiceNumber }}</strong>
            <span>{{ selectedInvoice.userId?.name || "Customer" }}</span>
          </div>
          <div class="pdf-actions">
            <button class="secondary-btn" type="button" @click="printPdf">Print</button>
            <button class="secondary-btn" type="button" @click="downloadPdf(selectedInvoice)">Download</button>
            <button class="close-btn" type="button" @click="closePdf">Close</button>
          </div>
        </header>
        <iframe v-if="pdfUrl" ref="pdfFrame" :src="pdfUrl" title="Invoice PDF" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "SalesInvoicesView" });
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import api from "../utils/api";

const invoices = ref([]);
const loading = ref(false);
const error = ref("");
const selectedInvoice = ref(null);
const pdfUrl = ref("");
const pdfFrame = ref(null);
const filters = reactive({
  startDate: "",
  endDate: "",
});

const totalAmount = computed(() =>
  invoices.value.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0)
);

function queryParams() {
  const params = {};
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  return params;
}

async function loadInvoices() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/orders/sales/invoices", { params: queryParams() });
    invoices.value = data;
  } catch (e) {
    error.value = e.response?.data?.message || "Failed to load invoices.";
  } finally {
    loading.value = false;
  }
}

function clearFilters() {
  filters.startDate = "";
  filters.endDate = "";
  loadInvoices();
}

async function fetchPdf(invoice, download = false) {
  const { data } = await api.get(`/orders/sales/invoices/${invoice._id}/pdf`, {
    params: download ? { download: "true" } : {},
    responseType: "blob",
  });
  return data;
}

async function viewPdf(invoice) {
  selectedInvoice.value = invoice;
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
  try {
    const blob = await fetchPdf(invoice);
    pdfUrl.value = URL.createObjectURL(blob);
  } catch (e) {
    error.value = e.response?.data?.message || "Failed to load invoice PDF.";
    selectedInvoice.value = null;
  }
}

async function downloadPdf(invoice) {
  try {
    const blob = await fetchPdf(invoice, true);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.invoiceNumber || "invoice"}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    error.value = e.response?.data?.message || "Failed to download invoice PDF.";
  }
}

function printPdf() {
  pdfFrame.value?.contentWindow?.focus();
  pdfFrame.value?.contentWindow?.print();
}

function closePdf() {
  selectedInvoice.value = null;
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
  pdfUrl.value = "";
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

onMounted(loadInvoices);
onBeforeUnmount(closePdf);
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
  margin-bottom: 12px;
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
.primary-btn, .secondary-btn, .close-btn {
  border: none;
  border-radius: 8px;
  padding: 9px 14px;
  font-weight: 800;
  cursor: pointer;
}
.primary-btn { background: #059669; color: #fff; }
.secondary-btn { background: #e5f4ef; color: #047857; }
.close-btn { background: #fee2e2; color: #991b1b; }
button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.error {
  margin: 0 0 12px;
  color: #991b1b;
  font-weight: 800;
}
.summary {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  margin-bottom: 12px;
  border: 1px solid #d1fae5;
  border-radius: 8px;
  background: #ecfdf5;
  color: #065f46;
}
.invoice-list {
  display: grid;
  gap: 10px;
}
.invoice-card {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(260px, 1.5fr) auto;
  gap: 14px;
  align-items: start;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 14px;
}
.invoice-main, .invoice-items, .invoice-total {
  display: grid;
  gap: 5px;
}
.invoice-no {
  color: #047857;
  font-weight: 900;
}
.invoice-main small, .invoice-items span {
  color: #6b7280;
  font-size: 0.84rem;
}
.invoice-total {
  justify-items: end;
}
.invoice-total span {
  font-size: 1rem;
  font-weight: 900;
}
.pdf-modal {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(17, 24, 39, 0.62);
  padding: 28px;
}
.pdf-panel {
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}
.pdf-panel header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #e5e7eb;
}
.pdf-panel header div:first-child {
  display: grid;
  gap: 2px;
}
.pdf-panel header span {
  color: #6b7280;
  font-size: 0.84rem;
}
.pdf-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
@media (max-width: 820px) {
  .toolbar, .invoice-card { grid-template-columns: 1fr; }
  .invoice-total { justify-items: stretch; }
  .pdf-modal { padding: 12px; }
  .pdf-panel header { align-items: flex-start; flex-direction: column; }
}
</style>

<template>
  <div class="checkout">
    <h1>Checkout</h1>

    <div v-if="step === 'success'" class="success">
      <div class="success-card">
        <h2>Payment successful</h2>
        <p>Thank you. Your order is confirmed.</p>
        <p class="email-note">A confirmation email with your invoice has been sent to your registered email address.</p>
      </div>

      <div class="invoice" v-if="lastOrder">
        <header>
          <div>
            <p class="label">Invoice</p>
            <h3>{{ lastOrder.invoiceNumber }}</h3>
          </div>
          <div class="right">
            <p>{{ formatDate(lastOrder.createdAt) }}</p>
            <p>Order {{ lastOrder._id ?? lastOrder.id }}</p>
          </div>
        </header>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in lastOrder.items" :key="row.id + row.name">
              <td>{{ row.name }}</td>
              <td>{{ row.quantity }}</td>
              <td>{{ (row.price * row.quantity).toFixed(2) }} TL</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <div class="row">
            <span>Subtotal</span>
            <span>{{ lastOrder.subtotal.toFixed(2) }} TL</span>
          </div>
          <div class="row">
            <span>Shipping</span>
            <span>{{ (lastOrder.shipping ?? 0) === 0 ? 'Free' : (lastOrder.shipping ?? 0).toFixed(2) + ' TL' }}</span>
          </div>
          <div class="row">
            <span>Tax</span>
            <span>{{ lastOrder.tax.toFixed(2) }} TL</span>
          </div>
          <div class="row strong">
            <span>Total paid</span>
            <span>{{ lastOrder.total.toFixed(2) }} TL</span>
          </div>
          <p class="pay-meta">
            Paid with {{ lastOrder.paymentMethod }} ending
            {{ lastOrder.cardLast4 }}
          </p>
          <p v-if="lastOrder.deliveryAddress" class="pay-meta">
            Delivery: {{ lastOrder.deliveryAddress }}
          </p>
        </div>

        <div class="actions">
          <router-link class="btn secondary" :to="`/orders/${lastOrder._id ?? lastOrder.id}`">
            Track shipment
          </router-link>
          <router-link class="btn primary" to="/">Continue shopping</router-link>
        </div>
      </div>
    </div>

    <div v-else class="checkout-layout">
      <!-- Left column -->
      <div class="left-col">
        <section class="panel">
          <h2>Order summary</h2>
          <div v-if="items.length === 0" class="empty">
            <p>Your cart is empty.</p>
            <router-link to="/">Browse books</router-link>
          </div>
          <ul v-else class="mini-lines">
            <li v-for="item in items" :key="item.id">
              <span>{{ item.name }}</span>
              <span>×{{ item.quantity }}</span>
              <span>{{ (item.price * item.quantity).toFixed(2) }} TL</span>
            </li>
          </ul>
          <div class="totals-box">
            <div class="row">
              <span>Subtotal</span>
              <span>{{ subtotal.toFixed(2) }} TL</span>
            </div>
            <div class="row">
              <span>Shipping</span>
              <span>{{ shipping === 0 ? 'Free' : shipping.toFixed(2) + ' TL' }}</span>
            </div>
            <div class="row">
              <span>Tax (10%)</span>
              <span>{{ tax.toFixed(2) }} TL</span>
            </div>
            <div class="row strong">
              <span>Total</span>
              <span>{{ total.toFixed(2) }} TL</span>
            </div>
          </div>
        </section>

        <section class="panel">
          <h2>Delivery address</h2>
          <div class="addr-form">
            <label v-if="savedAddress" class="saved-addr-toggle">
              <input
                type="checkbox"
                v-model="useSavedAddress"
                @change="onUseSavedToggle"
              />
              Use my saved address
            </label>
            <p v-if="savedAddress && useSavedAddress" class="saved-addr-preview">{{ savedAddress }}</p>
            <label v-if="!useSavedAddress || !savedAddress">
              Full address
              <textarea
                v-model="deliveryAddress"
                rows="3"
                placeholder="Street no, neighbourhood, city, postal code"
              />
            </label>
          </div>
        </section>
      </div>

      <!-- Right column: payment -->
      <section class="panel pay right-col">
        <h2>Payment</h2>
        <p class="muted">For coursework only. No real card data is transmitted.</p>
        <form @submit.prevent="submitPayment">
          <label>
            Cardholder name
            <input
              v-model="cardName"
              required
              placeholder="Name on card"
              @input="cardName = cardName.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '')"
            />
          </label>
          <label>
            Card number
            <input
              :value="cardNumber"
              required
              maxlength="19"
              inputmode="numeric"
              placeholder="1234 5678 9012 3456"
              @input="onCardNumberInput"
            />
          </label>
          <div class="two">
            <label>
              Expiry
              <input
                :value="cardExpiry"
                required
                maxlength="5"
                inputmode="numeric"
                placeholder="MM/YY"
                @input="onExpiryInput"
              />
            </label>
            <label>
              CVC
              <input
                :value="cardCvc"
                required
                maxlength="4"
                inputmode="numeric"
                placeholder="123"
                @input="onCvcInput"
              />
            </label>
          </div>
          <p v-if="payError" class="error">{{ payError }}</p>
          <button class="btn primary full" type="submit" :disabled="items.length === 0">
            Pay {{ total.toFixed(2) }} TL
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useCartStore } from "../stores/cart";
import { useOrdersStore } from "../stores/orders";
import { computeCartTotal } from "../utils/cartMath";
import api from "../utils/api.js";

const router = useRouter();
const { state: authState } = useAuthStore();
const { state: cartState, clearCart } = useCartStore();
const { createOrder } = useOrdersStore();

const step = ref("pay");
const lastOrder = ref(null);
const payError = ref("");

const cardName = ref("");
const cardNumber = ref("");
const cardExpiry = ref("");
const cardCvc = ref("");
const deliveryAddress = ref("");
const savedAddress = ref("");
const useSavedAddress = ref(false);

onMounted(async () => {
  try {
    const { data } = await api.get("/auth/me");
    if (data.address) {
      savedAddress.value = data.address;
      useSavedAddress.value = true;
      deliveryAddress.value = data.address;
    }
  } catch {}
});

function onUseSavedToggle() {
  if (useSavedAddress.value) {
    deliveryAddress.value = savedAddress.value;
  } else {
    deliveryAddress.value = "";
  }
}

const SHIPPING_FEE = 29.99;
const FREE_SHIPPING_THRESHOLD = 250;

const items = computed(() => cartState.items);
const subtotal = computed(() => computeCartTotal(items.value));
const shipping = computed(() => subtotal.value >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE);
const tax = computed(() => Math.round(subtotal.value * 0.1 * 100) / 100);
const total = computed(() => subtotal.value + tax.value + shipping.value);

// Card input formatters
function onCardNumberInput(e) {
  const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
  cardNumber.value = digits.replace(/(.{4})/g, "$1 ").trim();
  e.target.value = cardNumber.value;
}

function onExpiryInput(e) {
  let digits = e.target.value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) digits = digits.slice(0, 2) + "/" + digits.slice(2);
  cardExpiry.value = digits;
  e.target.value = cardExpiry.value;
}

function onCvcInput(e) {
  const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
  cardCvc.value = digits;
  e.target.value = cardCvc.value;
}

function validateCard() {
  const digits = cardNumber.value.replace(/\s/g, "");
  if (digits.length !== 16) return "Card number must be 16 digits.";
  const [mm, yy] = cardExpiry.value.split("/");
  if (!mm || !yy || mm.length !== 2 || yy.length !== 2) return "Expiry must be MM/YY.";
  const month = Number(mm);
  if (month < 1 || month > 12) return "Invalid expiry month.";
  const now = new Date();
  const expYear = 2000 + Number(yy);
  const expMonth = month;
  if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1))
    return "Card has expired.";
  if (cardCvc.value.length < 3) return "CVC must be 3–4 digits.";
  return null;
}

function last4(num) {
  const digits = String(num || "").replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return digits.slice(-4);
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

async function submitPayment() {
  payError.value = "";
  if (!authState.user) {
    router.push({ path: "/login", query: { redirect: "/checkout" } });
    return;
  }
  if (items.value.length === 0) {
    payError.value = "Cart is empty.";
    return;
  }
  const cardError = validateCard();
  if (cardError) {
    payError.value = cardError;
    return;
  }
  try {
    const order = await createOrder({
      items: items.value,
      subtotal: subtotal.value,
      shipping: shipping.value,
      tax: tax.value,
      total: total.value,
      paymentMethod: "Mock Visa",
      cardLast4: last4(cardNumber.value),
      deliveryAddress: deliveryAddress.value,
    });
    lastOrder.value = order;
    clearCart();
    step.value = "success";
  } catch (err) {
    payError.value = err.response?.data?.message || "Could not place order. Please try again.";
  }
}
</script>

<style scoped>
.checkout {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

h1 {
  margin: 0 0 18px;
  font-size: 1.6rem;
  color: #0f172a;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}

.left-col {
  display: grid;
  gap: 16px;
}

.right-col {
  position: sticky;
  top: 90px;
}

.panel {
  background: #fff;
  border: 1px solid #dbe5f1;
  border-radius: 10px;
  padding: 16px;
}

.panel h2 {
  margin: 0 0 10px;
  font-size: 1.1rem;
}

.muted {
  margin: 0 0 12px;
  color: #64748b;
  font-size: 0.85rem;
}

.mini-lines {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.mini-lines li {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  font-size: 0.9rem;
  border-bottom: 1px solid #eef2f7;
  padding-bottom: 8px;
}

form {
  display: grid;
  gap: 10px;
}

label {
  display: grid;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
}

input,
textarea {
  padding: 10px 11px;
  border-radius: 10px;
  border: 1px solid #cfdbea;
  font: inherit;
  resize: vertical;
}

.two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.error {
  color: #b91c1c;
  font-size: 0.88rem;
  margin: 0;
}

.totals-box {
  margin-top: 14px;
  border-top: 1px solid #e2e8f0;
  padding-top: 10px;
}

.row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: 6px;
}

.row.strong {
  font-weight: 800;
  color: #0f172a;
}

.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}

.btn.full {
  width: 100%;
}

.btn.primary {
  background: linear-gradient(145deg, #1d4ed8, #2563eb);
  color: white;
}

.pay .btn.primary {
  margin-top: 6px;
}

.success {
  display: grid;
  gap: 16px;
}

.success-card {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  padding: 16px;
}

.email-note {
  margin: 8px 0 0;
  font-size: 0.85rem;
  color: #065f46;
}

.invoice {
  background: #fff;
  border: 1px solid #dbe5f1;
  border-radius: 10px;
  padding: 18px;
}

.invoice header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.label {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.06em;
}

.invoice h3 {
  margin: 2px 0 0;
}

.right {
  text-align: right;
  font-size: 0.85rem;
  color: #475569;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th,
td {
  text-align: left;
  padding: 8px 6px;
  border-bottom: 1px solid #eef2f7;
}

.totals {
  margin-top: 12px;
}

.pay-meta {
  margin: 8px 0 0;
  font-size: 0.82rem;
  color: #64748b;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.btn.secondary {
  background: #fff;
  border: 1px solid #cbd5e1;
  color: #0f172a;
}

.empty {
  color: #64748b;
}

.addr-form {
  display: grid;
  gap: 10px;
}

.saved-addr-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e40af;
  cursor: pointer;
}

.saved-addr-preview {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.9rem;
  color: #1e3a8a;
  margin: 0;
  white-space: pre-wrap;
}

@media (max-width: 880px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .right-col {
    position: static;
  }
}
</style>

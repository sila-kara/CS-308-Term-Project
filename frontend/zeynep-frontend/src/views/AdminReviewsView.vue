<template>
  <div class="admin">
    <h1>Review moderation</h1>
    <p class="lead">
      Product manager console (demo). Approve reviews before they appear on
      product pages.
    </p>

    <div v-if="!unlocked" class="gate">
      <label>
        Manager passcode
        <input v-model="passcode" type="password" placeholder="demo" />
      </label>
      <button type="button" class="btn" @click="tryUnlock">Unlock</button>
      <p v-if="gateError" class="error">{{ gateError }}</p>
      <p class="hint">Use passcode <code>demo</code> for class demos.</p>
    </div>

    <div v-else>
      <p v-if="pending.length === 0" class="empty">No pending reviews.</p>
      <ul v-else class="list">
        <li v-for="item in pending" :key="item.id">
          <div>
            <p class="title">
              {{ item.authorName }} · {{ item.rating }}★ · product
              #{{ item.productId }}
            </p>
            <p class="text">{{ item.text }}</p>
            <p class="meta">{{ formatDate(item.createdAt) }}</p>
          </div>
          <div class="actions">
            <button type="button" class="ok" @click="approve(item.id)">
              Approve
            </button>
            <button type="button" class="no" @click="reject(item.id)">
              Reject
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useCommentsStore } from "../stores/comments";

const ADMIN_KEY = "bookworld_admin_unlocked";
const DEMO_PASS = "demo";

const { listPending, approveReview, rejectReview } = useCommentsStore();

const unlocked = ref(localStorage.getItem(ADMIN_KEY) === "1");
const passcode = ref("");
const gateError = ref("");

const pending = computed(() => listPending());

function tryUnlock() {
  gateError.value = "";
  if (passcode.value === DEMO_PASS) {
    localStorage.setItem(ADMIN_KEY, "1");
    unlocked.value = true;
    return;
  }
  gateError.value = "Invalid passcode.";
}

function approve(id) {
  approveReview(id);
}

function reject(id) {
  rejectReview(id);
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
</script>

<style scoped>
.admin {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.lead {
  color: #64748b;
  margin-top: 6px;
}

.gate {
  margin-top: 16px;
  background: #fff;
  border: 1px solid #dbe5f1;
  border-radius: 14px;
  padding: 16px;
  display: grid;
  gap: 10px;
  max-width: 420px;
}

.gate label {
  display: grid;
  gap: 6px;
  font-weight: 600;
  font-size: 0.85rem;
}

.gate input {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #cfdbea;
}

.btn {
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  font-weight: 700;
  cursor: pointer;
  justify-self: start;
}

.error {
  color: #b91c1c;
  margin: 0;
  font-size: 0.88rem;
}

.hint {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
}

.list {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.list li {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  background: #fff;
  border: 1px solid #dbe5f1;
  border-radius: 14px;
  padding: 12px;
}

.title {
  margin: 0;
  font-weight: 800;
  font-size: 0.9rem;
}

.text {
  margin: 6px 0;
  color: #334155;
}

.meta {
  margin: 0;
  font-size: 0.78rem;
  color: #94a3b8;
}

.actions {
  display: grid;
  gap: 8px;
  align-content: start;
}

.ok {
  border: none;
  border-radius: 10px;
  padding: 8px 10px;
  background: #22c55e;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.no {
  border: none;
  border-radius: 10px;
  padding: 8px 10px;
  background: #fee2e2;
  color: #991b1b;
  font-weight: 700;
  cursor: pointer;
}

.empty {
  margin-top: 12px;
  color: #64748b;
}
</style>

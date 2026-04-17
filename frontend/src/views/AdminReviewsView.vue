<template>
  <div class="admin">
    <h1>Review moderation</h1>
    <p class="lead">
      Product manager console. Approve reviews before they appear on product pages.
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
      <p v-if="loading" class="empty">Loading pending reviews...</p>
      <p v-else-if="actionError" class="error">{{ actionError }}</p>
      <p v-else-if="pending.length === 0" class="empty">No pending reviews.</p>

      <ul v-else class="list">
        <li v-for="item in pending" :key="item.id">
          <div>
            <p class="title">
              {{ item.authorName }} · {{ item.rating }}★ · product #{{ item.productId }}
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
import { ref, onMounted } from "vue";
import axios from "axios";

const ADMIN_KEY = "bookworld_admin_unlocked";
const DEMO_PASS = "demo";

const unlocked = ref(localStorage.getItem(ADMIN_KEY) === "1");
const passcode = ref("");
const gateError = ref("");

const pending = ref([]);
const loading = ref(false);
const actionError = ref("");

async function fetchPending() {
  loading.value = true;
  actionError.value = "";

  try {
    const res = await axios.get("http://localhost:5050/api/comments/pending/all");

    pending.value = (res.data || []).map((item) => ({
      id: item._id,
      authorName: item.maskedUserName || "Anonymous",
      rating: item.rating,
      productId: item.productId,
      text: item.commentText || "",
      createdAt: item.createdAt,
    }));
  } catch (err) {
    console.error(err);
    actionError.value =
      err.response?.data?.message || "Pending reviews could not be loaded.";
  } finally {
    loading.value = false;
  }
}

function tryUnlock() {
  gateError.value = "";

  if (passcode.value === DEMO_PASS) {
    localStorage.setItem(ADMIN_KEY, "1");
    unlocked.value = true;
    fetchPending();
    return;
  }

  gateError.value = "Invalid passcode.";
}

async function approve(id) {
  actionError.value = "";

  try {
    await axios.patch(`http://localhost:5050/api/comments/approve/${id}`, {
      role: "product_manager",
    });

    await fetchPending();
  } catch (err) {
    console.error(err);
    actionError.value =
      err.response?.data?.message || "Approve action failed.";
  }
}

async function reject(id) {
  actionError.value = "";

  try {
    await axios.patch(`http://localhost:5050/api/comments/reject/${id}`, {
      role: "product_manager",
    });

    await fetchPending();
  } catch (err) {
    console.error(err);
    actionError.value =
      err.response?.data?.message || "Reject action failed.";
  }
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

onMounted(() => {
  if (unlocked.value) {
    fetchPending();
  }
});
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
  border-radius: 8px;
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
  border-radius: 8px;
  border: 1px solid #cfdbea;
}

.btn {
  border-radius: 8px;
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
  border-radius: 8px;
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
  border-radius: 8px;
  padding: 8px 10px;
  background: #22c55e;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.no {
  border: none;
  border-radius: 8px;
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
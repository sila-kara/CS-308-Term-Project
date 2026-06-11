<template>
  <div class="admin">
    <h1>Review moderation</h1>
    <p class="lead">Approve or reject pending reviews before they appear on product pages.</p>

    <div v-if="loading" style="text-align:center;padding:40px;color:#64748b">Loading…</div>

    <template v-else>
      <p v-if="pending.length === 0 && rejectedDisplay.length === 0" class="empty">No pending reviews. 🎉</p>
      <ul v-if="pending.length" class="list">
        <li v-for="item in pending" :key="item._id">
          <div>
            <p class="title">
              {{ item.maskedUserName }} · {{ item.rating }}★ · <em>{{ item.productName }}</em>
            </p>
            <p class="text">{{ item.commentText || "— (rating only)" }}</p>
            <p class="meta">{{ formatDate(item.createdAt) }}</p>
          </div>
          <div class="actions">
            <button type="button" class="ok" :disabled="busy[item._id]" @click="approve(item._id)">Approve</button>
            <button type="button" class="no" :disabled="busy[item._id]" @click="reject(item._id)">Reject</button>
          </div>
        </li>
      </ul>
      <ul v-if="rejectedDisplay.length" class="list rejected-list">
        <li v-for="item in rejectedDisplay" :key="item._id" class="rejected-item">
          <div>
            <p class="title">
              {{ item.maskedUserName }} · <span class="stars">{{ "★".repeat(item.rating) }}</span> · <em>{{ item.productName }}</em>
            </p>
            <p class="text removed">Comment removed</p>
            <p class="meta">{{ formatDate(item.createdAt) }}</p>
          </div>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup>
defineOptions({ name: "AdminReviewsView" });
import { ref, reactive, onMounted } from "vue";
import { useCommentsStore } from "../stores/comments";

const { fetchPending, listPending, approveReview, rejectReview } = useCommentsStore();

const loading = ref(false);
const busy = reactive({});
const pending = ref([]);
const rejectedDisplay = ref([]);

async function load() {
  loading.value = true;
  await fetchPending();
  pending.value = listPending();
  loading.value = false;
}

async function approve(id) {
  busy[id] = true;
  await approveReview(id);
  pending.value = listPending();
  busy[id] = false;
}

async function reject(id) {
  busy[id] = true;
  const item = pending.value.find((entry) => entry._id === id);
  const ok = await rejectReview(id);
  if (ok && item) {
    rejectedDisplay.value = [
      { ...item, commentText: "" },
      ...rejectedDisplay.value.filter((entry) => entry._id !== id),
    ];
  }
  pending.value = listPending();
  busy[id] = false;
}

function formatDate(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

onMounted(load);
</script>

<style scoped>
.admin {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}
.lead { color: #64748b; margin-top: 6px; }
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
.title { margin: 0; font-weight: 800; font-size: 0.9rem; }
.stars { color: #f59e0b; letter-spacing: 1px; }
.text { margin: 6px 0; color: #334155; }
.text.removed { color: #94a3b8; font-style: italic; }
.rejected-list { margin-top: 16px; }
.rejected-item { background: #f8fafc; }
.meta { margin: 0; font-size: 0.78rem; color: #94a3b8; }
.actions { display: grid; gap: 8px; align-content: start; }
.ok {
  border: none; border-radius: 8px; padding: 8px 10px;
  background: #22c55e; color: white; font-weight: 700; cursor: pointer;
}
.no {
  border: none; border-radius: 8px; padding: 8px 10px;
  background: #fee2e2; color: #991b1b; font-weight: 700; cursor: pointer;
}
.ok:disabled, .no:disabled { opacity: 0.5; cursor: not-allowed; }
.empty { margin-top: 12px; color: #64748b; }
</style>

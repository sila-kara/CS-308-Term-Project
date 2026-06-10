<template>
  <div class="profile-page">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="avatar-block">
        <div class="avatar-circle">
          <img v-if="avatarSrc" :src="avatarSrc" class="avatar-img" />
          <span v-else-if="selectedPreset" class="avatar-emoji">{{ selectedPreset.emoji }}</span>
          <span v-else class="avatar-initials">{{ initials }}</span>
        </div>
        <p class="user-name">{{ user.name || "—" }}</p>
        <p class="user-email">{{ user.email || "—" }}</p>
      </div>

      <nav class="side-nav">
        <button :class="['side-link', { active: tab === 'profile' }]" @click="tab = 'profile'">👤 Profile</button>
        <button :class="['side-link', { active: tab === 'password' }]" @click="tab = 'password'">🔒 Password</button>
        <router-link to="/orders" class="side-link">📦 My Orders</router-link>
        <router-link to="/wishlist" class="side-link">❤️ Wishlist</router-link>
        <router-link to="/returns" class="side-link">↩️ Returns</router-link>
      </nav>
    </aside>

    <!-- Main content -->
    <div class="main">
      <div v-if="loading" class="card" style="text-align:center;padding:40px;color:#64748b">Loading…</div>

      <!-- Profile tab -->
      <template v-else-if="tab === 'profile'">
        <section class="card">
          <h2>Profile photo</h2>

          <div class="avatar-grid">
            <button
              v-for="opt in AVATAR_OPTIONS"
              :key="opt.id"
              :class="['avatar-opt', { selected: selectedAvatar === opt.id }]"
              @click="selectPreset(opt)"
              :title="opt.label"
            >
              <span class="opt-emoji">{{ opt.emoji }}</span>
              <span class="opt-label">{{ opt.label }}</span>
            </button>

            <!-- Custom upload -->
            <label :class="['avatar-opt', 'upload-opt', { selected: selectedAvatar === 'custom' }]" title="Upload your own">
              <input type="file" accept="image/*" class="file-hidden" @change="onUpload" />
              <span class="opt-emoji">📷</span>
              <span class="opt-label">Upload</span>
            </label>
          </div>

          <p v-if="avatarMsg" class="msg success">{{ avatarMsg }}</p>
        </section>

        <section class="card">
          <h2>Personal information</h2>
          <form @submit.prevent="saveProfile">
            <div class="field">
              <label>Customer ID</label>
              <input :value="user._id || user.id" disabled class="disabled" />
            </div>
            <div class="field">
              <label>Full name</label>
              <input v-model="form.name" type="text" required />
            </div>
            <div class="field">
              <label>Email</label>
              <input :value="user.email" type="email" disabled class="disabled" />
            </div>
            <div class="field">
              <label>Tax ID</label>
              <input v-model="form.taxId" type="text" placeholder="e.g. 1234567890" />
            </div>
            <div class="field">
              <label>Delivery address</label>
              <textarea v-model="form.address" rows="3" placeholder="Street, city, postal code…" />
            </div>
            <div class="field">
              <label>Password</label>
              <input value="••••••••" disabled class="disabled" />
              <span class="field-hint">🔒 Stored as a secure bcrypt hash — never visible in plain text.</span>
            </div>
            <p v-if="profileMsg" :class="['msg', profileMsgType]">{{ profileMsg }}</p>
            <button class="btn primary" type="submit" :disabled="profileSaving">
              {{ profileSaving ? "Saving…" : "Save changes" }}
            </button>
          </form>
        </section>
      </template>

      <!-- Password tab -->
      <template v-else-if="tab === 'password'">
        <section class="card">
          <h2>Change password</h2>
          <form @submit.prevent="savePassword">
            <div class="field">
              <label>Current password</label>
              <input v-model="pwForm.current" type="password" autocomplete="current-password" required />
            </div>
            <div class="field">
              <label>New password</label>
              <input v-model="pwForm.next" type="password" autocomplete="new-password" required minlength="6" />
            </div>
            <div class="field">
              <label>Confirm new password</label>
              <input v-model="pwForm.confirm" type="password" autocomplete="new-password" required />
            </div>
            <p v-if="pwMsg" :class="['msg', pwMsgType]">{{ pwMsg }}</p>
            <button class="btn primary" type="submit" :disabled="pwSaving">
              {{ pwSaving ? "Saving…" : "Update password" }}
            </button>
          </form>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import api from "../utils/api.js";
import { useAuthStore } from "../stores/auth";

const { state: authState } = useAuthStore();
const loading = ref(true);
const tab = ref("profile");
const user = ref({});

const AVATAR_OPTIONS = [
  { id: "wizard",    emoji: "🧙", label: "The Wizard",    bg: "#ddd6fe" },
  { id: "detective", emoji: "🕵️", label: "The Detective", bg: "#fef9c3" },
  { id: "queen",     emoji: "👑", label: "The Queen",     bg: "#fce7f3" },
  { id: "elf",       emoji: "🧝", label: "The Elf",       bg: "#dcfce7" },
  { id: "archer",    emoji: "🏹", label: "The Archer",    bg: "#ffedd5" },
  { id: "scientist", emoji: "⚗️", label: "The Scientist", bg: "#e0f2fe" },
  { id: "knight",    emoji: "⚔️", label: "The Knight",   bg: "#f1f5f9" },
  { id: "witch",     emoji: "🧙‍♀️", label: "The Witch",  bg: "#fdf4ff" },
  { id: "pirate",    emoji: "🏴‍☠️", label: "The Pirate", bg: "#fef3c7" },
  { id: "bookworm",  emoji: "🐛", label: "The Bookworm",  bg: "#ecfdf5" },
];

const selectedAvatar = ref(null);
const avatarSrc = ref(null);
const avatarMsg = ref("");

const selectedPreset = computed(() => AVATAR_OPTIONS.find(o => o.id === selectedAvatar.value) || null);

const initials = computed(() => {
  const n = user.value.name || "";
  return n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
});

const form = reactive({ name: "", address: "", taxId: "" });
const profileSaving = ref(false);
const profileMsg = ref("");
const profileMsgType = ref("success");

const pwForm = reactive({ current: "", next: "", confirm: "" });
const pwSaving = ref(false);
const pwMsg = ref("");
const pwMsgType = ref("success");

onMounted(async () => {
  try {
    const { data } = await api.get("/auth/me");
    user.value = data;
    form.name = data.name || "";
    form.address = data.address || "";
    form.taxId = data.taxId || "";
    if (data.avatar) {
      const preset = AVATAR_OPTIONS.find(o => o.id === data.avatar);
      if (preset) {
        selectedAvatar.value = preset.id;
        avatarSrc.value = null;
      } else {
        selectedAvatar.value = "custom";
        avatarSrc.value = data.avatar;
      }
    }
  } catch {
    profileMsg.value = "Failed to load profile.";
    profileMsgType.value = "error";
  } finally {
    loading.value = false;
  }
});

async function selectPreset(opt) {
  selectedAvatar.value = opt.id;
  avatarSrc.value = null;
  avatarMsg.value = "";
  try {
    await api.patch("/auth/me", { avatar: opt.id });
    avatarMsg.value = `Avatar updated to ${opt.label}!`;
    if (authState.user) authState.user.avatar = opt.id;
  } catch {}
}

async function onUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    const dataUrl = ev.target.result;
    avatarSrc.value = dataUrl;
    selectedAvatar.value = "custom";
    avatarMsg.value = "";
    try {
      await api.patch("/auth/me", { avatar: dataUrl });
      avatarMsg.value = "Profile photo updated!";
      if (authState.user) authState.user.avatar = dataUrl;
    } catch {}
  };
  reader.readAsDataURL(file);
}

async function saveProfile() {
  profileSaving.value = true;
  profileMsg.value = "";
  try {
    const { data } = await api.patch("/auth/me", { name: form.name, address: form.address, taxId: form.taxId });
    user.value = { ...user.value, ...data };
    if (authState.user) authState.user.name = data.name;
    profileMsg.value = "Changes saved!";
    profileMsgType.value = "success";
  } catch (e) {
    profileMsg.value = e.response?.data?.message || "Failed to save.";
    profileMsgType.value = "error";
  } finally {
    profileSaving.value = false;
  }
}

async function savePassword() {
  pwMsg.value = "";
  if (pwForm.next !== pwForm.confirm) {
    pwMsg.value = "Passwords do not match.";
    pwMsgType.value = "error";
    return;
  }
  pwSaving.value = true;
  try {
    await api.patch("/auth/me", { currentPassword: pwForm.current, newPassword: pwForm.next });
    pwMsg.value = "Password updated!";
    pwMsgType.value = "success";
    pwForm.current = ""; pwForm.next = ""; pwForm.confirm = "";
  } catch (e) {
    pwMsg.value = e.response?.data?.message || "Failed to update password.";
    pwMsgType.value = "error";
  } finally {
    pwSaving.value = false;
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 20px 64px;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 28px;
  align-items: start;
}

/* Sidebar */
.sidebar {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  position: sticky;
  top: 20px;
}
.avatar-block {
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  padding: 28px 20px 20px;
  text-align: center;
  color: #fff;
}
.avatar-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 3px solid rgba(255,255,255,0.5);
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 1.5rem;
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-emoji { font-size: 2rem; line-height: 1; }
.avatar-initials { font-weight: 800; font-size: 1.4rem; color: #fff; }
.user-name { margin: 0 0 2px; font-weight: 700; font-size: 0.95rem; }
.user-email { margin: 0; font-size: 0.78rem; opacity: 0.75; }

.side-nav { padding: 8px; display: grid; gap: 2px; }
.side-link {
  display: block;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #334155;
  text-decoration: none;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
}
.side-link:hover { background: #f1f5f9; }
.side-link.active { background: #eff6ff; color: #1d4ed8; font-weight: 700; }

/* Main */
.main { display: grid; gap: 20px; }
.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
}
.card h2 { margin: 0 0 18px; font-size: 1.05rem; }

/* Avatar grid */
.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
}
.avatar-opt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.15s;
}
.avatar-opt:hover { border-color: #93c5fd; background: #eff6ff; }
.avatar-opt.selected { border-color: #2563eb; background: #eff6ff; }
.upload-opt { border-style: dashed; }
.opt-emoji { font-size: 1.8rem; }
.opt-label { font-size: 0.68rem; color: #64748b; text-align: center; font-weight: 600; }
.file-hidden { display: none; }

/* Form */
form { display: grid; gap: 14px; }
.field { display: grid; gap: 6px; }
.field label { font-size: 0.85rem; font-weight: 600; color: #334155; }
.field input, .field textarea {
  border: 1px solid #cfdbea;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
}
.field textarea { resize: vertical; }
.disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }
.field-hint { font-size: 0.78rem; color: #64748b; margin-top: 2px; }

.btn { padding: 11px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; border: none; font-size: 0.9rem; justify-self: start; }
.btn.primary { background: #2563eb; color: #fff; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.msg { margin: 0; font-size: 0.88rem; }
.msg.success { color: #166534; }
.msg.error { color: #b91c1c; }

@media (max-width: 700px) {
  .profile-page { grid-template-columns: 1fr; }
  .sidebar { position: static; }
}
</style>

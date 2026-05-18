import { computed, reactive } from "vue";
import api, { getToken } from "../utils/api.js";

const state = reactive({
  items: [],
  loading: false,
  preferences: {
    wishlistDiscounts: false,
    wishlistRestock: false,
  },
});

const unreadCount = computed(() => state.items.filter((item) => !item.read).length);

async function loadNotifications() {
  if (!getToken()) {
    state.items = [];
    return;
  }

  state.loading = true;
  try {
    const { data } = await api.get("/notifications");
    state.items = data;
  } catch {
    state.items = [];
  } finally {
    state.loading = false;
  }
}

async function markRead(notificationId) {
  const item = state.items.find((notification) => notification._id === notificationId);
  if (item) item.read = true;
  try {
    await api.patch(`/notifications/${notificationId}/read`);
  } catch {
    await loadNotifications();
  }
}

async function markAllRead() {
  state.items.forEach((notification) => {
    notification.read = true;
  });
  try {
    await api.patch("/notifications/read-all");
  } catch {
    await loadNotifications();
  }
}

async function loadEmailPreferences() {
  if (!getToken()) {
    state.preferences.wishlistDiscounts = false;
    state.preferences.wishlistRestock = false;
    return;
  }

  try {
    const { data } = await api.get("/notifications/preferences");
    state.preferences.wishlistDiscounts = Boolean(data.wishlistDiscounts);
    state.preferences.wishlistRestock = Boolean(data.wishlistRestock);
  } catch {
    state.preferences.wishlistDiscounts = false;
    state.preferences.wishlistRestock = false;
  }
}

async function updateEmailPreferences(nextPreferences) {
  const previous = { ...state.preferences };
  Object.assign(state.preferences, nextPreferences);

  try {
    const { data } = await api.patch("/notifications/preferences", nextPreferences);
    state.preferences.wishlistDiscounts = Boolean(data.wishlistDiscounts);
    state.preferences.wishlistRestock = Boolean(data.wishlistRestock);
  } catch (err) {
    Object.assign(state.preferences, previous);
    throw err;
  }
}

export function useNotificationsStore() {
  return {
    state,
    unreadCount,
    loadNotifications,
    loadEmailPreferences,
    markRead,
    markAllRead,
    updateEmailPreferences,
  };
}

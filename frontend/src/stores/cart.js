import { reactive, computed } from "vue";

const state = reactive({
  items: [],
});

function addToCart(product) {
  if (!product || product.quantity === 0) return;

  const existingItem = state.items.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.items.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }
}

function removeFromCart(productId) {
  const index = state.items.findIndex((item) => item.id === productId);
  if (index !== -1) {
    state.items.splice(index, 1);
  }
}

function updateItemQuantity(productId, nextQty) {
  const item = state.items.find((i) => i.id === productId);
  if (!item) return;
  const qty = Math.max(0, Math.floor(Number(nextQty)));
  if (qty === 0) {
    removeFromCart(productId);
    return;
  }
  item.quantity = qty;
}

function clearCart() {
  state.items.splice(0, state.items.length);
}

const cartCount = computed(() =>
  state.items.reduce((total, item) => total + item.quantity, 0),
);

const cartTotal = computed(() =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0),
);

export function useCartStore() {
  return {
    state,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    cartCount,
    cartTotal,
  };
}
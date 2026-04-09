import { reactive, computed } from "vue";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const state = reactive({
  items: [], // { id, name, price, image, quantity, stock }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Find an item in the cart by product id. */
function findItem(productId) {
  return state.items.find((i) => i.id === productId);
}

// ---------------------------------------------------------------------------
// Actions  (ADD_ITEM | REMOVE_ITEM | UPDATE_QUANTITY | CLEAR_CART)
// ---------------------------------------------------------------------------

/**
 * ADD_ITEM
 * Adds one unit of a product to the cart.
 * - Silently returns if stock === 0.
 * - Silently returns if adding one more would exceed available stock.
 */
function addToCart(product) {
  if (!product) return;

  // Guard: product must have stock available
  if (!product.stock || product.stock <= 0) return;

  const existing = findItem(product.id);

  if (existing) {
    // Guard: do not exceed available stock
    if (existing.quantity >= product.stock) return;
    existing.quantity += 1;
  } else {
    state.items.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      quantity: 1,
    });
  }
}

/**
 * REMOVE_ITEM
 * Removes a product from the cart entirely.
 */
function removeFromCart(productId) {
  const index = state.items.findIndex((i) => i.id === productId);
  if (index !== -1) {
    state.items.splice(index, 1);
  }
}

/**
 * UPDATE_QUANTITY
 * Sets the quantity of a cart item to an explicit value.
 * - Removes the item if newQty ≤ 0.
 * - Caps newQty at the product's available stock.
 */
function updateItemQuantity(productId, newQty) {
  const item = findItem(productId);
  if (!item) return;

  const qty = Math.floor(Number(newQty));

  // Remove item when quantity drops to zero or below
  if (qty <= 0) {
    removeFromCart(productId);
    return;
  }

  // Cap at available stock
  item.quantity = Math.min(qty, item.stock);
}

/**
 * CLEAR_CART
 * Empties the cart completely.
 */
function clearCart() {
  state.items.splice(0, state.items.length);
}

// ---------------------------------------------------------------------------
// Computed getters
// ---------------------------------------------------------------------------

/** Total number of units across all cart items. */
const cartCount = computed(() =>
  state.items.reduce((total, item) => total + item.quantity, 0)
);

/** Total price of all cart items. */
const cartTotal = computed(() =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0)
);

/** Whether the cart has any items. */
const isEmpty = computed(() => state.items.length === 0);

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------
export function useCartStore() {
  return {
    state,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    cartCount,
    cartTotal,
    isEmpty,
  };
}

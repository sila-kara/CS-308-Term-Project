export function addToCart(cart, product, quantity) {
  const qty = Number(quantity);
  if (!Number.isFinite(qty)) {
    throw new Error("Invalid quantity");
  }
  if (qty > product.stock) {
    throw new Error("Insufficient stock");
  }
  const existing = cart.find((item) => item.product.id === product.id);
  if (existing) {
    const newQty = existing.quantity + qty;
    if (newQty > product.stock) {
      throw new Error("Insufficient stock");
    }
    return cart.map((item) =>
      item.product.id === product.id ? { ...item, quantity: newQty } : item
    );
  }
  return [...cart, { product, quantity: qty }];
}

export function removeFromCart(cart, productId) {
  return cart.filter((item) => item.product.id !== productId);
}

export function updateQuantity(cart, productId, newQty) {
  const item = cart.find((item) => item.product.id === productId);
  if (!item) {
    throw new Error("Product not found in cart");
  }
  const qty = Number(newQty);
  if (!Number.isFinite(qty)) {
    throw new Error("Invalid quantity");
  }
  if (qty > item.product.stock) {
    throw new Error("Insufficient stock");
  }
  if (qty <= 0) {
    return removeFromCart(cart, productId);
  }
  return cart.map((i) =>
    i.product.id === productId ? { ...i, quantity: qty } : i
  );
}

export function calculateTotal(cart) {
  return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function isInStock(product) {
  return product.stock > 0;
}

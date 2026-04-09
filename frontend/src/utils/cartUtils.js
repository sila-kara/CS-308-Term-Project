export function addToCart(cart, product, quantity) {
  if (quantity > product.stock) {
    throw new Error("Insufficient stock");
  }
  const existing = cart.find((item) => item.product.id === product.id);
  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > product.stock) {
      throw new Error("Insufficient stock");
    }
    return cart.map((item) =>
      item.product.id === product.id ? { ...item, quantity: newQty } : item
    );
  }
  return [...cart, { product, quantity }];
}

export function removeFromCart(cart, productId) {
  return cart.filter((item) => item.product.id !== productId);
}

export function updateQuantity(cart, productId, newQty) {
  const item = cart.find((item) => item.product.id === productId);
  if (!item) {
    throw new Error("Product not found in cart");
  }
  if (newQty > item.product.stock) {
    throw new Error("Insufficient stock");
  }
  if (newQty <= 0) {
    return removeFromCart(cart, productId);
  }
  return cart.map((i) =>
    i.product.id === productId ? { ...i, quantity: newQty } : i
  );
}

export function calculateTotal(cart) {
  return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function isInStock(product) {
  return product.stock > 0;
}

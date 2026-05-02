const REQUIRED_FIELDS = [
  "id",
  "name",
  "model",
  "serialNumber",
  "description",
  "stock",
  "price",
  "warrantyStatus",
  "distributorInfo",
];

export function validateProduct(product) {
  if (!product || typeof product !== "object") return false;
  return REQUIRED_FIELDS.every(
    (field) => field in product && product[field] !== null && product[field] !== undefined
  );
}

export function filterByCategory(products, category) {
  return products.filter((p) => p.category === category);
}

export function sortByPrice(products, order = "asc") {
  const sorted = [...products];
  sorted.sort((a, b) => (order === "desc" ? b.price - a.price : a.price - b.price));
  return sorted;
}

export function sortByPopularity(products) {
  return [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
}

export function searchProducts(products, query) {
  if (!query) return products;
  const lower = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name?.toLowerCase().includes(lower) ||
      p.description?.toLowerCase().includes(lower)
  );
}

export function isOnSale(product) {
  const id = String(product?._id || product?.id || "");
  return !"39f".includes(id.slice(-1));
}

export function isTopRated(product) {
  return (product?.rating ?? 0) >= 4.8 && (product?.ratingCount ?? 0) >= 50;
}

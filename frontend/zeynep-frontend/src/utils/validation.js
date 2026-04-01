export function isValidEmail(value) {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export const ORDER_STATUS_SEQUENCE = [
  "processing",
  "in-transit",
  "delivered",
];

export function nextDeliveryStatus(current) {
  const idx = ORDER_STATUS_SEQUENCE.indexOf(current);
  if (idx === -1 || idx >= ORDER_STATUS_SEQUENCE.length - 1) return current;
  return ORDER_STATUS_SEQUENCE[idx + 1];
}

export function statusLabel(status) {
  switch (status) {
    case "processing":
      return "Processing";
    case "in-transit":
      return "In transit";
    case "delivered":
      return "Delivered";
    default:
      return status;
  }
}

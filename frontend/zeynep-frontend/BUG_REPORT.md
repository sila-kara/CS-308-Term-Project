# Bug Report — BookWorld frontend (demo)

**ID:** BW-FE-001  
**Severity:** Medium (data integrity when backend is introduced)  
**Area:** Shopping cart & inventory  

## Summary

Cart line quantities can exceed the catalog stock because the UI does not validate against the live `product.quantity` field after items are added. Orders are created from the cart snapshot only.

## Steps to reproduce

1. Open a product that shows limited stock (for example, a low quantity title).
2. Add it to the cart repeatedly or raise quantity in the cart page until it exceeds the stock number shown on the product page.
3. Proceed through mock checkout; the order is accepted.

## Expected behavior

At checkout (or when updating quantity), the client should cap quantities to available stock and surface an error when stock is insufficient—typically enforced by the server as well.

## Actual behavior

The cart store increments quantity without re-checking product inventory, so the checkout total can reflect more units than the catalog claims are available.

## Notes

This is acceptable for the current coursework demo (local-only data), but it must be fixed before connecting to a real API with transactional stock decrement.

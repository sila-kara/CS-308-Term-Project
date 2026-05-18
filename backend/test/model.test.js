const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");

const Product = require("../models/Product");
const User = require("../models/User");
const Comment = require("../models/Comment");

test("Product model accepts all first-demo listing fields", async () => {
  const product = new Product({
    name: "Clean Code",
    model: "1st Edition",
    serialNumber: "ISBN-9780132350884",
    description: "A handbook of software craftsmanship.",
    category: new mongoose.Types.ObjectId(),
    quantity: 5,
    price: 200,
    warranty: "Exchange guarantee",
    distributor: "Robert C. Martin",
  });

  await assert.doesNotReject(() => product.validate());
});

test("Product model rejects negative stock", async () => {
  const product = new Product({
    name: "Clean Code",
    model: "1st Edition",
    serialNumber: "ISBN-9780132350884",
    description: "A handbook of software craftsmanship.",
    category: new mongoose.Types.ObjectId(),
    quantity: -1,
    price: 200,
  });

  await assert.rejects(() => product.validate(), /Path `quantity` \(-1\) is less than minimum allowed value/);
});

test("Product model accepts sales pricing and discount fields", async () => {
  const product = new Product({
    name: "Clean Code",
    model: "1st Edition",
    serialNumber: "ISBN-9780132350884",
    description: "A handbook of software craftsmanship.",
    category: new mongoose.Types.ObjectId(),
    quantity: 5,
    price: 200,
    cost: 120,
    discountRate: 15,
    discountedPrice: 170,
    discountStartDate: new Date("2026-05-01"),
    discountEndDate: new Date("2026-05-31"),
  });

  await assert.doesNotReject(() => product.validate());
});

test("Product model defaults price to zero for product-manager-created products", async () => {
  const product = new Product({
    name: "Clean Code",
    model: "1st Edition",
    serialNumber: "ISBN-9780132350884",
    description: "A handbook of software craftsmanship.",
    category: new mongoose.Types.ObjectId(),
    quantity: 5,
  });

  await assert.doesNotReject(() => product.validate());
  assert.equal(product.price, 0);
});

test("User model defaults new users to customer role", () => {
  const user = new User({
    name: "Ada Reader",
    email: "ada@example.com",
    password: "hashed-password",
  });

  assert.equal(user.role, "customer");
  assert.equal(user.emailPreferences.wishlistDiscounts, false);
  assert.equal(user.emailPreferences.wishlistRestock, false);
});

test("User model stores discount notifications", async () => {
  const user = new User({
    name: "Ada Reader",
    email: "ada@example.com",
    password: "hashed-password",
    notifications: [{
      product: new mongoose.Types.ObjectId(),
      title: "Wishlist item on sale",
      message: "Clean Code is now 170.00 TL with 15% off.",
      originalPrice: 200,
      discountedPrice: 170,
      discountRate: 15,
    }],
  });

  await assert.doesNotReject(() => user.validate());
  assert.equal(user.notifications[0].read, false);
  assert.equal(user.notifications[0].type, "discount");
});

test("User model stores restock notifications", async () => {
  const user = new User({
    name: "Ada Reader",
    email: "ada@example.com",
    password: "hashed-password",
    notifications: [{
      type: "restock",
      product: new mongoose.Types.ObjectId(),
      title: "Wishlist item back in stock",
      message: "Clean Code is back in stock with 8 available.",
      originalPrice: 200,
    }],
  });

  await assert.doesNotReject(() => user.validate());
  assert.equal(user.notifications[0].type, "restock");
});

test("Comment model rejects ratings outside the allowed range", async () => {
  const comment = new Comment({
    userId: new mongoose.Types.ObjectId(),
    productId: new mongoose.Types.ObjectId(),
    rating: 6,
    commentText: "Too high",
  });

  await assert.rejects(() => comment.validate(), /Path `rating` \(6\) is more than maximum allowed value/);
});

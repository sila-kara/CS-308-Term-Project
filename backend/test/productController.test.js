const assert = require("node:assert/strict");
const test = require("node:test");

const Product = require("../models/Product");
const { updatePricing } = require("../controllers/productController");

function makeRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test("updatePricing calculates and persists discounted price", async () => {
  const originalFindById = Product.findById;

  const product = {
    _id: "product-1",
    name: "Clean Code",
    price: 200,
    cost: 0,
    discountRate: 0,
    discountedPrice: null,
    toObject() {
      return { ...this };
    },
    async save() {
      this.saved = true;
      return this;
    },
    async populate() {
      return this;
    },
  };

  Product.findById = async () => product;

  const req = {
    params: { id: "product-1" },
    body: {
      price: 200,
      cost: 120,
      discountRate: 15,
      discountStartDate: "2026-05-01",
      discountEndDate: "2026-05-31",
    },
  };
  const res = makeRes();

  try {
    await updatePricing(req, res);
  } finally {
    Product.findById = originalFindById;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(product.price, 200);
  assert.equal(product.cost, 120);
  assert.equal(product.discountRate, 15);
  assert.equal(product.discountedPrice, 170);
  assert.ok(product.saved);
  assert.equal(res.body.effectivePrice, 170);
  assert.equal(res.body.isDiscountActive, true);
});

test("updatePricing rejects invalid discount rate", async () => {
  const originalFindById = Product.findById;

  Product.findById = async () => ({
    async save() {
      throw new Error("Product should not be saved");
    },
  });

  const req = {
    params: { id: "product-1" },
    body: {
      price: 200,
      discountRate: 120,
    },
  };
  const res = makeRes();

  try {
    await updatePricing(req, res);
  } finally {
    Product.findById = originalFindById;
  }

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: "Discount rate must be between 0 and 100" });
});

const assert = require("node:assert/strict");
const test = require("node:test");

const Product = require("../models/Product");
const {
  createProduct,
  deleteProduct,
  updatePricing,
} = require("../controllers/productController");

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

test("createProduct keeps pricing under sales manager control", async () => {
  const originalCreate = Product.create;
  let createdPayload;

  Product.create = async (payload) => {
    createdPayload = payload;
    return {
      _id: "product-1",
      ...payload,
      toObject() {
        return { ...this };
      },
      async populate() {
        return this;
      },
    };
  };

  const req = {
    body: {
      name: "Clean Code",
      model: "1st Edition",
      serialNumber: "ISBN-9780132350884",
      description: "A handbook of software craftsmanship.",
      category: "category-1",
      quantity: 5,
      price: 200,
      cost: 120,
      discountRate: 20,
      discountedPrice: 160,
      warranty: "Exchange guarantee",
      distributor: "Robert C. Martin",
    },
  };
  const res = makeRes();

  try {
    await createProduct(req, res);
  } finally {
    Product.create = originalCreate;
  }

  assert.equal(res.statusCode, 201);
  assert.equal(createdPayload.price, 0);
  assert.equal(createdPayload.cost, 0);
  assert.equal(createdPayload.discountRate, 0);
  assert.equal(createdPayload.discountedPrice, null);
  assert.equal(res.body.price, 0);
  assert.equal(res.body.effectivePrice, 0);
});

test("deleteProduct returns a not-found response for missing products", async () => {
  const originalFindByIdAndDelete = Product.findByIdAndDelete;
  Product.findByIdAndDelete = async () => null;

  const req = { params: { id: "missing-product" } };
  const res = makeRes();

  try {
    await deleteProduct(req, res);
  } finally {
    Product.findByIdAndDelete = originalFindByIdAndDelete;
  }

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { message: "Product not found" });
});

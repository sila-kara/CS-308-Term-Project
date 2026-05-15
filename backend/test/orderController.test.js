const assert = require("node:assert/strict");
const test = require("node:test");

const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const {
  createOrder,
  approveReturn,
  refundReturn,
} = require("../controllers/orderController");

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

function makeOrderBody(overrides = {}) {
  return {
    items: [
      {
        productId: "product-1",
        name: "Clean Code",
        price: 200,
        quantity: 2,
      },
    ],
    subtotal: 400,
    shipping: 20,
    tax: 72,
    total: 492,
    paymentMethod: "Mock Visa",
    cardLast4: "4242",
    deliveryAddress: "Sabanci University",
    ...overrides,
  };
}

test("createOrder rejects an empty cart", async () => {
  const req = { user: { id: "user-1" }, body: makeOrderBody({ items: [] }) };
  const res = makeRes();

  await createOrder(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: "Order must have at least one item" });
});

test("createOrder rejects checkout when a product cannot be found", async () => {
  const originalFindById = Product.findById;
  const originalFindByIdAndUpdate = Product.findByIdAndUpdate;
  const originalCreate = Order.create;

  const stockUpdates = [];
  Product.findById = async () => null;
  Product.findByIdAndUpdate = async (...args) => {
    stockUpdates.push(args);
  };
  Order.create = async () => {
    throw new Error("Order should not be created");
  };

  const req = { user: { id: "user-1" }, body: makeOrderBody() };
  const res = makeRes();

  try {
    await createOrder(req, res);
  } finally {
    Product.findById = originalFindById;
    Product.findByIdAndUpdate = originalFindByIdAndUpdate;
    Order.create = originalCreate;
  }

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { message: "Product not found: product-1" });
  assert.equal(stockUpdates.length, 0);
});

test("createOrder rejects checkout when stock is insufficient", async () => {
  const originalFindById = Product.findById;
  const originalFindByIdAndUpdate = Product.findByIdAndUpdate;
  const originalCreate = Order.create;

  const stockUpdates = [];
  Product.findById = async () => ({ name: "Clean Code", quantity: 1 });
  Product.findByIdAndUpdate = async (...args) => {
    stockUpdates.push(args);
  };
  Order.create = async () => {
    throw new Error("Order should not be created");
  };

  const req = { user: { id: "user-1" }, body: makeOrderBody() };
  const res = makeRes();

  try {
    await createOrder(req, res);
  } finally {
    Product.findById = originalFindById;
    Product.findByIdAndUpdate = originalFindByIdAndUpdate;
    Order.create = originalCreate;
  }

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: "Insufficient stock for: Clean Code" });
  assert.equal(stockUpdates.length, 0);
});

test("createOrder decrements stock and creates a processing order", async () => {
  const originalFindById = Product.findById;
  const originalFindByIdAndUpdate = Product.findByIdAndUpdate;
  const originalCreate = Order.create;
  const originalUserFindById = User.findById;

  const stockUpdates = [];
  Product.findById = async () => ({ name: "Clean Code", quantity: 5 });
  Product.findByIdAndUpdate = async (...args) => {
    stockUpdates.push(args);
  };
  User.findById = async () => null;
  Order.create = async (payload) => ({
    _id: "order-1",
    ...payload,
  });

  const req = { user: { id: "user-1" }, body: makeOrderBody() };
  const res = makeRes();

  try {
    await createOrder(req, res);
  } finally {
    Product.findById = originalFindById;
    Product.findByIdAndUpdate = originalFindByIdAndUpdate;
    Order.create = originalCreate;
    User.findById = originalUserFindById;
  }

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.status, "processing");
  assert.equal(res.body.userId, "user-1");
  assert.deepEqual(stockUpdates, [
    ["product-1", { $inc: { quantity: -2 } }],
  ]);
});

function makeReturnOrder(overrides = {}) {
  return {
    _id: "order-1",
    userId: "user-1",
    returnStatus: "requested",
    returnItems: ["product-1"],
    items: [
      {
        productId: "product-1",
        name: "Clean Code",
        price: 200,
        quantity: 2,
      },
      {
        productId: "product-2",
        name: "1984",
        price: 65,
        quantity: 1,
      },
    ],
    async save() {
      this.saved = true;
      return this;
    },
    async populate() {
      return this;
    },
    ...overrides,
  };
}

test("approveReturn approves selected items and does not restore stock yet", async () => {
  const originalFindById = Order.findById;
  const originalFindByIdAndUpdate = Product.findByIdAndUpdate;

  const order = makeReturnOrder();
  const stockUpdates = [];
  Order.findById = async () => order;
  Product.findByIdAndUpdate = async (...args) => {
    stockUpdates.push(args);
  };

  const req = { params: { id: "order-1" } };
  const res = makeRes();

  try {
    await approveReturn(req, res);
  } finally {
    Order.findById = originalFindById;
    Product.findByIdAndUpdate = originalFindByIdAndUpdate;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.returnStatus, "approved");
  assert.equal(res.body.returnRefundAmount, 400);
  assert.ok(res.body.returnApprovedAt);
  assert.deepEqual(stockUpdates, []);
});

test("refundReturn restores stock only for selected returned items", async () => {
  const originalFindById = Order.findById;
  const originalFindByIdAndUpdate = Product.findByIdAndUpdate;

  const order = makeReturnOrder({
    returnStatus: "approved",
    returnRefundAmount: 400,
  });
  const stockUpdates = [];
  Order.findById = async () => order;
  Product.findByIdAndUpdate = async (...args) => {
    stockUpdates.push(args);
  };

  const req = { params: { id: "order-1" } };
  const res = makeRes();

  try {
    await refundReturn(req, res);
  } finally {
    Order.findById = originalFindById;
    Product.findByIdAndUpdate = originalFindByIdAndUpdate;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.returnStatus, "refunded");
  assert.equal(res.body.returnRefundAmount, 400);
  assert.ok(res.body.returnRefundedAt);
  assert.deepEqual(stockUpdates, [
    ["product-1", { $inc: { quantity: 2 } }],
  ]);
});

const assert = require("node:assert/strict");
const test = require("node:test");

const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const {
  createOrder,
  getSalesAnalytics,
  getSalesInvoices,
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
  const originalFindOneAndUpdate = Product.findOneAndUpdate;
  const originalFindByIdAndUpdate = Product.findByIdAndUpdate;
  const originalCreate = Order.create;

  const stockUpdates = [];
  Product.findById = async () => null;
  Product.findOneAndUpdate = async (...args) => {
    stockUpdates.push(args);
  };
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
    Product.findOneAndUpdate = originalFindOneAndUpdate;
    Product.findByIdAndUpdate = originalFindByIdAndUpdate;
    Order.create = originalCreate;
  }

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { message: "Product not found: product-1" });
  assert.equal(stockUpdates.length, 0);
});

test("createOrder rejects checkout when stock is insufficient", async () => {
  const originalFindById = Product.findById;
  const originalFindOneAndUpdate = Product.findOneAndUpdate;
  const originalFindByIdAndUpdate = Product.findByIdAndUpdate;
  const originalCreate = Order.create;

  const stockUpdates = [];
  Product.findById = async () => ({ name: "Clean Code", quantity: 1, price: 200 });
  Product.findOneAndUpdate = async (...args) => {
    stockUpdates.push(args);
  };
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
    Product.findOneAndUpdate = originalFindOneAndUpdate;
    Product.findByIdAndUpdate = originalFindByIdAndUpdate;
    Order.create = originalCreate;
  }

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: "Insufficient stock for: Clean Code" });
  assert.equal(stockUpdates.length, 0);
});

test("createOrder recalculates totals from DB prices and creates a processing order", async () => {
  const originalFindById = Product.findById;
  const originalFindOneAndUpdate = Product.findOneAndUpdate;
  const originalFindByIdAndUpdate = Product.findByIdAndUpdate;
  const originalCreate = Order.create;
  const originalUserFindById = User.findById;

  const atomicUpdates = [];
  const rollbackUpdates = [];
  Product.findById = async (id) => ({
    _id: id,
    name: "Clean Code",
    quantity: 5,
    price: 250,
    cost: 140,
  });
  Product.findOneAndUpdate = async (...args) => {
    atomicUpdates.push(args);
    return { _id: "product-1", quantity: 3 };
  };
  Product.findByIdAndUpdate = async (...args) => {
    rollbackUpdates.push(args);
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
    Product.findOneAndUpdate = originalFindOneAndUpdate;
    Product.findByIdAndUpdate = originalFindByIdAndUpdate;
    Order.create = originalCreate;
    User.findById = originalUserFindById;
  }

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.status, "processing");
  assert.equal(res.body.userId, "user-1");
  assert.equal(res.body.subtotal, 500);
  assert.equal(res.body.shipping, 0);
  assert.equal(res.body.tax, 50);
  assert.equal(res.body.total, 550);
  assert.deepEqual(res.body.items, [
    {
      productId: "product-1",
      name: "Clean Code",
      price: 250,
      cost: 140,
      quantity: 2,
    },
  ]);
  assert.deepEqual(atomicUpdates, [
    [
      { _id: "product-1", quantity: { $gte: 2 } },
      { $inc: { quantity: -2 } },
      { new: true },
    ],
  ]);
  assert.deepEqual(rollbackUpdates, []);
});

test("createOrder rolls back stock when an atomic decrement fails", async () => {
  const originalFindById = Product.findById;
  const originalFindOneAndUpdate = Product.findOneAndUpdate;
  const originalFindByIdAndUpdate = Product.findByIdAndUpdate;
  const originalCreate = Order.create;

  const atomicUpdates = [];
  const rollbackUpdates = [];
  const products = {
    "product-1": { _id: "product-1", name: "Clean Code", quantity: 5, price: 250, cost: 140 },
    "product-2": { _id: "product-2", name: "1984", quantity: 3, price: 65, cost: 30 },
  };

  Product.findById = async (id) => products[id] || null;
  Product.findOneAndUpdate = async (...args) => {
    atomicUpdates.push(args);
    return atomicUpdates.length === 1 ? { _id: "product-1", quantity: 3 } : null;
  };
  Product.findByIdAndUpdate = async (...args) => {
    rollbackUpdates.push(args);
  };
  Order.create = async () => {
    throw new Error("Order should not be created");
  };

  const req = {
    user: { id: "user-1" },
    body: makeOrderBody({
      items: [
        { productId: "product-1", quantity: 2 },
        { productId: "product-2", quantity: 3 },
      ],
    }),
  };
  const res = makeRes();

  try {
    await createOrder(req, res);
  } finally {
    Product.findById = originalFindById;
    Product.findOneAndUpdate = originalFindOneAndUpdate;
    Product.findByIdAndUpdate = originalFindByIdAndUpdate;
    Order.create = originalCreate;
  }

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: "Insufficient stock for: 1984" });
  assert.equal(atomicUpdates.length, 2);
  assert.deepEqual(rollbackUpdates, [
    ["product-1", { $inc: { quantity: 2 } }],
  ]);
});

test("createOrder uses active discounted DB price at checkout", async () => {
  const originalFindById = Product.findById;
  const originalFindOneAndUpdate = Product.findOneAndUpdate;
  const originalFindByIdAndUpdate = Product.findByIdAndUpdate;
  const originalCreate = Order.create;
  const originalUserFindById = User.findById;

  Product.findById = async (id) => ({
    _id: id,
    name: "Clean Code",
    quantity: 5,
    price: 200,
    cost: 120,
    discountRate: 20,
    discountedPrice: 160,
    discountStartDate: new Date(Date.now() - 1000),
    discountEndDate: new Date(Date.now() + 1000 * 60 * 60),
  });
  Product.findOneAndUpdate = async () => ({ _id: "product-1", quantity: 3 });
  Product.findByIdAndUpdate = async () => {};
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
    Product.findOneAndUpdate = originalFindOneAndUpdate;
    Product.findByIdAndUpdate = originalFindByIdAndUpdate;
    Order.create = originalCreate;
    User.findById = originalUserFindById;
  }

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.items[0].price, 160);
  assert.equal(res.body.items[0].cost, 120);
  assert.equal(res.body.subtotal, 320);
  assert.equal(res.body.tax, 32);
  assert.equal(res.body.total, 352);
});

test("getSalesAnalytics calculates revenue, cost, and profit for a date range", async () => {
  const originalFind = Order.find;
  let filterUsed;

  Order.find = (filter) => {
    filterUsed = filter;
    return {
      sort() {
        return this;
      },
      async populate() {
        return [
          {
            _id: "order-1",
            createdAt: new Date("2026-05-20T10:00:00.000Z"),
            status: "delivered",
            returnStatus: null,
            items: [
              { productId: "product-1", name: "Clean Code", price: 200, cost: 120, quantity: 2 },
            ],
          },
          {
            _id: "order-2",
            createdAt: new Date("2026-05-21T10:00:00.000Z"),
            status: "processing",
            returnStatus: "refunded",
            returnItems: ["product-2"],
            items: [
              { productId: "product-2", name: "1984", price: 80, cost: 50, quantity: 1 },
            ],
          },
        ];
      },
    };
  };

  const req = {
    query: {
      startDate: "2026-05-20",
      endDate: "2026-05-21",
    },
  };
  const res = makeRes();

  try {
    await getSalesAnalytics(req, res);
  } finally {
    Order.find = originalFind;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(filterUsed.status.$ne, "cancelled");
  assert.ok(filterUsed.createdAt.$gte instanceof Date);
  assert.ok(filterUsed.createdAt.$lte instanceof Date);
  assert.equal(res.body.revenue, 400);
  assert.equal(res.body.cost, 240);
  assert.equal(res.body.profit, 160);
  assert.equal(res.body.orderCount, 2);
  assert.equal(res.body.unitsSold, 2);
  assert.deepEqual(res.body.points, [
    { date: "2026-05-20", revenue: 400, cost: 240, profit: 160 },
    { date: "2026-05-21", revenue: 0, cost: 0, profit: 0 },
  ]);
});

test("getSalesAnalytics rejects invalid date ranges", async () => {
  const originalFind = Order.find;
  Order.find = () => {
    throw new Error("Order.find should not be called");
  };

  const req = {
    query: {
      startDate: "2026-05-22",
      endDate: "2026-05-01",
    },
  };
  const res = makeRes();

  try {
    await getSalesAnalytics(req, res);
  } finally {
    Order.find = originalFind;
  }

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: "Invalid analytics date range" });
});

test("getSalesInvoices filters invoices by selected date range", async () => {
  const originalFind = Order.find;
  let filterUsed;

  Order.find = (filter) => {
    filterUsed = filter;
    return {
      sort() {
        return this;
      },
      async populate() {
        return [{ invoiceNumber: "INV-1", total: 220 }];
      },
    };
  };

  const req = {
    query: {
      startDate: "2026-05-01",
      endDate: "2026-05-21",
    },
  };
  const res = makeRes();

  try {
    await getSalesInvoices(req, res);
  } finally {
    Order.find = originalFind;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.length, 1);
  assert.ok(filterUsed.createdAt.$gte instanceof Date);
  assert.ok(filterUsed.createdAt.$lte instanceof Date);
  assert.ok(filterUsed.createdAt.$gte <= filterUsed.createdAt.$lte);
});

test("getSalesInvoices rejects invalid date ranges", async () => {
  const originalFind = Order.find;
  Order.find = () => {
    throw new Error("Order.find should not be called");
  };

  const req = {
    query: {
      startDate: "2026-05-22",
      endDate: "2026-05-01",
    },
  };
  const res = makeRes();

  try {
    await getSalesInvoices(req, res);
  } finally {
    Order.find = originalFind;
  }

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: "Invalid invoice date range" });
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

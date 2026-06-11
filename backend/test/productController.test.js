const assert = require("node:assert/strict");
const test = require("node:test");

const Product = require("../models/Product");
const User = require("../models/User");
const {
  createProduct,
  deleteProduct,
  updatePricing,
  updateStock,
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
  const originalUserFind = User.find;

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
  User.find = async () => [];

  const req = {
    params: { id: "product-1" },
    body: {
      price: 200,
      cost: 120,
      discountRate: 15,
      discountStartDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      discountEndDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    },
  };
  const res = makeRes();

  try {
    await updatePricing(req, res);
  } finally {
    Product.findById = originalFindById;
    User.find = originalUserFind;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(product.price, 200);
  assert.equal(product.cost, 120);
  assert.equal(product.discountRate, 15);
  assert.equal(product.discountedPrice, 170);
  assert.ok(product.saved);
  assert.equal(res.body.effectivePrice, 170);
  assert.equal(res.body.isDiscountActive, true);
  assert.equal(res.body.wishlistNotificationsSent, 0);
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

test("updatePricing creates notifications for wishlist customers when discount changes", async () => {
  const originalFindById = Product.findById;
  const originalUserFind = User.find;

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
      return this;
    },
    async populate() {
      return this;
    },
  };
  const user = {
    name: "Ada Reader",
    email: "ada@example.com",
    emailPreferences: { wishlistDiscounts: true },
    notifications: [],
    async save() {
      this.saved = true;
      return this;
    },
  };

  Product.findById = async () => product;
  User.find = async (filter) => {
    assert.equal(filter.wishlist, "product-1");
    assert.equal(filter.role, "customer");
    return [user];
  };

  const req = {
    params: { id: "product-1" },
    body: {
      price: 200,
      cost: 120,
      discountRate: 10,
    },
  };
  const res = makeRes();

  try {
    await updatePricing(req, res);
  } finally {
    Product.findById = originalFindById;
    User.find = originalUserFind;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.wishlistNotificationsSent, 1);
  assert.equal(user.notifications.length, 1);
  assert.equal(user.notifications[0].title, "Wishlist item on sale");
  assert.equal(user.notifications[0].discountedPrice, 180);
  assert.equal(user.saved, true);
});

test("updatePricing does not notify when the same discount is saved again", async () => {
  const originalFindById = Product.findById;
  const originalUserFind = User.find;

  const product = {
    _id: "product-1",
    name: "Clean Code",
    price: 200,
    cost: 120,
    discountRate: 10,
    discountedPrice: 180,
    toObject() {
      return { ...this };
    },
    async save() {
      return this;
    },
    async populate() {
      return this;
    },
  };
  Product.findById = async () => product;
  User.find = async () => {
    throw new Error("Wishlist users should not be queried");
  };

  const req = {
    params: { id: "product-1" },
    body: {
      price: 200,
      cost: 120,
      discountRate: 10,
    },
  };
  const res = makeRes();

  try {
    await updatePricing(req, res);
  } finally {
    Product.findById = originalFindById;
    User.find = originalUserFind;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.wishlistNotificationsSent, 0);
});

test("updatePricing notifies when an existing discount gets deeper", async () => {
  const originalFindById = Product.findById;
  const originalUserFind = User.find;

  const product = {
    _id: "product-1",
    name: "Clean Code",
    price: 200,
    cost: 120,
    discountRate: 15,
    discountedPrice: 170,
    toObject() {
      return { ...this };
    },
    async save() {
      return this;
    },
    async populate() {
      return this;
    },
  };
  const user = {
    name: "Ada Reader",
    email: "ada@example.com",
    emailPreferences: { wishlistDiscounts: false },
    notifications: [],
    async save() {
      this.saved = true;
      return this;
    },
  };

  Product.findById = async () => product;
  User.find = async () => [user];

  const req = {
    params: { id: "product-1" },
    body: {
      price: 200,
      cost: 120,
      discountRate: 20,
    },
  };
  const res = makeRes();

  try {
    await updatePricing(req, res);
  } finally {
    Product.findById = originalFindById;
    User.find = originalUserFind;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.wishlistNotificationsSent, 1);
  assert.equal(user.notifications.length, 1);
  assert.equal(user.notifications[0].discountedPrice, 160);
});

test("updateStock notifies wishlist customers when an out-of-stock item returns", async () => {
  const originalFindById = Product.findById;
  const originalUserFind = User.find;

  let findByIdCalls = 0;
  const previousProduct = {
    _id: "product-1",
    quantity: 0,
    async save() {
      this.saved = true;
      return this;
    },
  };
  const populatedProduct = {
    _id: "product-1",
    name: "Clean Code",
    price: 200,
    quantity: 8,
    toObject() {
      return { ...this };
    },
  };
  const user = {
    name: "Ada Reader",
    email: "ada@example.com",
    emailPreferences: { wishlistRestock: true },
    notifications: [],
    async save() {
      this.saved = true;
      return this;
    },
  };

  Product.findById = () => {
    findByIdCalls += 1;
    if (findByIdCalls === 1) return previousProduct;
    return {
      async populate() {
        return populatedProduct;
      },
    };
  };
  User.find = async () => [user];

  const req = {
    params: { id: "product-1" },
    body: { quantity: 8 },
  };
  const res = makeRes();

  try {
    await updateStock(req, res);
  } finally {
    Product.findById = originalFindById;
    User.find = originalUserFind;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.wishlistNotificationsSent, 1);
  assert.equal(previousProduct.saved, true);
  assert.equal(user.notifications.length, 1);
  assert.equal(user.notifications[0].type, "restock");
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
  const originalFindById = Product.findById;
  Product.findById = async () => null;

  const req = { params: { id: "missing-product" } };
  const res = makeRes();

  try {
    await deleteProduct(req, res);
  } finally {
    Product.findById = originalFindById;
  }

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { message: "Product not found" });
});

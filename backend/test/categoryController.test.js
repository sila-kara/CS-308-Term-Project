const assert = require("node:assert/strict");
const test = require("node:test");

const Category = require("../models/Category");
const Product = require("../models/Product");
const {
  createCategory,
  deleteCategory,
} = require("../controllers/categoryController");

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

test("createCategory requires a non-empty name", async () => {
  const req = { body: { name: "   " } };
  const res = makeRes();

  await createCategory(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: "Category name is required" });
});

test("createCategory trims names before saving", async () => {
  const originalCreate = Category.create;
  let createdPayload;

  Category.create = async (payload) => {
    createdPayload = payload;
    return { _id: "category-1", ...payload };
  };

  const req = { body: { name: "  History  " } };
  const res = makeRes();

  try {
    await createCategory(req, res);
  } finally {
    Category.create = originalCreate;
  }

  assert.equal(res.statusCode, 201);
  assert.deepEqual(createdPayload, { name: "History" });
  assert.deepEqual(res.body, { _id: "category-1", name: "History" });
});

test("deleteCategory blocks deletion when products still use the category", async () => {
  const originalCountDocuments = Product.countDocuments;
  const originalFindByIdAndDelete = Category.findByIdAndDelete;

  Product.countDocuments = async () => 2;
  Category.findByIdAndDelete = async () => {
    throw new Error("Category should not be deleted");
  };

  const req = { params: { id: "category-1" } };
  const res = makeRes();

  try {
    await deleteCategory(req, res);
  } finally {
    Product.countDocuments = originalCountDocuments;
    Category.findByIdAndDelete = originalFindByIdAndDelete;
  }

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    message: "Cannot delete a category that still has products",
  });
});

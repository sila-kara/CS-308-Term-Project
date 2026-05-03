const assert = require("node:assert/strict");
const test = require("node:test");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { authMiddleware, requireRole } = require("../middleware/auth");

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

test("authMiddleware rejects requests without a bearer token", () => {
  const req = { headers: {} };
  const res = makeRes();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "No token provided" });
  assert.equal(nextCalled, false);
});

test("authMiddleware attaches decoded user for a valid token", () => {
  process.env.JWT_SECRET = "unit-test-secret";
  const token = jwt.sign({ id: "user-1", role: "customer" }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = makeRes();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.id, "user-1");
  assert.equal(req.user.role, "customer");
});

test("requireRole allows a matching manager role", async () => {
  const originalFindById = User.findById;
  User.findById = () => ({
    select: async () => ({ role: "product_manager" }),
  });

  const req = { user: { id: "manager-1" } };
  const res = makeRes();
  let nextCalled = false;

  try {
    await requireRole("product_manager")(req, res, () => {
      nextCalled = true;
    });
  } finally {
    User.findById = originalFindById;
  }

  assert.equal(nextCalled, true);
  assert.equal(req.user.role, "product_manager");
});

test("requireRole blocks users without the required role", async () => {
  const originalFindById = User.findById;
  User.findById = () => ({
    select: async () => ({ role: "customer" }),
  });

  const req = { user: { id: "customer-1" } };
  const res = makeRes();
  let nextCalled = false;

  try {
    await requireRole("sales_manager")(req, res, () => {
      nextCalled = true;
    });
  } finally {
    User.findById = originalFindById;
  }

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { message: "Forbidden" });
  assert.equal(nextCalled, false);
});

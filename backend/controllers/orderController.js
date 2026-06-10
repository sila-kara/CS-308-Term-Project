const Order = require("../models/Order");
const Product = require("../models/Product");
const sendInvoiceEmail = require("../utils/sendInvoiceEmail");
const { generateInvoicePdf } = require("../utils/sendInvoiceEmail");
const sendStatusEmail = require("../utils/sendStatusEmail");
const sendReturnEmail = require("../utils/sendReturnEmail");

const STATUS_SEQUENCE = ["processing", "in-transit", "delivered"];
const SHIPPING_FEE = 29.99;
const FREE_SHIPPING_THRESHOLD = 250;
const TAX_RATE = 0.1;

const CARGO_COMPANIES = [
  { name: "Sabancı Kargo",  prefix: "SK" },
  { name: "Kampüs Kargo",   prefix: "KK" },
  { name: "BookWorld Kargo", prefix: "BW" },
  { name: "Mavi Kargo",     prefix: "MK" },
];

function randomCargoCode() {
  const company = CARGO_COMPANIES[Math.floor(Math.random() * CARGO_COMPANIES.length)];
  const digits = Math.floor(100000000 + Math.random() * 900000000);
  return { company: company.name, code: `${company.prefix}${digits}` };
}

function normalizeReturnSelection(returnItems) {
  if (!Array.isArray(returnItems)) return [];
  return [...new Set(returnItems.map((item) => String(item || "").trim()).filter(Boolean))];
}

function getSelectedReturnItems(order) {
  const selected = new Set(normalizeReturnSelection(order.returnItems));
  if (selected.size === 0) return [];

  return order.items.filter((item) => {
    const productId = (item.productId?._id || item.productId)?.toString();
    return selected.has(productId) || selected.has(item.name);
  });
}

function calculateRefundAmount(items) {
  const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return Math.round(amount * 100) / 100;
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function normalizeCheckoutItems(items) {
  const byProduct = new Map();

  for (const item of items) {
    const productId = String(item.productId || item.id || item._id || "").trim();
    const quantity = Number(item.quantity);

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      return null;
    }

    byProduct.set(productId, (byProduct.get(productId) || 0) + quantity);
  }

  return [...byProduct.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

function calculateOrderTotals(items) {
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = roundMoney(subtotal * TAX_RATE);
  const total = roundMoney(subtotal + shipping + tax);

  return { subtotal, shipping, tax, total };
}

function getItemRevenue(item) {
  return Number(item.price || 0) * Number(item.quantity || 0);
}

function getItemCost(item) {
  const storedCost = item.cost === undefined || item.cost === null ? NaN : Number(item.cost);
  const fallbackCost = Number(item.productId?.cost || 0);
  const unitCost = Number.isFinite(storedCost) ? storedCost : fallbackCost;
  return unitCost * Number(item.quantity || 0);
}

function toChartDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function getReturnedItemTotals(order) {
  if (order.returnStatus !== "refunded") {
    return { revenue: 0, cost: 0, units: 0 };
  }

  const returnedItems = getSelectedReturnItems(order);
  if (returnedItems.length === 0) {
    return {
      revenue: Number(order.returnRefundAmount || 0),
      cost: 0,
      units: 0,
    };
  }

  return returnedItems.reduce(
    (totals, item) => ({
      revenue: totals.revenue + getItemRevenue(item),
      cost: totals.cost + getItemCost(item),
      units: totals.units + Number(item.quantity || 0),
    }),
    { revenue: 0, cost: 0, units: 0 }
  );
}

function emptyAnalyticsSummary(startDate, endDate) {
  return {
    startDate: startDate || null,
    endDate: endDate || null,
    revenue: 0,
    cost: 0,
    profit: 0,
    orderCount: 0,
    unitsSold: 0,
    points: [],
  };
}

function isDiscountActive(product, now = new Date()) {
  if (!product || !product.discountRate || !product.discountedPrice) return false;
  if (product.discountStartDate && new Date(product.discountStartDate) > now) return false;
  if (product.discountEndDate && new Date(product.discountEndDate) < now) return false;
  return true;
}

function getCheckoutPrice(product) {
  return isDiscountActive(product) ? product.discountedPrice : product.price;
}

function buildDateRangeFilter(startDate, endDate) {
  const createdAt = {};

  if (startDate) {
    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) return null;
    start.setHours(0, 0, 0, 0);
    createdAt.$gte = start;
  }

  if (endDate) {
    const end = new Date(endDate);
    if (Number.isNaN(end.getTime())) return null;
    end.setHours(23, 59, 59, 999);
    createdAt.$lte = end;
  }

  if (createdAt.$gte && createdAt.$lte && createdAt.$gte > createdAt.$lte) {
    return null;
  }

  return Object.keys(createdAt).length ? { createdAt } : {};
}

exports.createOrder = async (req, res) => {
  const decrementedItems = [];

  try {
    const { items, paymentMethod, cardLast4, deliveryAddress } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Order must have at least one item" });

    const checkoutItems = normalizeCheckoutItems(items);
    if (!checkoutItems)
      return res.status(400).json({ message: "Order items must include valid productId and quantity." });

    const orderItems = [];

    for (const item of checkoutItems) {
      const product = await Product.findById(item.productId);
      if (!product)
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      if (product.quantity < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for: ${product.name}` });

      orderItems.push({
        productId: item.productId,
        name: product.name,
        price: getCheckoutPrice(product),
        cost: product.cost || 0,
        quantity: item.quantity,
      });
    }

    for (const item of orderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        for (const decremented of decrementedItems) {
          await Product.findByIdAndUpdate(decremented.productId, {
            $inc: { quantity: decremented.quantity },
          });
        }
        return res.status(400).json({ message: `Insufficient stock for: ${item.name}` });
      }

      decrementedItems.push({ productId: item.productId, quantity: item.quantity });
    }

    const { subtotal, shipping, tax, total } = calculateOrderTotals(orderItems);

    const order = await Order.create({
      userId, items: orderItems, subtotal, shipping, tax, total,
      paymentMethod, cardLast4, deliveryAddress, status: "processing",
    });

    try {
      const User = require("../models/User");
      const user = await User.findById(userId);
      if (user) await sendInvoiceEmail(user.email, order, user.name);
    } catch (emailErr) {
      console.error("Invoice email error:", emailErr.message);
    }

    res.status(201).json(order);
  } catch (err) {
    for (const decremented of decrementedItems) {
      try {
        await Product.findByIdAndUpdate(decremented.productId, {
          $inc: { quantity: decremented.quantity },
        });
      } catch (rollbackErr) {
        console.error("Stock rollback error:", rollbackErr.message);
      }
    }
    res.status(500).json({ message: err.message });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate("userId", "name email");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRefundRequests = async (req, res) => {
  try {
    const orders = await Order.find({ returnStatus: { $ne: null } })
      .sort({ returnRequestedAt: -1, createdAt: -1 })
      .populate("userId", "name email");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSalesInvoices = async (req, res) => {
  try {
    const dateFilter = buildDateRangeFilter(req.query.startDate, req.query.endDate);
    if (dateFilter === null) {
      return res.status(400).json({ message: "Invalid invoice date range" });
    }

    const orders = await Order.find(dateFilter)
      .sort({ createdAt: -1 })
      .populate("userId", "name email");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateRangeFilter(startDate, endDate);
    if (dateFilter === null) {
      return res.status(400).json({ message: "Invalid analytics date range" });
    }

    const orders = await Order.find({
      ...dateFilter,
      status: { $ne: "cancelled" },
    })
      .sort({ createdAt: 1 })
      .populate("items.productId", "cost");

    const summary = emptyAnalyticsSummary(startDate, endDate);
    const byDate = new Map();

    for (const order of orders) {
      const soldTotals = order.items.reduce(
        (totals, item) => ({
          revenue: totals.revenue + getItemRevenue(item),
          cost: totals.cost + getItemCost(item),
          units: totals.units + Number(item.quantity || 0),
        }),
        { revenue: 0, cost: 0, units: 0 }
      );
      const returnedTotals = getReturnedItemTotals(order);
      const revenue = roundMoney(soldTotals.revenue - returnedTotals.revenue);
      const cost = roundMoney(soldTotals.cost - returnedTotals.cost);
      const units = Math.max(0, soldTotals.units - returnedTotals.units);
      const profit = roundMoney(revenue - cost);
      const date = toChartDate(order.createdAt);

      summary.revenue = roundMoney(summary.revenue + revenue);
      summary.cost = roundMoney(summary.cost + cost);
      summary.profit = roundMoney(summary.profit + profit);
      summary.unitsSold += units;
      summary.orderCount += 1;

      const point = byDate.get(date) || { date, revenue: 0, cost: 0, profit: 0 };
      point.revenue = roundMoney(point.revenue + revenue);
      point.cost = roundMoney(point.cost + cost);
      point.profit = roundMoney(point.profit + profit);
      byDate.set(date, point);
    }

    summary.points = [...byDate.values()];
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSalesInvoicePdf = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("userId", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const pdfBuffer = await generateInvoicePdf(order, order.userId?.name);
    const disposition = req.query.download === "true" ? "attachment" : "inline";
    const filename = `${order.invoiceNumber || order._id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId.toString() !== req.user.id && req.user.role === "customer")
      return res.status(403).json({ message: "Forbidden" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.advanceStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "cancelled")
      return res.status(400).json({ message: "Cancelled orders cannot be advanced." });

    const currentIndex = STATUS_SEQUENCE.indexOf(order.status);
    if (currentIndex === STATUS_SEQUENCE.length - 1)
      return res.status(400).json({ message: "Order already delivered" });

    order.status = STATUS_SEQUENCE[currentIndex + 1];
    if (order.status === "delivered") order.deliveredAt = new Date();
    await order.save();

    try {
      const User = require("../models/User");
      const user = await User.findById(order.userId);
      if (user) await sendStatusEmail(user.email, order, user.name);
    } catch (emailErr) {
      console.error("Status email error:", emailErr.message);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });
    if (order.status !== "processing")
      return res.status(400).json({ message: "Only orders in processing can be cancelled." });

    order.status = "cancelled";
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: item.quantity } });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.requestReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });
    if (order.status !== "delivered")
      return res.status(400).json({ message: "Only delivered orders can be returned." });
    if (order.returnStatus)
      return res.status(400).json({ message: "A return has already been requested for this order." });

    const deliveryDate = order.deliveredAt || order.updatedAt;
    const daysSinceDelivery = (Date.now() - new Date(deliveryDate)) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 30)
      return res.status(400).json({ message: "Return window has expired (30 days)." });

    const { returnItems, returnReason, returnPhoto } = req.body;
    const selectedReturnItems = normalizeReturnSelection(returnItems);
    if (selectedReturnItems.length === 0) {
      return res.status(400).json({ message: "Select at least one item to return." });
    }

    const selected = new Set(selectedReturnItems);
    const hasValidSelection = order.items.some((item) => {
      const productId = item.productId?.toString();
      return selected.has(productId) || selected.has(item.name);
    });

    if (!hasValidSelection) {
      return res.status(400).json({ message: "Selected return items are not in this order." });
    }

    const { company, code } = randomCargoCode();

    order.returnStatus = "requested";
    order.returnCargoCode = code;
    order.returnCargoCompany = company;
    order.returnItems = selectedReturnItems;
    order.returnReason = returnReason || "";
    order.returnPhoto = returnPhoto || null;
    order.returnRequestedAt = new Date();
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.returnStatus !== "requested")
      return res.status(400).json({ message: "No pending return request." });

    const returnedItems = getSelectedReturnItems(order);
    if (returnedItems.length === 0)
      return res.status(400).json({ message: "No valid returned items selected." });

    order.returnStatus = "approved";
    order.returnApprovedAt = new Date();
    order.returnRefundAmount = calculateRefundAmount(returnedItems);
    await order.save();
    await order.populate("userId", "name email");

    try {
      const user = order.userId;
      if (user?.email) await sendReturnEmail(user.email, order, user.name, "approved");
    } catch (e) { console.error("Return approval email error:", e.message); }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectReturn = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.returnStatus !== "requested")
      return res.status(400).json({ message: "No pending return request." });

    order.returnStatus = "rejected";
    order.returnRejectionReason = rejectionReason || "";
    await order.save();
    await order.populate("userId", "name email");

    try {
      const user = order.userId;
      if (user?.email) await sendReturnEmail(user.email, order, user.name, "rejected", rejectionReason);
    } catch (e) { console.error("Return rejection email error:", e.message); }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.refundReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.returnStatus !== "approved")
      return res.status(400).json({ message: "Only approved returns can be refunded." });

    const returnedItems = getSelectedReturnItems(order);
    if (returnedItems.length === 0)
      return res.status(400).json({ message: "No valid returned items selected." });

    for (const item of returnedItems) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: item.quantity } });
    }

    order.returnStatus = "refunded";
    order.returnRefundAmount = order.returnRefundAmount || calculateRefundAmount(returnedItems);
    order.returnRefundedAt = new Date();
    await order.save();
    await order.populate("userId", "name email");

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

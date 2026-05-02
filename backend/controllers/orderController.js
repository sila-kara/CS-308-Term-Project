const Order = require("../models/Order");
const Product = require("../models/Product");
const sendInvoiceEmail = require("../utils/sendInvoiceEmail");
const sendStatusEmail = require("../utils/sendStatusEmail");
const sendReturnEmail = require("../utils/sendReturnEmail");

const STATUS_SEQUENCE = ["processing", "in-transit", "delivered"];

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

exports.createOrder = async (req, res) => {
  try {
    const { items, subtotal, shipping, tax, total, paymentMethod, cardLast4, deliveryAddress } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Order must have at least one item" });

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product)
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      if (product.quantity < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for: ${product.name}` });
    }

    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: -item.quantity } });
    }

    const order = await Order.create({
      userId, items, subtotal, shipping: shipping || 0, tax, total,
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

    const daysSinceDelivery = (Date.now() - new Date(order.updatedAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 30)
      return res.status(400).json({ message: "Return window has expired (30 days)." });

    const { returnItems, returnReason, returnPhoto } = req.body;
    const { company, code } = randomCargoCode();

    order.returnStatus = "requested";
    order.returnCargoCode = code;
    order.returnCargoCompany = company;
    order.returnItems = returnItems || [];
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

    order.returnStatus = "approved";
    await order.save();

    // Restore stock for returned items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: item.quantity } });
    }

    try {
      const User = require("../models/User");
      const user = await User.findById(order.userId);
      if (user) await sendReturnEmail(user.email, order, user.name, "approved");
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

    try {
      const User = require("../models/User");
      const user = await User.findById(order.userId);
      if (user) await sendReturnEmail(user.email, order, user.name, "rejected", rejectionReason);
    } catch (e) { console.error("Return rejection email error:", e.message); }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

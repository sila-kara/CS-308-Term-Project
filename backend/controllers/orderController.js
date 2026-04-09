const Order = require("../models/Order");
const Product = require("../models/Product");

const STATUS_SEQUENCE = ["processing", "in-transit", "delivered"];

exports.createOrder = async (req, res) => {
  try {
    const { items, subtotal, tax, total, paymentMethod, cardLast4, deliveryAddress } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Order must have at least one item" });

    // Decrement stock for each item; abort if any product has insufficient stock
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
      userId,
      items,
      subtotal,
      tax,
      total,
      paymentMethod,
      cardLast4,
      deliveryAddress,
      status: "processing",
    });

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

    const currentIndex = STATUS_SEQUENCE.indexOf(order.status);
    if (currentIndex === STATUS_SEQUENCE.length - 1)
      return res.status(400).json({ message: "Order already delivered" });

    order.status = STATUS_SEQUENCE[currentIndex + 1];
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

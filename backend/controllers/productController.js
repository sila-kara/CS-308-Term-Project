const Product = require("../models/Product");

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function isDiscountActive(product, now = new Date()) {
  if (!product || !product.discountRate || !product.discountedPrice) return false;
  if (product.discountStartDate && new Date(product.discountStartDate) > now) return false;
  if (product.discountEndDate && new Date(product.discountEndDate) < now) return false;
  return true;
}

function withPricingView(product) {
  const plain = typeof product.toObject === "function" ? product.toObject() : product;
  const active = isDiscountActive(plain);
  return {
    ...plain,
    isDiscountActive: active,
    effectivePrice: active ? plain.discountedPrice : plain.price,
  };
}

exports.getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    const sortMap = {
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      popularity: { rating: -1 },
    };

    const sortOption = sortMap[sort] || {};

    const products = await Product.find(filter)
      .populate("category")
      .sort(sortOption);

    res.json(products.map(withPricingView));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(withPricingView(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePricing = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const {
      price,
      cost,
      discountRate,
      discountStartDate,
      discountEndDate,
    } = req.body;

    if (price == null || Number(price) < 0) {
      return res.status(400).json({ message: "Valid price required" });
    }

    const numericPrice = roundMoney(Number(price));
    const numericCost = cost == null || cost === "" ? 0 : roundMoney(Number(cost));
    const numericDiscountRate =
      discountRate == null || discountRate === "" ? 0 : Number(discountRate);

    if (Number.isNaN(numericCost) || numericCost < 0) {
      return res.status(400).json({ message: "Valid cost required" });
    }

    if (
      Number.isNaN(numericDiscountRate) ||
      numericDiscountRate < 0 ||
      numericDiscountRate > 100
    ) {
      return res.status(400).json({ message: "Discount rate must be between 0 and 100" });
    }

    const startDate = discountStartDate ? new Date(discountStartDate) : null;
    const endDate = discountEndDate ? new Date(discountEndDate) : null;

    if (startDate && Number.isNaN(startDate.getTime())) {
      return res.status(400).json({ message: "Invalid discount start date" });
    }

    if (endDate && Number.isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid discount end date" });
    }

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({ message: "Discount start date must be before end date" });
    }

    product.price = numericPrice;
    product.cost = numericCost;
    product.discountRate = numericDiscountRate;
    product.discountedPrice =
      numericDiscountRate > 0
        ? roundMoney(numericPrice * (1 - numericDiscountRate / 100))
        : null;
    product.discountStartDate = startDate;
    product.discountEndDate = endDate;

    await product.save();
    await product.populate("category");

    res.json(withPricingView(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      model,
      serialNumber,
      description,
      category,
      quantity,
      warranty,
      distributor,
      author,
      image,
    } = req.body;

    const product = await Product.create({
      name,
      model,
      serialNumber,
      description,
      category,
      quantity,
      warranty,
      distributor,
      author,
      image,
      price: 0,
      cost: 0,
      discountRate: 0,
      discountedPrice: null,
      discountStartDate: null,
      discountEndDate: null,
    });
    await product.populate("category");
    res.status(201).json(withPricingView(product));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity == null || quantity < 0) {
      return res.status(400).json({ message: "Valid quantity required" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true }
    ).populate("category");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(withPricingView(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

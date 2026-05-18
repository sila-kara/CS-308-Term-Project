const User = require("../models/User");

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

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    res.json(user.wishlist.map(withPricingView));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.wishlist.includes(req.params.productId))
      return res.status(400).json({ message: "Already in wishlist" });
    user.wishlist.push(req.params.productId);
    await user.save();
    res.json({ message: "Added to wishlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== req.params.productId
    );
    await user.save();
    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const User = require("../models/User");

exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("notifications")
      .populate("notifications.product", "name image price discountedPrice discountRate");

    if (!user) return res.status(404).json({ message: "User not found" });

    const notifications = [...(user.notifications || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEmailPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("emailPreferences");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      wishlistDiscounts: Boolean(user.emailPreferences?.wishlistDiscounts),
      wishlistRestock: Boolean(user.emailPreferences?.wishlistRestock),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEmailPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.emailPreferences) {
      user.emailPreferences = {};
    }

    if (req.body.wishlistDiscounts !== undefined) {
      user.emailPreferences.wishlistDiscounts = Boolean(req.body.wishlistDiscounts);
    }
    if (req.body.wishlistRestock !== undefined) {
      user.emailPreferences.wishlistRestock = Boolean(req.body.wishlistRestock);
    }

    await user.save();
    res.json({
      wishlistDiscounts: Boolean(user.emailPreferences?.wishlistDiscounts),
      wishlistRestock: Boolean(user.emailPreferences?.wishlistRestock),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const notification = user.notifications.id(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await user.save();
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.notifications.forEach((notification) => {
      notification.read = true;
    });
    await user.save();
    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

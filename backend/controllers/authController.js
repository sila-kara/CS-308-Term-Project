const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { encrypt, decrypt } = require("../utils/encrypt");

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, taxId, address } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "name, email and password are required" });

    if (await User.findOne({ email }))
      return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, taxId: encrypt(taxId), address });

    res.status(201).json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "No account found with this email. Please create an account." });
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Incorrect password. Please try again." });

    res.json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with this email." });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"BookWorld" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your BookWorld password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
          <div style="background:#1e3a8a;padding:20px 28px;border-radius:8px 8px 0 0">
            <h2 style="margin:0;color:#fff;font-size:18px">BookWorld — Password Reset</h2>
          </div>
          <div style="background:#f8fafc;padding:24px 28px">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>We received a request to reset your password. Click the button below to set a new one. This link expires in <strong>1 hour</strong>.</p>
            <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">Reset my password</a>
            <p style="font-size:12px;color:#94a3b8">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });

    res.json({ message: "Password reset email sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token and new password are required." });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired reset link." });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    const userData = user.toObject();
    if (userData.taxId) userData.taxId = decrypt(userData.taxId);
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, address, avatar, taxId, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (address !== undefined) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;
    if (taxId !== undefined) user.taxId = encrypt(taxId);

    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ message: "Current password is required." });
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match)
        return res.status(400).json({ message: "Current password is incorrect." });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    const { password: _, ...safe } = user.toObject();
    if (safe.taxId) safe.taxId = decrypt(safe.taxId);
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

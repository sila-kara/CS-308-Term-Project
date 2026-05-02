const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function requireRole(...roles) {
  return async (req, res, next) => {
    try {
      const User = require("../models/User");
      const user = await User.findById(req.user?.id).select("role");
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user.role = user.role; // keep in sync
      next();
    } catch {
      return res.status(500).json({ message: "Auth error" });
    }
  };
}

module.exports = { authMiddleware, requireRole };

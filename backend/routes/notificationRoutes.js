const router = require("express").Router();
const {
  getEmailPreferences,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateEmailPreferences,
} = require("../controllers/notificationController");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, getNotifications);
router.get("/preferences", authMiddleware, getEmailPreferences);
router.patch("/preferences", authMiddleware, updateEmailPreferences);
router.patch("/read-all", authMiddleware, markAllNotificationsRead);
router.patch("/:id/read", authMiddleware, markNotificationRead);

module.exports = router;

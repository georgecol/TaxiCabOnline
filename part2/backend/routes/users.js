const express = require("express");
const { getDB } = require("../db/mongo");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await getDB()
      .collection("users")
      .find(query, { projection: { password: 0 } })
      .sort({ created_at: -1 })
      .toArray();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

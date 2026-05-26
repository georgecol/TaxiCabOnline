const express = require("express");
const { getDB } = require("../db/mongo");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const drivers = await getDB()
      .collection("users")
      .find({ role: "driver" }, { projection: { password: 0 } })
      .toArray();
    res.json({ success: true, data: drivers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

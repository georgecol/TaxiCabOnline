const express = require("express");
const { ObjectId } = require("mongodb");
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

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    let target;
    try {
      target = await getDB().collection("users").findOne({ _id: new ObjectId(id) });
    } catch {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    if (!target) return res.status(404).json({ success: false, message: "User not found" });
    if (target.username === req.user.username) {
      return res.status(403).json({ success: false, message: "Cannot delete your own account" });
    }

    await getDB().collection("users").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true, message: `Account "${target.username}" deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

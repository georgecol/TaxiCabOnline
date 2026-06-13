const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../db/mongo");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password required" });
    }

    const user = await getDB().collection("users").findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      token,
      username: user.username,
      role: user.role,
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, password, name, phone, email } = req.body;

    if (!username || !password || !name || !phone || !email) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const phoneRegex = /^\d{10,12}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return res.status(400).json({ success: false, message: "Phone must be 10–12 digits" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }

    const collection = getDB().collection("users");
    const existing = await collection.findOne({ username });
    if (existing) {
      return res.status(409).json({ success: false, message: "Username already taken" });
    }

    const hash = await bcrypt.hash(password, 10);
    await collection.insertOne({
      username,
      password: hash,
      role: "testuser",
      name,
      phone,
      email: email.trim().toLowerCase(),
      created_at: new Date(),
    });

    const token = jwt.sign(
      { username, role: "testuser" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(201).json({ success: true, token, username, role: "testuser", name, phone, email: email.trim().toLowerCase() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Name and phone are required" });
    }

    const phoneRegex = /^\d{10,12}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return res.status(400).json({ success: false, message: "Phone must be 10–12 digits" });
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: "Invalid email address" });
      }
    }

    const update = { name, phone };
    if (email !== undefined) update.email = email.trim().toLowerCase();

    await getDB().collection("users").updateOne(
      { username: req.user.username },
      { $set: update }
    );

    res.json({ success: true, name, phone, email: update.email ?? "" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

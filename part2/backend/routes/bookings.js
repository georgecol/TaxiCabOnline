const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../db/mongo");
const { getNextBookingRef } = require("../services/bookingService");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE BOOKING
router.post("/", requireAuth, async (req, res) => {
  try {
    const collection = getDB().collection("bookings");

    const bookingRef = await getNextBookingRef();

    const newBooking = {
      ...req.body,
      username: req.user.username,
      booking_ref: bookingRef,
      status: "unassigned",
      created_at: new Date()
    };

    const result = await collection.insertOne(newBooking);

    // ✅ return full created object (IMPORTANT)
    res.status(201).json({
      success: true,
      message: "Booking created",
      data: {
        _id: result.insertedId,
        ...newBooking
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// GET MY BOOKINGS (current user, all time)
router.get("/my", requireAuth, async (req, res) => {
  try {
    const bookings = await getDB()
      .collection("bookings")
      .find({ username: req.user.username })
      .sort({ pickup_date: -1, pickup_time: -1 })
      .toArray();

    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET BOOKINGS (filtered + time rule)
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const collection = getDB().collection("bookings");

    const { ref } = req.query;

    let query = {};

    /**
     * -----------------------------
     * 1. EXACT or RANGE FILTER
     * -----------------------------
     */
    if (ref) {
      // RANGE: "BRN00001-BRN00010"
      if (ref.includes("-")) {
        const [startRef, endRef] = ref.split("-").map((r) => r.trim());

        query.booking_ref = {
          $gte: startRef,
          $lte: endRef,
        };
      }

      // PARTIAL MATCH: "BRN000"
      else if (ref.length < 8) {
        query.booking_ref = {
          $regex: `^${ref}`,
        };
      }

      // EXACT MATCH
      else {
        query.booking_ref = ref;
      }
    }

    const bookings = await collection.find(query).toArray();

    // Only apply the 2-hour window filter on the default load (no ref search)
    const data = ref ? bookings : bookings.filter((b) => {
      if (!b.pickup_date || !b.pickup_time) return false;

      const pickupDateTime = new Date(`${b.pickup_date}T${b.pickup_time}`);
      const now = new Date();
      const diffMs = pickupDateTime - now;

      return diffMs >= 0 && diffMs <= 2 * 60 * 60 * 1000;
    });

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ASSIGN BOOKING
router.patch("/:id/assign", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    let driver;
    try {
      driver = await getDB().collection("users").findOne(
        { _id: new ObjectId(driverId), role: "driver" },
        { projection: { password: 0 } }
      );
    } catch {
      return res.status(400).json({ success: false, message: "Invalid driver ID" });
    }

    if (!driver) return res.status(404).json({ success: false, message: "Driver not found" });

    const result = await getDB().collection("bookings").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "assigned",
          driver_id: driver._id,
          driver_name: driver.name,
          driver_phone: driver.phone,
          driver_username: driver.username,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, message: `Assigned to ${driver.name}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// EDIT BOOKING (owner only, unassigned only)
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const collection = getDB().collection("bookings");
    const { id } = req.params;

    let existing;
    try {
      existing = await collection.findOne({ _id: new ObjectId(id) });
    } catch {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    if (!existing) return res.status(404).json({ success: false, message: "Booking not found" });
    if (existing.username !== req.user.username) return res.status(403).json({ success: false, message: "Not your booking" });
    if (existing.status === "assigned") return res.status(409).json({ success: false, message: "Cannot edit an assigned booking" });

    const { cname, phone, pickup_address, pickup_lat, pickup_lng, dest_address, dest_lat, dest_lng, pickup_date, pickup_time } = req.body;

    const update = { cname, phone, pickup_address, pickup_lat, pickup_lng, dest_address, dest_lat, dest_lng, pickup_date, pickup_time };
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: update });

    const updated = await collection.findOne({ _id: new ObjectId(id) });

    res.json({ success: true, message: "Booking updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
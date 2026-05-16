const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../db/mongo");
const { getNextBookingRef } = require("../services/bookingService");

const router = express.Router();

// CREATE BOOKING
router.post("/", async (req, res) => {
  try {
    const collection = getDB().collection("bookings");

    const bookingRef = await getNextBookingRef();

    const newBooking = {
      ...req.body,
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

// GET BOOKINGS (filtered + time rule)
router.get("/", async (req, res) => {
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

    /**
     * -----------------------------
     * 2. TIME FILTER (2 hour rule)
     * -----------------------------
     */
    const now = new Date();

    const filtered = bookings.filter((b) => {
      if (!b.pickup_date || !b.pickup_time) return false;

      const pickupDateTime = new Date(`${b.pickup_date}T${b.pickup_time}`);

      const isSameDay =
        pickupDateTime.toDateString() === now.toDateString();

      if (!isSameDay) return false;

      const diffHours =
        Math.abs(pickupDateTime - now) / (1000 * 60 * 60);

      return diffHours <= 2;
    });

    res.json({
      success: true,
      data: filtered,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ASSIGN BOOKING
router.patch("/:id/assign", async (req, res) => {
  try {
    const collection = getDB().collection("bookings");
    const { id } = req.params;
    const { ref } = req.body;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "assigned",
          driver_ref: ref,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      message: "Booking assigned",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
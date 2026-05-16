const { client, getDB } = require("../db/mongo");

async function getNextBookingRef() {
  const counter = await client
    .db("TaxiCabOnline")
    .collection("counters")
    .findOneAndUpdate(
      { _id: "booking_ref" },
      {
        $inc: { seq: 1 },
        $setOnInsert: { seq: 1 }
      },
      {
        upsert: true,
        returnDocument: "after"
      }
    );

  const num = counter.value.seq;

  return `BRN${String(num).padStart(5, "0")}`;
}

module.exports = { getNextBookingRef };